import {
  List,
  Datagrid,
  TextField,
  Edit,
  SimpleForm,
  TextInput,
  Create,
  Show,
  SimpleShowLayout,
  EditButton,
  ShowButton,
  DeleteButton,
  ReferenceField,
} from 'react-admin';
import { useTranslation } from 'react-i18next';

export const CategoryList = () => {
  const { t } = useTranslation();
  
  return (
    <List>
      <Datagrid>
        <TextField source="id" label={t('admin.categories.id')} />
        <TextField source="name" label={t('admin.categories.name')} />
        <TextField source="color" label={t('admin.categories.color')} />
        <ReferenceField source="authorId" reference="users" label={t('admin.categories.author')} emptyText={t('admin.categories.system')}>
          <TextField source="username" />
        </ReferenceField>
        <EditButton />
        <ShowButton />
        <DeleteButton />
      </Datagrid>
    </List>
  );
};

export const CategoryEdit = () => {
  const { t } = useTranslation();
  
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="name" label={t('admin.categories.name')} />
        <TextInput source="color" label={t('admin.categories.color')} />
      </SimpleForm>
    </Edit>
  );
};

export const CategoryCreate = () => {
  const { t } = useTranslation();
  
  return (
    <Create>
      <SimpleForm>
        <TextInput source="name" label={t('admin.categories.name')} />
        <TextInput source="color" label={t('admin.categories.color')} defaultValue="#000000" />
      </SimpleForm>
    </Create>
  );
};

export const CategoryShow = () => {
  const { t } = useTranslation();
  
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" label={t('admin.categories.id')} />
        <TextField source="name" label={t('admin.categories.name')} />
        <TextField source="color" label={t('admin.categories.color')} />
        <ReferenceField source="authorId" reference="users" label={t('admin.categories.author')} emptyText={t('admin.categories.system')}>
          <TextField source="username" />
        </ReferenceField>
      </SimpleShowLayout>
    </Show>
  );
};