export type ReportType = 'point' | 'comment' | 'user';
export type ReportReason = 'spam' | 'inappropriate' | 'harassment' | 'fake' | 'other';

export interface CreateReportRequest {
  type: ReportType;
  reason: ReportReason;
  targetId: string | number;
  description?: string;
}

export interface Report {
  id: number;
  type: ReportType;
  reason: ReportReason;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}
