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

export const CategoryList = () => (
  <List>
    <Datagrid>
      <TextField source="id" label="ID" />
      <TextField source="name" label="Название" />
      <TextField source="icon" label="Иконка" />
      <TextField source="color" label="Цвет" />
      <ReferenceField source="authorId" reference="users" label="Автор" emptyText="Системная">
        <TextField source="username" />
      </ReferenceField>
      <EditButton />
      <ShowButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const CategoryEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" label="Название" />
      <TextInput source="icon" label="Иконка" />
      <TextInput source="color" label="Цвет" />
    </SimpleForm>
  </Edit>
);

export const CategoryCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" label="Название" />
      <TextInput source="icon" label="Иконка" />
      <TextInput source="color" label="Цвет" defaultValue="#000000" />
    </SimpleForm>
  </Create>
);

export const CategoryShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <TextField source="name" label="Название" />
      <TextField source="icon" label="Иконка" />
      <TextField source="color" label="Цвет" />
      <ReferenceField source="authorId" reference="users" label="Автор" emptyText="Системная">
        <TextField source="username" />
      </ReferenceField>
    </SimpleShowLayout>
  </Show>
);