'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, CheckCircle2, X, Calendar, Users, Key, Eye, EyeOff } from 'lucide-react';
import { db, Token, Activity } from '@/lib/db';

interface TokenGeneratorProps {
  activityId?: string;
  activityTitle?: string;
  onTokenGenerated?: (token: Token) => void;
}

export default function TokenGenerator({ activityId, activityTitle, onTokenGenerated }: TokenGeneratorProps) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    activityId: activityId || '',
    description: '',
    expiresAt: '',
    maxUses: '',
  });

  useEffect(() => {
    loadTokens();
    loadActivities();
  }, []);

  const loadTokens = async () => {
    try {
      setLoadingTokens(true);
      const allTokens = await db.tokens.toArray();
      // Ordenar por fecha de creación (más recientes primero)
      setTokens(allTokens.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error('Error cargando tokens:', error);
      setTokens([]);
    } finally {
      setLoadingTokens(false);
    }
  };

  const loadActivities = async () => {
    try {
      const allActivities = await db.activities.toArray();
      setActivities(allActivities);
    } catch (error) {
      console.error('Error cargando actividades:', error);
    }
  };

  const generateToken = (): string => {
    // Generar token único usando caracteres alfanuméricos
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  };

  const handleGenerateToken = async () => {
    setLoading(true);
    try {
      const tokenId = `token-${Date.now()}`;
      const token = generateToken();
      const now = Date.now();
      const expiresAt = formData.expiresAt ? new Date(formData.expiresAt).getTime() : undefined;
      const maxUses = formData.maxUses ? parseInt(formData.maxUses) : undefined;

      const selectedActivity = activities.find(a => a.activityId === formData.activityId);
      const newToken: Token = {
        tokenId,
        token,
        activityId: formData.activityId || undefined,
        activityTitle: selectedActivity?.title || activityTitle || undefined,
        expiresAt,
        maxUses,
        uses: 0,
        isActive: true,
        description: formData.description || undefined,
        createdAt: now,
        updatedAt: now,
      };

      await db.tokens.add(newToken);
      await loadTokens();
      
      setFormData({
        activityId: activityId || '',
        description: '',
        expiresAt: '',
        maxUses: '',
      });
      setIsModalOpen(false);

      if (onTokenGenerated) {
        onTokenGenerated(newToken);
      }
    } catch (error) {
      console.error('Error generando token:', error);
      alert('Error al generar el token. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeToken = async (token: Token) => {
    if (!confirm(`¿Estás seguro de revocar este token? No podrá ser usado nuevamente.`)) return;

    try {
      if (token.id) {
        await db.tokens.update(token.id, {
          isActive: false,
          updatedAt: Date.now(),
        });
        await loadTokens();
      }
    } catch (error) {
      console.error('Error revocando token:', error);
      alert('Error al revocar el token.');
    }
  };

  const handleDeleteToken = async (token: Token) => {
    if (!confirm(`¿Estás seguro de eliminar este token permanentemente?`)) return;

    try {
      if (token.id) {
        await db.tokens.delete(token.id);
        await loadTokens();
      }
    } catch (error) {
      console.error('Error eliminando token:', error);
      alert('Error al eliminar el token.');
    }
  };

  const copyToClipboard = (text: string, tokenId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(tokenId);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const getTokenUrl = (token: Token): string => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    if (token.activityId) {
      return `${baseUrl}/a/${token.activityId}?token=${token.token}`;
    }
    return `${baseUrl}/?token=${token.token}`;
  };

  const isTokenExpired = (token: Token): boolean => {
    if (!token.expiresAt) return false;
    return Date.now() > token.expiresAt;
  };

  const isTokenExhausted = (token: Token): boolean => {
    if (!token.maxUses) return false;
    return token.uses >= token.maxUses;
  };

  const isTokenValid = (token: Token): boolean => {
    return token.isActive && !isTokenExpired(token) && !isTokenExhausted(token);
  };

  const getTokenStatus = (token: Token): { label: string; color: string } => {
    if (!token.isActive) {
      return { label: 'Revocado', color: 'text-red-600 dark:text-red-400' };
    }
    if (isTokenExpired(token)) {
      return { label: 'Expirado', color: 'text-orange-600 dark:text-orange-400' };
    }
    if (isTokenExhausted(token)) {
      return { label: 'Agotado', color: 'text-yellow-600 dark:text-yellow-400' };
    }
    return { label: 'Activo', color: 'text-green-600 dark:text-green-400' };
  };

  const activeTokens = tokens.filter(t => isTokenValid(t));
  const inactiveTokens = tokens.filter(t => !isTokenValid(t));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Generador de Tokens
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Genera tokens de acceso para compartir actividades de forma segura
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Generar Token
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Tokens</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{tokens.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Activos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activeTokens.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Usos Totales</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {tokens.reduce((sum, t) => sum + t.uses, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de tokens */}
      {loadingTokens ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando tokens...</p>
        </div>
      ) : tokens.length > 0 ? (
        <div className="space-y-4">
          {/* Tokens activos */}
          {activeTokens.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Tokens Activos
              </h3>
              <div className="space-y-3">
                {activeTokens.map((token) => (
                  <TokenCard
                    key={token.id}
                    token={token}
                    onCopy={copyToClipboard}
                    onRevoke={handleRevokeToken}
                    onDelete={handleDeleteToken}
                    copiedToken={copiedToken}
                    getTokenUrl={getTokenUrl}
                    getTokenStatus={getTokenStatus}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tokens inactivos */}
          {inactiveTokens.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Tokens Inactivos
              </h3>
              <div className="space-y-3">
                {inactiveTokens.map((token) => (
                  <TokenCard
                    key={token.id}
                    token={token}
                    onCopy={copyToClipboard}
                    onRevoke={handleRevokeToken}
                    onDelete={handleDeleteToken}
                    copiedToken={copiedToken}
                    getTokenUrl={getTokenUrl}
                    getTokenStatus={getTokenStatus}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No hay tokens generados
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Genera tokens para compartir actividades de forma segura. Puedes configurar expiración y límite de usos.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Generar Primer Token
          </button>
        </div>
      )}

      {/* Modal para generar token */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Generar Nuevo Token
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGenerateToken();
              }}
              className="p-6 space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Actividad (opcional)
                </label>
                <select
                  value={formData.activityId}
                  onChange={(e) => setFormData({ ...formData, activityId: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Sin actividad específica</option>
                  {activities.map((activity) => (
                    <option key={activity.activityId} value={activity.activityId}>
                      {activity.title}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Si seleccionas una actividad, el token dará acceso directo a esa actividad
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ej: Token para clase de React"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de expiración (opcional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  El token dejará de funcionar después de esta fecha
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Límite de usos (opcional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ej: 10"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Número máximo de veces que se puede usar el token
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Generando...' : 'Generar Token'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para mostrar cada token
function TokenCard({
  token,
  onCopy,
  onRevoke,
  onDelete,
  copiedToken,
  getTokenUrl,
  getTokenStatus,
}: {
  token: Token;
  onCopy: (text: string, tokenId: string) => void;
  onRevoke: (token: Token) => void;
  onDelete: (token: Token) => void;
  copiedToken: string | null;
  getTokenUrl: (token: Token) => string;
  getTokenStatus: (token: Token) => { label: string; color: string };
}) {
  const [showToken, setShowToken] = useState(false);
  const status = getTokenStatus(token);
  const tokenUrl = getTokenUrl(token);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {token.activityTitle && (
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {token.activityTitle}
              </span>
            )}
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${status.color} bg-opacity-10`}>
              {status.label}
            </span>
          </div>
          {token.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{token.description}</p>
          )}
          <div className="flex items-center gap-2 mb-2">
            <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
              {showToken ? token.token : '••••••••••••••••••••••••••••••••'}
            </code>
            <button
              onClick={() => setShowToken(!showToken)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title={showToken ? 'Ocultar token' : 'Mostrar token'}
            >
              {showToken ? (
                <EyeOff className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              ) : (
                <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              )}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            {token.expiresAt && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Expira: {new Date(token.expiresAt).toLocaleString('es-ES')}
                </span>
              </div>
            )}
            {token.maxUses && (
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>
                  {token.uses} / {token.maxUses} usos
                </span>
              </div>
            )}
            {!token.maxUses && token.uses > 0 && (
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{token.uses} uso{token.uses !== 1 ? 's' : ''}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span>Creado: {new Date(token.createdAt).toLocaleDateString('es-ES')}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onCopy(tokenUrl, token.tokenId)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Copiar URL con token"
          >
            {copiedToken === token.tokenId ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            )}
          </button>
          {token.isActive && (
            <button
              onClick={() => onRevoke(token)}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Revocar token"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          )}
          <button
            onClick={() => onDelete(token)}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Eliminar token"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
