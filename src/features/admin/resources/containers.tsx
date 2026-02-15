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

export const ContainerList = () => (
  <List>
    <Datagrid>
      <TextField source="id" label="ID" />
      <TextField source="title" label="Название" />
      <TextField source="description" label="Описание" />
      <ReferenceField source="authorId" reference="users" label="Автор">
        <TextField source="username" />
      </ReferenceField>
      <DateField source="createdAt" label="Дата создания" showTime />
      <EditButton />
      <ShowButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const ContainerEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="title" label="Название" />
      <TextInput source="description" label="Описание" multiline />
    </SimpleForm>
  </Edit>
);

export const ContainerCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" label="Название" />
      <TextInput source="description" label="Описание" multiline />
    </SimpleForm>
  </Create>
);

export const ContainerShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <TextField source="title" label="Название" />
      <TextField source="description" label="Описание" />
      <ReferenceField source="authorId" reference="users" label="Автор">
        <TextField source="username" />
      </ReferenceField>
      <DateField source="createdAt" label="Дата создания" showTime />
    </SimpleShowLayout>
  </Show>
);