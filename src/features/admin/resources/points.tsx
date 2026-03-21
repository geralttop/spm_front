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
  ReferenceInput,
  SelectInput,
  NumberInput,
} from 'react-admin';
import { useTranslation } from 'react-i18next';

export const PointList = () => {
  const { t } = useTranslation('common');
  return (
    <List>
      <Datagrid>
        <TextField source="id" label={t('admin.points.id')} />
        <TextField source="name" label={t('admin.points.name')} />
        <TextField source="address" label={t('admin.points.address')} />
        <ReferenceField source="authorId" reference="users" label={t('admin.points.author')}>
          <TextField source="username" />
        </ReferenceField>
        <ReferenceField source="category.id" reference="categories" label={t('admin.points.category')}>
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField source="container.id" reference="containers" label={t('admin.points.container')}>
          <TextField source="name" />
        </ReferenceField>
        <DateField source="createdAt" label={t('admin.points.createdAt')} showTime />
        <EditButton />
        <ShowButton />
        <DeleteButton />
      </Datagrid>
    </List>
  );
};

export const PointEdit = () => {
  const { t } = useTranslation('common');
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="name" label={t('admin.points.name')} />
        <TextInput source="description" label={t('admin.points.description')} multiline />
        <TextInput source="address" label={t('admin.points.address')} />
        <ReferenceInput source="category.id" reference="categories" label={t('admin.points.category')}>
          <SelectInput optionText="name" />
        </ReferenceInput>
        <ReferenceInput source="container.id" reference="containers" label={t('admin.points.container')}>
          <SelectInput optionText="name" />
        </ReferenceInput>
        <NumberInput source="coords.coordinates[0]" label={t('admin.points.longitude')} />
        <NumberInput source="coords.coordinates[1]" label={t('admin.points.latitude')} />
      </SimpleForm>
    </Edit>
  );
};

export const PointCreate = () => {
  const { t } = useTranslation('common');
  return (
    <Create>
      <SimpleForm>
        <TextInput source="name" label={t('admin.points.name')} />
        <TextInput source="description" label={t('admin.points.description')} multiline />
        <TextInput source="address" label={t('admin.points.address')} />
        <ReferenceInput source="category.id" reference="categories" label={t('admin.points.category')}>
          <SelectInput optionText="name" />
        </ReferenceInput>
        <ReferenceInput source="container.id" reference="containers" label={t('admin.points.container')}>
          <SelectInput optionText="name" />
        </ReferenceInput>
        <NumberInput source="coords.coordinates[0]" label={t('admin.points.longitude')} />
        <NumberInput source="coords.coordinates[1]" label={t('admin.points.latitude')} />
      </SimpleForm>
    </Create>
  );
};

export const PointShow = () => {
  const { t } = useTranslation('common');
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" label={t('admin.points.id')} />
        <TextField source="name" label={t('admin.points.name')} />
        <TextField source="description" label={t('admin.points.description')} />
        <TextField source="address" label={t('admin.points.address')} />
        <ReferenceField source="authorId" reference="users" label={t('admin.points.author')}>
          <TextField source="username" />
        </ReferenceField>
        <ReferenceField source="category.id" reference="categories" label={t('admin.points.category')}>
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField source="container.id" reference="containers" label={t('admin.points.container')}>
          <TextField source="name" />
        </ReferenceField>
        <TextField source="coords.coordinates[0]" label={t('admin.points.longitude')} />
        <TextField source="coords.coordinates[1]" label={t('admin.points.latitude')} />
        <DateField source="createdAt" label={t('admin.points.createdAt')} showTime />
      </SimpleShowLayout>
    </Show>
  );
};