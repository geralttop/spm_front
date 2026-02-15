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

export const UserList = () => (
  <List>
    <Datagrid>
      <TextField source="id" label="ID" />
      <TextField source="username" label="Имя пользователя" />
      <EmailField source="email" label="Email" />
      <TextField source="role" label="Роль" />
      <BooleanField source="isEmailVerified" label="Email подтвержден" />
      <DateField source="createdAt" label="Дата создания" showTime />
      <EditButton />
      <ShowButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const UserEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="username" label="Имя пользователя" />
      <TextInput source="email" label="Email" type="email" />
      <SelectInput 
        source="role" 
        label="Роль"
        choices={[
          { id: 'user', name: 'Пользователь' },
          { id: 'admin', name: 'Администратор' },
        ]}
      />
      <BooleanInput source="isEmailVerified" label="Email подтвержден" />
      <TextInput source="bio" label="Биография" multiline />
    </SimpleForm>
  </Edit>
);

export const UserShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <TextField source="username" label="Имя пользователя" />
      <EmailField source="email" label="Email" />
      <TextField source="role" label="Роль" />
      <BooleanField source="isEmailVerified" label="Email подтвержден" />
      <TextField source="bio" label="Биография" />
      <DateField source="createdAt" label="Дата создания" showTime />
      <DateField source="updatedAt" label="Дата обновления" showTime />
    </SimpleShowLayout>
  </Show>
);