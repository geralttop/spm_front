import {
  List,
  Datagrid,
  TextField,
  DateField,
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

export const ContainerList = () => {
  const { t } = useTranslation('common');
  return (
    <List>
      <Datagrid>
        <TextField source="id" label={t('admin.containers.id')} />
        <TextField source="title" label={t('admin.containers.title')} />
        <TextField source="description" label={t('admin.containers.description')} />
        <TextField source="color" label={t('admin.containers.color')} />
        <ReferenceField source="authorId" reference="users" label={t('admin.containers.author')}>
          <TextField source="username" />
        </ReferenceField>
        <DateField source="createdAt" label={t('admin.containers.createdAt')} showTime />
        <EditButton />
        <ShowButton />
        <DeleteButton />
      </Datagrid>
    </List>
  );
};

export const ContainerEdit = () => {
  const { t } = useTranslation('common');
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="title" label={t('admin.containers.title')} />
        <TextInput source="description" label={t('admin.containers.description')} multiline />
        <TextInput source="color" label={t('admin.containers.color')} />
      </SimpleForm>
    </Edit>
  );
};

export const ContainerCreate = () => {
  const { t } = useTranslation('common');
  return (
    <Create>
      <SimpleForm>
        <TextInput source="title" label={t('admin.containers.title')} />
        <TextInput source="description" label={t('admin.containers.description')} multiline />
        <TextInput source="color" label={t('admin.containers.color')} defaultValue="#3B82F6" />
      </SimpleForm>
    </Create>
  );
};

export const ContainerShow = () => {
  const { t } = useTranslation('common');
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" label={t('admin.containers.id')} />
        <TextField source="title" label={t('admin.containers.title')} />
        <TextField source="description" label={t('admin.containers.description')} />
        <TextField source="color" label={t('admin.containers.color')} />
        <ReferenceField source="authorId" reference="users" label={t('admin.containers.author')}>
          <TextField source="username" />
        </ReferenceField>
        <DateField source="createdAt" label={t('admin.containers.createdAt')} showTime />
      </SimpleShowLayout>
    </Show>
  );
};