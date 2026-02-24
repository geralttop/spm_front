import { DataProvider, fetchUtils } from 'react-admin';
import { getApiUrl } from '@/shared/lib/utils/api-url';

const apiUrl = getApiUrl();

// Функция для получения токена из zustand store
const getAccessToken = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (!authStorage) return null;
    
    const parsed = JSON.parse(authStorage);
    return parsed?.state?.accessToken || null;
  } catch {
    return null;
  }
};

const httpClient = (url: string, options: any = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' });
  }
  
  const token = getAccessToken();
  if (token) {
    options.headers.set('Authorization', `Bearer ${token}`);
  }
  
  return fetchUtils.fetchJson(url, options);
};

export const dataProvider: DataProvider = {
  getList: (resource, params) => {
    const { page = 1, perPage = 10 } = params.pagination || {};
    const { field = 'id', order = 'ASC' } = params.sort || {};
    
    const query = {
      _start: ((page - 1) * perPage).toString(),
      _end: (page * perPage).toString(),
      _sort: field,
      _order: order,
    };
    
    const url = `${apiUrl}/admin/${resource}?${new URLSearchParams(query)}`;

    return httpClient(url).then(({ json }) => ({
      data: json.data,
      total: json.total,
    }));
  },

  getOne: (resource, params) =>
    httpClient(`${apiUrl}/admin/${resource}/${params.id}`).then(({ json }) => ({
      data: json,
    })),

  getMany: (resource, params) => {
    // Для простоты делаем несколько запросов
    const promises = params.ids.map(id => 
      httpClient(`${apiUrl}/admin/${resource}/${id}`)
    );
    
    return Promise.all(promises).then(responses => ({
      data: responses.map(({ json }) => json),
    }));
  },

  getManyReference: (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    
    const query = {
      _start: ((page - 1) * perPage).toString(),
      _end: (page * perPage).toString(),
      _sort: field,
      _order: order,
      [params.target]: params.id.toString(),
    };
    
    const url = `${apiUrl}/admin/${resource}?${new URLSearchParams(query)}`;

    return httpClient(url).then(({ json }) => ({
      data: json.data,
      total: json.total,
    }));
  },

  update: (resource, params) => {
    // Специальная обработка для жалоб с действиями
    if (resource === 'reports' && params.data.action) {
      const { action, ...otherData } = params.data;
      return httpClient(`${apiUrl}/admin/${resource}/${params.id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ action, adminNotes: otherData.adminNotes }),
      }).then(({ json }) => ({ data: json }));
    }
    
    return httpClient(`${apiUrl}/admin/${resource}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json }));
  },

  updateMany: (resource, params) => {
    const promises = params.ids.map(id =>
      httpClient(`${apiUrl}/admin/${resource}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(params.data),
      })
    );
    
    return Promise.all(promises).then(() => ({ data: params.ids }));
  },

  create: (resource, params) =>
    httpClient(`${apiUrl}/admin/${resource}`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({
      data: { ...params.data, id: json.id } as any,
    })),

  delete: (resource, params) =>
    httpClient(`${apiUrl}/admin/${resource}/${params.id}`, {
      method: 'DELETE',
    }).then(() => ({ data: { id: params.id } as any })),

  deleteMany: (resource, params) => {
    const promises = params.ids.map(id =>
      httpClient(`${apiUrl}/admin/${resource}/${id}`, {
        method: 'DELETE',
      })
    );
    
    return Promise.all(promises).then(() => ({ data: params.ids }));
  },
};