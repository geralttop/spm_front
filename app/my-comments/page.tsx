'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { commentsApi, Comment } from '@/shared/api';
import styles from './page.module.css';

export default function MyCommentsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await commentsApi.getMyComments();
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleUpdate = async (comment: Comment) => {
    if (!editContent.trim()) return;

    try {
      const updated = await commentsApi.update(comment.pointId, comment.id, { content: editContent });
      setComments(comments.map(c => c.id === comment.id ? updated : c));
      setEditingId(null);
      setEditContent('');
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDelete = async (comment: Comment) => {
    if (!confirm(t('comments.confirmDelete'))) return;

    try {
      await commentsApi.delete(comment.pointId, comment.id);
      setComments(comments.filter(c => c.id !== comment.id));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const goToPoint = (pointId: string) => {
    router.push(`/?pointId=${pointId}`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>{t('comments.loading')}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('myComments.title')}</h1>
        <p className={styles.subtitle}>{t('myComments.subtitle')}</p>
      </div>

      {comments.length === 0 ? (
        <div className={styles.empty}>
          <p>{t('myComments.noComments')}</p>
        </div>
      ) : (
        <div className={styles.list}>
          {comments.map((comment) => (
            <div key={comment.id} className={styles.comment}>
              <div className={styles.commentHeader}>
                <div className={styles.pointInfo}>
                  <button 
                    onClick={() => goToPoint(comment.pointId)}
                    className={styles.pointLink}
                  >
                    {comment.point?.name || t('myComments.unknownPoint')}
                  </button>
                </div>
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
                      onClick={() => handleUpdate(comment)}
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
                    <button 
                      onClick={() => handleEdit(comment)}
                      className={styles.editButton}
                    >
                      {t('comments.edit')}
                    </button>
                    <button 
                      onClick={() => handleDelete(comment)}
                      className={styles.deleteButton}
                    >
                      {t('comments.delete')}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
