import { Admin, Resource } from 'react-admin';
import { useTranslation } from 'react-i18next';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';
import { Dashboard } from './Dashboard';

import { UserList, UserEdit, UserShow } from './resources/users';
import { PointList, PointEdit, PointShow, PointCreate } from './resources/points';
import { CategoryList, CategoryEdit, CategoryShow, CategoryCreate } from './resources/categories';
import { ContainerList, ContainerEdit, ContainerShow, ContainerCreate } from './resources/containers';
import { ReportList, ReportEdit, ReportShow } from './resources/reports';

const AdminApp = () => {
  const { t } = useTranslation('common');

  return (
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
        options={{ label: t('admin.nav.users') }}
      />
      <Resource 
        name="points" 
        list={PointList} 
        edit={PointEdit} 
        show={PointShow}
        create={PointCreate}
        options={{ label: t('admin.nav.points') }}
      />
      <Resource 
        name="categories" 
        list={CategoryList} 
        edit={CategoryEdit} 
        show={CategoryShow}
        create={CategoryCreate}
        options={{ label: t('admin.nav.categories') }}
      />
      <Resource 
        name="containers" 
        list={ContainerList} 
        edit={ContainerEdit} 
        show={ContainerShow}
        create={ContainerCreate}
        options={{ label: t('admin.nav.containers') }}
      />
      <Resource 
        name="reports" 
        list={ReportList} 
        edit={ReportEdit} 
        show={ReportShow}
        options={{ label: t('admin.nav.reports') }}
      />
    </Admin>
  );
};

export default AdminApp;