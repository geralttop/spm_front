import {
  List,
  Datagrid,
  TextField,
  DateField,
  SelectField,
  Show,
  SimpleShowLayout,
  Edit,
  SimpleForm,
  SelectInput,
  TextInput,
  useRecordContext,
  FunctionField,
  Button,
  useNotify,
  useRefresh,
  ChipField,
  ReferenceField,
  BooleanField,
  useDataProvider,
} from 'react-admin';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { Flag, User, MessageSquare, MapPin, CheckCircle, XCircle } from 'lucide-react';
import React from 'react';

// Choices для статусов и причин
const statusChoices = [
  { id: 'pending', name: 'Ожидает рассмотрения' },
  { id: 'reviewed', name: 'Рассмотрена' },
  { id: 'resolved', name: 'Решена' },
  { id: 'dismissed', name: 'Отклонена' },
];

const reasonChoices = [
  { id: 'spam', name: 'Спам' },
  { id: 'inappropriate', name: 'Неподходящий контент' },
  { id: 'harassment', name: 'Домогательства' },
  { id: 'fake', name: 'Фейковая информация' },
  { id: 'other', name: 'Другое' },
];

const typeChoices = [
  { id: 'point', name: 'Точка' },
  { id: 'comment', name: 'Комментарий' },
  { id: 'user', name: 'Пользователь' },
];

// Компонент для отображения типа жалобы с иконкой
const ReportTypeField = () => {
  const record = useRecordContext();
  if (!record) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'point': return <MapPin size={16} />;
      case 'comment': return <MessageSquare size={16} />;
      case 'user': return <User size={16} />;
      default: return <Flag size={16} />;
    }
  };

  const getLabel = (type: string) => {
    const choice = typeChoices.find(c => c.id === type);
    return choice?.name || type;
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      {getIcon(record.type)}
      <span>{getLabel(record.type)}</span>
    </Box>
  );
};

// Компонент для отображения объекта жалобы
const ReportTargetField = () => {
  const record = useRecordContext();
  if (!record) return null;

  if (record.point) {
    return (
      <Box>
        <Typography variant="body2" fontWeight="bold">
          {record.point.name || 'Неизвестная точка'}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Автор: {record.point.author?.username || 'Неизвестен'}
        </Typography>
      </Box>
    );
  }

  if (record.comment) {
    return (
      <Box>
        <Typography variant="body2" fontWeight="bold">
          {record.comment.content ? 
            `${record.comment.content.substring(0, 50)}...` : 
            'Комментарий удален'
          }
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Автор: {record.comment.author?.username || 'Неизвестен'}
        </Typography>
      </Box>
    );
  }

  if (record.reportedUser) {
    return (
      <Box>
        <Typography variant="body2" fontWeight="bold">
          {record.reportedUser.username || 'Неизвестный пользователь'}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Email: {record.reportedUser.email || 'Не указан'}
        </Typography>
        {record.reportedUser.isBlocked && (
          <Chip label="Заблокирован" color="error" size="small" />
        )}
      </Box>
    );
  }

  return <span>—</span>;
};

// Кнопки действий для жалоб
const ReportActions = () => {
  const record = useRecordContext();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const [loading, setLoading] = React.useState(false);

  if (!record || record.status !== 'pending') return null;

  const handleResolve = async (e: React.MouseEvent, action: 'block' | 'dismiss') => {
    e.stopPropagation();
    e.preventDefault();
    
    if (loading) return;
    
    setLoading(true);
    try {
      // Используем dataProvider напрямую для полного контроля
      await dataProvider.update('reports', {
        id: record.id,
        data: { action },
        previousData: record,
      });
      
      const actionText = action === 'block' ? 'заблокирован пользователь' : 'жалоба отклонена';
      notify(`Действие выполнено: ${actionText}`, { type: 'success' });
      
      // Обновляем данные без редиректа
      refresh();
    } catch (error) {
      console.error('Error resolving report:', error);
      notify('Ошибка при обработке жалобы', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" gap={1}>
      <Button
        label="Заблокировать"
        onClick={(e) => handleResolve(e, 'block')}
        color="warning"
        size="small"
        disabled={loading}
      >
        <XCircle size={16} />
      </Button>
      <Button
        label="Отклонить"
        onClick={(e) => handleResolve(e, 'dismiss')}
        color="success"
        size="small"
        disabled={loading}
      >
        <CheckCircle size={16} />
      </Button>
    </Box>
  );
};

// Список жалоб
export const ReportList = () => (
  <List
    sort={{ field: 'createdAt', order: 'DESC' }}
    filters={[
      <SelectInput source="status" choices={statusChoices} alwaysOn />,
      <SelectInput source="type" choices={typeChoices} />,
      <SelectInput source="reason" choices={reasonChoices} />,
    ]}
  >
    <Datagrid rowClick="show" bulkActionButtons={false}>
      <TextField source="id" label="ID" />
      <FunctionField 
        label="Тип" 
        render={() => <ReportTypeField />}
      />
      <SelectField source="reason" choices={reasonChoices} label="Причина" />
      <ChipField 
        source="status" 
        label="Статус"
        sx={{
          '&.chip-pending': { backgroundColor: '#fff3cd', color: '#856404' },
          '&.chip-reviewed': { backgroundColor: '#d1ecf1', color: '#0c5460' },
          '&.chip-resolved': { backgroundColor: '#d4edda', color: '#155724' },
          '&.chip-dismissed': { backgroundColor: '#f8d7da', color: '#721c24' },
        }}
      />
      <TextField source="reporter.username" label="Жалобщик" />
      <FunctionField 
        label="Объект жалобы" 
        render={() => <ReportTargetField />}
      />
      <DateField source="createdAt" label="Дата создания" showTime />
      <FunctionField 
        label="Действия" 
        render={() => <ReportActions />}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      />
    </Datagrid>
  </List>
);

// Просмотр жалобы
export const ReportShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="ID жалобы" />
      <SelectField source="type" choices={typeChoices} label="Тип жалобы" />
      <SelectField source="reason" choices={reasonChoices} label="Причина" />
      <TextField source="description" label="Описание" />
      <ChipField source="status" label="Статус" />
      <DateField source="createdAt" label="Дата создания" showTime />
      <DateField source="updatedAt" label="Дата обновления" showTime />
      
      {/* Информация о жалобщике */}
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        Информация о жалобщике
      </Typography>
      <TextField source="reporter.username" label="Имя пользователя" />
      <TextField source="reporter.email" label="Email" />
      
      {/* Информация об объекте жалобы */}
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        Объект жалобы
      </Typography>
      <FunctionField 
        label="Детали" 
        render={() => <ReportTargetField />}
      />
      
      {/* Информация об обработке */}
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        Обработка
      </Typography>
      <FunctionField 
        source="reviewedBy.username" 
        label="Обработал"
        render={(record: any) => record?.reviewedBy?.username || 'Не обработано'}
      />
      <TextField source="adminNotes" label="Заметки администратора" />
      
      {/* Действия */}
      <Box sx={{ mt: 2 }}>
        <ReportActions />
      </Box>
    </SimpleShowLayout>
  </Show>
);

// Редактирование жалобы
export const ReportEdit = () => (
  <Edit>
    <SimpleForm>
      <SelectInput source="status" choices={statusChoices} label="Статус" />
      <TextInput source="adminNotes" label="Заметки администратора" multiline rows={4} />
    </SimpleForm>
  </Edit>
);