import { List, Datagrid, TextField, DateField, SelectField, Show, SimpleShowLayout, Edit, SimpleForm, SelectInput, TextInput, useRecordContext, FunctionField, Button, useRefresh, ChipField, ReferenceField, BooleanField, useDataProvider, } from 'react-admin';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { Flag, User, MessageSquare, MapPin, CheckCircle, XCircle } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
const useReportChoices = () => {
    const { t } = useTranslation('common');
    const statusChoices = [
        { id: 'pending', name: t('admin.reports.statusPending') },
        { id: 'reviewed', name: t('admin.reports.statusReviewed') },
        { id: 'resolved', name: t('admin.reports.statusResolved') },
        { id: 'dismissed', name: t('admin.reports.statusDismissed') },
    ];
    const reasonChoices = [
        { id: 'spam', name: t('admin.reports.reasonSpam') },
        { id: 'inappropriate', name: t('admin.reports.reasonInappropriate') },
        { id: 'harassment', name: t('admin.reports.reasonHarassment') },
        { id: 'fake', name: t('admin.reports.reasonFake') },
        { id: 'other', name: t('admin.reports.reasonOther') },
    ];
    const typeChoices = [
        { id: 'point', name: t('admin.reports.typePoint') },
        { id: 'comment', name: t('admin.reports.typeComment') },
        { id: 'user', name: t('admin.reports.typeUser') },
    ];
    return { statusChoices, reasonChoices, typeChoices };
};
const ReportTypeField = () => {
    const record = useRecordContext();
    const { typeChoices } = useReportChoices();
    if (!record)
        return null;
    const getIcon = (type: string) => {
        switch (type) {
            case 'point': return <MapPin size={16}/>;
            case 'comment': return <MessageSquare size={16}/>;
            case 'user': return <User size={16}/>;
            default: return <Flag size={16}/>;
        }
    };
    const getLabel = (type: string) => {
        const choice = typeChoices.find(c => c.id === type);
        return choice?.name || type;
    };
    return (<Box display="flex" alignItems="center" gap={1}>
      {getIcon(record.type)}
      <span>{getLabel(record.type)}</span>
    </Box>);
};
const ReportTargetField = () => {
    const record = useRecordContext();
    const { t } = useTranslation('common');
    if (!record)
        return null;
    if (record.point) {
        return (<Box>
        <Typography variant="body2" fontWeight="bold">
          {record.point.name || t('admin.reports.unknownPoint')}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {t('admin.reports.authorLabel')}: {record.point.author?.username || t('admin.reports.unknown')}
        </Typography>
      </Box>);
    }
    if (record.comment) {
        return (<Box>
        <Typography variant="body2" fontWeight="bold">
          {record.comment.content ?
                `${record.comment.content.substring(0, 50)}...` :
                t('admin.reports.commentDeleted')}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {t('admin.reports.authorLabel')}: {record.comment.author?.username || t('admin.reports.unknown')}
        </Typography>
      </Box>);
    }
    if (record.reportedUser) {
        return (<Box>
        <Typography variant="body2" fontWeight="bold">
          {record.reportedUser.username || t('admin.reports.unknownUser')}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Email: {record.reportedUser.email || t('admin.reports.emailNotProvided')}
        </Typography>
        {record.reportedUser.isBlocked && (<Chip label={t('admin.reports.blocked')} color="error" size="small"/>)}
      </Box>);
    }
    return <span>—</span>;
};
const ReportActions = () => {
    const record = useRecordContext();
    const dataProvider = useDataProvider();
    const refresh = useRefresh();
    const { t } = useTranslation('common');
    const [loading, setLoading] = React.useState(false);
    if (!record || record.status !== 'pending')
        return null;
    const handleResolve = async (e: React.MouseEvent, action: 'block' | 'dismiss') => {
        e.stopPropagation();
        e.preventDefault();
        if (loading)
            return;
        setLoading(true);
        try {
            await dataProvider.update('reports', {
                id: record.id,
                data: { action },
                previousData: record,
            });
            refresh();
        }
        catch (error) {
            console.error('Error resolving report:', error);
        }
        finally {
            setLoading(false);
        }
    };
    return (<Box display="flex" gap={1}>
      <Button label={t('admin.reports.block')} onClick={(e) => handleResolve(e, 'block')} color="warning" size="small" disabled={loading}>
        <XCircle size={16}/>
      </Button>
      <Button label={t('admin.reports.dismiss')} onClick={(e) => handleResolve(e, 'dismiss')} color="success" size="small" disabled={loading}>
        <CheckCircle size={16}/>
      </Button>
    </Box>);
};
export const ReportList = () => {
    const { t } = useTranslation('common');
    const { statusChoices, reasonChoices, typeChoices } = useReportChoices();
    return (<List sort={{ field: 'createdAt', order: 'DESC' }} filters={[
            <SelectInput key="status" source="status" choices={statusChoices} alwaysOn/>,
            <SelectInput key="type" source="type" choices={typeChoices}/>,
            <SelectInput key="reason" source="reason" choices={reasonChoices}/>,
        ]}>
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <TextField source="id" label={t('admin.reports.id')}/>
        <FunctionField label={t('admin.reports.type')} render={() => <ReportTypeField />}/>
        <SelectField source="reason" choices={reasonChoices} label={t('admin.reports.reason')}/>
        <ChipField source="status" label={t('admin.reports.status')} sx={{
            '&.chip-pending': {
                backgroundColor: 'color-mix(in srgb, var(--primary) 18%, var(--background))',
                color: 'var(--text-main)',
            },
            '&.chip-reviewed': {
                backgroundColor: 'var(--muted)',
                color: 'var(--text-main)',
            },
            '&.chip-resolved': {
                backgroundColor: 'color-mix(in srgb, var(--secondary) 12%, var(--background))',
                color: 'var(--secondary-foreground)',
            },
            '&.chip-dismissed': {
                backgroundColor: 'color-mix(in srgb, var(--destructive) 15%, var(--background))',
                color: 'var(--destructive)',
            },
        }}/>
        <TextField source="reporter.username" label={t('admin.reports.reporter')}/>
        <FunctionField label={t('admin.reports.target')} render={() => <ReportTargetField />}/>
        <DateField source="createdAt" label={t('admin.reports.createdAt')} showTime/>
        <FunctionField label={t('admin.reports.actions')} render={() => <ReportActions />} onClick={(e: React.MouseEvent) => e.stopPropagation()}/>
      </Datagrid>
    </List>);
};
export const ReportShow = () => {
    const { t } = useTranslation('common');
    const { statusChoices, reasonChoices, typeChoices } = useReportChoices();
    return (<Show>
      <SimpleShowLayout>
        <TextField source="id" label={t('admin.reports.reportId')}/>
        <SelectField source="type" choices={typeChoices} label={t('admin.reports.reportType')}/>
        <SelectField source="reason" choices={reasonChoices} label={t('admin.reports.reason')}/>
        <TextField source="description" label={t('admin.reports.description')}/>
        <ChipField source="status" label={t('admin.reports.status')}/>
        <DateField source="createdAt" label={t('admin.reports.createdAt')} showTime/>
        <DateField source="updatedAt" label={t('admin.reports.updatedAt')} showTime/>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          {t('admin.reports.reporterInfo')}
        </Typography>
        <TextField source="reporter.username" label={t('admin.reports.username')}/>
        <TextField source="reporter.email" label={t('admin.reports.email')}/>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          {t('admin.reports.reportTarget')}
        </Typography>
        <FunctionField label={t('admin.reports.details')} render={() => <ReportTargetField />}/>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          {t('admin.reports.processing')}
        </Typography>
        <FunctionField source="reviewedBy.username" label={t('admin.reports.processedBy')} render={(record: any) => record?.reviewedBy?.username || t('admin.reports.notProcessed')}/>
        <TextField source="adminNotes" label={t('admin.reports.adminNotes')}/>
        
        <Box sx={{ mt: 2 }}>
          <ReportActions />
        </Box>
      </SimpleShowLayout>
    </Show>);
};
export const ReportEdit = () => {
    const { t } = useTranslation('common');
    const { statusChoices } = useReportChoices();
    return (<Edit>
      <SimpleForm>
        <SelectInput source="status" choices={statusChoices} label={t('admin.reports.status')}/>
        <TextInput source="adminNotes" label={t('admin.reports.adminNotes')} multiline rows={4}/>
      </SimpleForm>
    </Edit>);
};
