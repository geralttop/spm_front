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

export const PointList = () => (
  <List>
    <Datagrid>
      <TextField source="id" label="ID" />
      <TextField source="name" label="Название" />
      <TextField source="address" label="Адрес" />
      <ReferenceField source="authorId" reference="users" label="Автор">
        <TextField source="username" />
      </ReferenceField>
      <ReferenceField source="category.id" reference="categories" label="Категория">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="container.id" reference="containers" label="Контейнер">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="createdAt" label="Дата создания" showTime />
      <EditButton />
      <ShowButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const PointEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" label="Название" />
      <TextInput source="description" label="Описание" multiline />
      <TextInput source="address" label="Адрес" />
      <ReferenceInput source="category.id" reference="categories" label="Категория">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput source="container.id" reference="containers" label="Контейнер">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <NumberInput source="coords.coordinates[0]" label="Долгота" />
      <NumberInput source="coords.coordinates[1]" label="Широта" />
    </SimpleForm>
  </Edit>
);

export const PointCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" label="Название" />
      <TextInput source="description" label="Описание" multiline />
      <TextInput source="address" label="Адрес" />
      <ReferenceInput source="category.id" reference="categories" label="Категория">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput source="container.id" reference="containers" label="Контейнер">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <NumberInput source="coords.coordinates[0]" label="Долгота" />
      <NumberInput source="coords.coordinates[1]" label="Широта" />
    </SimpleForm>
  </Create>
);

export const PointShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <TextField source="name" label="Название" />
      <TextField source="description" label="Описание" />
      <TextField source="address" label="Адрес" />
      <ReferenceField source="authorId" reference="users" label="Автор">
        <TextField source="username" />
      </ReferenceField>
      <ReferenceField source="category.id" reference="categories" label="Категория">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="container.id" reference="containers" label="Контейнер">
        <TextField source="name" />
      </ReferenceField>
      <TextField source="coords.coordinates[0]" label="Долгота" />
      <TextField source="coords.coordinates[1]" label="Широта" />
      <DateField source="createdAt" label="Дата создания" showTime />
    </SimpleShowLayout>
  </Show>
);