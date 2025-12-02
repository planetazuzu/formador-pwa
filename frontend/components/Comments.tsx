'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send, Trash2, Edit2, X } from 'lucide-react';
import { db, Comment } from '@/lib/db';
import { generateId } from '@/lib/utils';
import { useToastContext } from './ui/Toast';

interface CommentsProps {
  entityType: 'activity' | 'response';
  entityId: string;
  author?: string;
  className?: string;
}

export default function Comments({ entityType, entityId, author = 'Admin', className = '' }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToastContext();

  useEffect(() => {
    loadComments();
  }, [entityType, entityId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const allComments = await db.comments
        .where('[entityType+entityId]')
        .equals([entityType, entityId])
        .sortBy('createdAt');
      setComments(allComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Error al cargar comentarios');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const comment: Comment = {
        commentId: generateId(),
        entityType,
        entityId,
        author,
        content: newComment.trim(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await db.comments.add(comment);
      setComments([...comments, comment]);
      setNewComment('');
      toast.success('Comentario añadido');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Error al añadir comentario');
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const comment = await db.comments.where('commentId').equals(commentId).first();
      if (comment) {
        await db.comments.update(comment.id!, {
          content: editContent.trim(),
          updatedAt: Date.now(),
        });
        setComments(comments.map(c => c.commentId === commentId ? { ...c, content: editContent.trim() } : c));
        setEditingId(null);
        setEditContent('');
        toast.success('Comentario actualizado');
      }
    } catch (error) {
      console.error('Error editing comment:', error);
      toast.error('Error al actualizar comentario');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('¿Estás seguro de eliminar este comentario?')) return;

    try {
      const comment = await db.comments.where('commentId').equals(commentId).first();
      if (comment) {
        await db.comments.delete(comment.id!);
        setComments(comments.filter(c => c.commentId !== commentId));
        toast.success('Comentario eliminado');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Error al eliminar comentario');
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingId(comment.commentId);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent('');
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    if (days < 7) return `Hace ${days} días`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Comentarios ({comments.length})
        </h3>
      </div>

      {/* Lista de comentarios */}
      <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4">
            Cargando comentarios...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4">
            No hay comentarios aún
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.commentId}
              className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
            >
              {editingId === comment.commentId ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditComment(comment.commentId)}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {comment.author}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEditing(comment)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        aria-label="Editar comentario"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.commentId)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        aria-label="Eliminar comentario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Formulario de nuevo comentario */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleAddComment();
              }
            }}
            placeholder="Escribe un comentario... (Ctrl+Enter para enviar)"
            className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows={2}
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

