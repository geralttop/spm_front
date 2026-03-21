import {
  List,
  Datagrid,
  TextField,
  EmailField,
  BooleanField,
  DateField,
  Edit,
  SimpleForm,
  TextInput,
  BooleanInput,
  SelectInput,
  Show,
  SimpleShowLayout,
  EditButton,
  ShowButton,
  DeleteButton,
} from 'react-admin';
import { useTranslation } from 'react-i18next';

export const UserList = () => {
  const { t } = useTranslation('common');
  return (
    <List>
      <Datagrid>
        <TextField source="id" label={t('admin.users.id')} />
        <TextField source="username" label={t('admin.users.username')} />
        <EmailField source="email" label={t('admin.users.email')} />
        <TextField source="role" label={t('admin.users.role')} />
        <BooleanField source="isEmailVerified" label={t('admin.users.emailVerified')} />
        <DateField source="createdAt" label={t('admin.users.createdAt')} showTime />
        <EditButton />
        <ShowButton />
        <DeleteButton />
      </Datagrid>
    </List>
  );
};

export const UserEdit = () => {
  const { t } = useTranslation('common');
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="username" label={t('admin.users.username')} />
        <TextInput source="email" label={t('admin.users.email')} type="email" />
        <SelectInput 
          source="role" 
          label={t('admin.users.role')}
          choices={[
            { id: 'user', name: t('admin.users.roleUser') },
            { id: 'admin', name: t('admin.users.roleAdmin') },
          ]}
        />
        <BooleanInput source="isEmailVerified" label={t('admin.users.emailVerified')} />
        <TextInput source="bio" label={t('admin.users.bio')} multiline />
      </SimpleForm>
    </Edit>
  );
};

export const UserShow = () => {
  const { t } = useTranslation('common');
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" label={t('admin.users.id')} />
        <TextField source="username" label={t('admin.users.username')} />
        <EmailField source="email" label={t('admin.users.email')} />
        <TextField source="role" label={t('admin.users.role')} />
        <BooleanField source="isEmailVerified" label={t('admin.users.emailVerified')} />
        <TextField source="bio" label={t('admin.users.bio')} />
        <DateField source="createdAt" label={t('admin.users.createdAt')} showTime />
        <DateField source="updatedAt" label={t('admin.users.updatedAt')} showTime />
      </SimpleShowLayout>
    </Show>
  );
};