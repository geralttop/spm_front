import type { AxiosInstance } from 'axios';

/**
 * Base API class that provides common CRUD operations
 * Reduces code duplication across API modules
 */
export class BaseApi<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  constructor(
    private endpoint: string,
    private client: AxiosInstance
  ) {}

  async getAll(params?: Record<string, any>): Promise<T[]> {
    const response = await this.client.get<T[]>(this.endpoint, { params });
    return response.data;
  }

  async getById(id: string | number): Promise<T> {
    const response = await this.client.get<T>(`${this.endpoint}/${id}`);
    return response.data;
  }

  async create(data: CreateDTO): Promise<T> {
    const response = await this.client.post<T>(this.endpoint, data);
    return response.data;
  }

  async update(id: string | number, data: UpdateDTO): Promise<T> {
    const response = await this.client.patch<T>(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  async delete(id: string | number): Promise<void> {
    await this.client.delete(`${this.endpoint}/${id}`);
  }
}
