'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { userProfilePath } from '@/shared/lib/user-profile-path';
import { useTranslation } from 'react-i18next';
import { MoreVertical, Pencil, Trash2, Flag, User } from 'lucide-react';
import { commentsApi, Comment } from '@/shared/api';
import { ReportModal } from '@/shared/ui';
import { useProfileQuery } from '@/shared/lib/hooks';
import { formatRelativeDate } from '@/shared/lib/utils';
import styles from './Comments.module.css';

interface CommentsProps {
  pointId: string;
}

export function Comments({ pointId }: CommentsProps) {
  const { t } = useTranslation();
  const { data: profile } = useProfileQuery();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentUserId = profile ? Number(profile.userId) : null;

  useEffect(() => {
    if (openMenuId === null) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  useEffect(() => {
    loadComments();
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
    setReportingCommentId(null);
  };

  const getReportingComment = () => {
    return comments.find(c => c.id === reportingCommentId);
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
            <div
              key={comment.id}
              className={`${styles.comment} ${currentUserId === comment.authorId ? styles.commentMine : ''}`}
            >
              <Link
                href={userProfilePath(comment.author.username)}
                className={styles.authorAvatarLink}
                aria-label={t('search.viewProfile')}
              >
                <div className={styles.avatar}>
                  {comment.author.avatar ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${comment.author.avatar}`}
                      alt=""
                      className={styles.avatarImg}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      <User className={styles.avatarIcon} aria-hidden />
                    </div>
                  )}
                </div>
              </Link>
              <div className={styles.commentBody}>
                <div className={styles.metaRow}>
                  <div className={styles.metaLeft}>
                    <Link
                      href={userProfilePath(comment.author.username)}
                      className={`${styles.username} ${styles.profileLink}`}
                    >
                      @{comment.author.username}
                    </Link>
                    <span className={styles.metaSep} aria-hidden>
                      ·
                    </span>
                    <time
                      className={styles.date}
                      dateTime={comment.createdAt}
                      title={new Date(comment.createdAt).toLocaleString()}
                    >
                      {formatRelativeDate(comment.createdAt)}
                    </time>
                    {comment.createdAt !== comment.updatedAt && (
                      <span className={styles.edited}> ({t('comments.edited')})</span>
                    )}
                  </div>
                </div>
                <div className={styles.menuWrap} ref={openMenuId === comment.id ? menuRef : null}>
                  <button
                    type="button"
                    onClick={() => setOpenMenuId(openMenuId === comment.id ? null : comment.id)}
                    className={styles.menuTrigger}
                    aria-label={t('comments.actions')}
                    aria-expanded={openMenuId === comment.id}
                  >
                    <MoreVertical className={styles.menuIcon} />
                  </button>
                  {openMenuId === comment.id && (
                    <div className={styles.menuDropdown}>
                      {currentUserId === comment.authorId ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              handleEdit(comment);
                              setOpenMenuId(null);
                            }}
                            className={styles.menuItem}
                          >
                            <Pencil className={styles.menuItemIcon} />
                            {t('comments.edit')}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleDelete(comment.id);
                              setOpenMenuId(null);
                            }}
                            className={`${styles.menuItem} ${styles.menuItemDanger}`}
                          >
                            <Trash2 className={styles.menuItemIcon} />
                            {t('comments.delete')}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            handleReport(comment.id);
                            setOpenMenuId(null);
                          }}
                          className={styles.menuItem}
                        >
                          <Flag className={styles.menuItemIcon} />
                          {t('reports.button')}
                        </button>
                      )}
                    </div>
                  )}
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
                        type="button"
                        onClick={() => handleUpdate(comment.id)}
                        className={styles.saveButton}
                      >
                        {t('comments.save')}
                      </button>
                      <button
                        type="button"
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
                  <p className={styles.content}>{comment.content}</p>
                )}
              </div>
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
