import { Admin, Resource } from 'react-admin';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';
import { Dashboard } from './Dashboard';

// Импорты для ресурсов
import { UserList, UserEdit, UserShow } from './resources/users';
import { PointList, PointEdit, PointShow, PointCreate } from './resources/points';
import { CategoryList, CategoryEdit, CategoryShow, CategoryCreate } from './resources/categories';
import { ContainerList, ContainerEdit, ContainerShow, ContainerCreate } from './resources/containers';
import { ReportList, ReportEdit, ReportShow } from './resources/reports';

const AdminApp = () => (
  <Admin 
    dataProvider={dataProvider} 
    authProvider={authProvider}
    dashboard={Dashboard}
    title="SPM Admin"
  >
    <Resource 
      name="users" 
      list={UserList} 
      edit={UserEdit} 
      show={UserShow}
      options={{ label: 'Пользователи' }}
    />
    <Resource 
      name="points" 
      list={PointList} 
      edit={PointEdit} 
      show={PointShow}
      create={PointCreate}
      options={{ label: 'Точки' }}
    />
    <Resource 
      name="categories" 
      list={CategoryList} 
      edit={CategoryEdit} 
      show={CategoryShow}
      create={CategoryCreate}
      options={{ label: 'Категории' }}
    />
    <Resource 
      name="containers" 
      list={ContainerList} 
      edit={ContainerEdit} 
      show={ContainerShow}
      create={ContainerCreate}
      options={{ label: 'Контейнеры' }}
    />
    <Resource 
      name="reports" 
      list={ReportList} 
      edit={ReportEdit} 
      show={ReportShow}
      options={{ label: 'Жалобы' }}
    />
  </Admin>
);

export default AdminApp;