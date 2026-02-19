'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Flag } from 'lucide-react';
import { commentsApi, Comment, authApi } from '@/shared/api';
import { ReportModal } from '@/shared/ui';
import styles from './Comments.module.css';

interface CommentsProps {
  pointId: string;
}

export function Comments({ pointId }: CommentsProps) {
  const { t } = useTranslation();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<number | null>(null);

  useEffect(() => {
    loadComments();
    loadCurrentUser();
  }, [pointId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await commentsApi.getByPoint(pointId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };
  const loadCurrentUser = async () => {
    try {
      const profile = await authApi.getProfile();
      setCurrentUserId(Number(profile.userId));
    } catch (error) {
      console.error('Error loading current user:', error);
      setCurrentUserId(null);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const comment = await commentsApi.create(pointId, { content: newComment });
      setComments([comment, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleUpdate = async (commentId: number) => {
    if (!editContent.trim()) return;

    try {
      const updated = await commentsApi.update(pointId, commentId, { content: editContent });
      setComments(comments.map(c => c.id === commentId ? updated : c));
      setEditingId(null);
      setEditContent('');
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm(t('comments.confirmDelete'))) return;

    try {
      await commentsApi.delete(pointId, commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleReport = (commentId: number) => {
    setReportingCommentId(commentId);
    setShowReportModal(true);
  };

  const handleReportSuccess = () => {
    console.log('Жалоба на комментарий успешно отправлена');
    setReportingCommentId(null);
  };

  const getReportingComment = () => {
    return comments.find(c => c.id === reportingCommentId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className={styles.loading}>{t('comments.loading')}</div>;
  }

  return (
    <div className={styles.comments}>
      <h3 className={styles.title}>{t('comments.title')}</h3>

      <form onSubmit={handleSubmit} className={styles.form}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={t('comments.placeholder')}
          className={styles.textarea}
          rows={3}
          disabled={submitting}
        />
        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={submitting || !newComment.trim()}
        >
          {submitting ? t('comments.submitting') : t('comments.submit')}
        </button>
      </form>

      <div className={styles.list}>
        {comments.length === 0 ? (
          <div className={styles.empty}>
            <p>{t('comments.noComments')}</p>
            <p className={styles.emptyHint}>{t('comments.beFirst')}</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className={styles.comment}>
              <div className={styles.header}>
                <span className={styles.author}>{comment.author.username}</span>
                <span className={styles.date}>
                  {formatDate(comment.createdAt)}
                  {comment.createdAt !== comment.updatedAt && (
                    <span className={styles.edited}> ({t('comments.edited')})</span>
                  )}
                </span>
              </div>

              {editingId === comment.id ? (
                <div className={styles.editForm}>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className={styles.textarea}
                    rows={3}
                  />
                  <div className={styles.editActions}>
                    <button 
                      onClick={() => handleUpdate(comment.id)}
                      className={styles.saveButton}
                    >
                      {t('comments.save')}
                    </button>
                    <button 
                      onClick={() => {
                        setEditingId(null);
                        setEditContent('');
                      }}
                      className={styles.cancelButton}
                    >
                      {t('comments.cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className={styles.content}>{comment.content}</p>
                  <div className={styles.actions}>
                    {currentUserId === comment.authorId ? (
                      <>
                        <button 
                          onClick={() => handleEdit(comment)}
                          className={styles.editButton}
                        >
                          {t('comments.edit')}
                        </button>
                        <button 
                          onClick={() => handleDelete(comment.id)}
                          className={styles.deleteButton}
                        >
                          {t('comments.delete')}
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleReport(comment.id)}
                        className={styles.reportButton}
                        title={t('reports.button')}
                      >
                        <Flag className={styles.reportIcon} />
                        {t('reports.button')}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Report Modal */}
      {reportingCommentId && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            setReportingCommentId(null);
          }}
          type="comment"
          targetId={reportingCommentId}
          targetName={getReportingComment()?.content.substring(0, 50) + '...'}
          onSuccess={handleReportSuccess}
        />
      )}
    </div>
  );
}
