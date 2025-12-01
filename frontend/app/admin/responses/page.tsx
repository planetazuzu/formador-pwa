'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Filter, Download, Eye, CheckCircle, Clock, X, Search, XCircle } from 'lucide-react';
import { db, Response } from '@/lib/db';
import BackButton from '@/components/ui/BackButton';

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

function Button({ children, variant = 'outline', size = 'sm', className = '', ...props }: { children: React.ReactNode; variant?: 'outline'; size?: 'sm'; className?: string; [key: string]: any }) {
  const variantClasses = {
    outline: 'border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300',
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
  };
  return (
    <button className={`inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'error' }) {
  const variantClasses = {
    default: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}

export default function AdminResponses() {
  const [responses, setResponses] = useState<Response[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadResponses();
  }, []);

  useEffect(() => {
    filterResponses();
  }, [responses, filterStatus, searchQuery]);

  const loadResponses = async () => {
    try {
      setLoading(true);
      const allResponses = await Promise.race([
        db.responses.toArray(),
        new Promise<Response[]>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        )
      ]).catch(() => []);
      setResponses(allResponses);
    } catch (error) {
      console.error('Error cargando respuestas:', error);
      setResponses([]);
    } finally {
      setLoading(false);
    }
  };

  const filterResponses = () => {
    let filtered = [...responses];

    // Filtrar por estado
    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.activityTitle.toLowerCase().includes(query) ||
        r.studentName?.toLowerCase().includes(query) ||
        r.studentId?.toLowerCase().includes(query)
      );
    }

    setFilteredResponses(filtered);
  };

  const exportToCSV = () => {
    if (filteredResponses.length === 0) {
      alert('No hay respuestas para exportar');
      return;
    }

    const headers = ['ID', 'Actividad', 'Estudiante', 'Estado', 'Calificación', 'Fecha'];
    const rows = filteredResponses.map(r => [
      r.responseId,
      r.activityTitle,
      r.studentName || r.studentId || 'Anónimo',
      r.status,
      r.score !== undefined ? r.score.toString() : '-',
      new Date(r.createdAt).toLocaleDateString('es-ES'),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `respuestas-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completada</Badge>;
      case 'graded':
        return <Badge variant="success">Calificada</Badge>;
      case 'pending':
        return <Badge variant="warning">Pendiente</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'graded':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <BackButton href="/admin/dashboard" className="mb-4" />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Respuestas
          </h1>
          <p className="mt-1.5 text-gray-600 dark:text-gray-400">
            Revisa y gestiona las respuestas de los estudiantes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={exportToCSV}>
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por actividad, estudiante..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <XCircle className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="completed">Completadas</option>
              <option value="graded">Calificadas</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Lista de respuestas */}
      {loading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Cargando respuestas...</p>
            </div>
          </div>
        </Card>
      ) : filteredResponses.length > 0 ? (
        <div className="space-y-4">
          {filteredResponses.map((response) => (
            <Card key={response.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    {getStatusIcon(response.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {response.activityTitle}
                      </h3>
                      {getStatusBadge(response.status)}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p>
                        <strong>Estudiante:</strong> {response.studentName || response.studentId || 'Anónimo'}
                      </p>
                      {response.score !== undefined && (
                        <p>
                          <strong>Calificación:</strong> {response.score}/100
                        </p>
                      )}
                      <p>
                        <strong>Fecha:</strong> {new Date(response.createdAt).toLocaleString('es-ES')}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedResponse(response);
                    setIsDetailModalOpen(true);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Ver detalles"
                >
                  <Eye className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {searchQuery || filterStatus !== 'all' ? 'No se encontraron respuestas' : 'No hay respuestas aún'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              {searchQuery || filterStatus !== 'all' 
                ? 'Intenta cambiar los filtros de búsqueda'
                : 'Las respuestas de los estudiantes aparecerán aquí una vez que completen las actividades.'}
            </p>
            {(searchQuery || filterStatus !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Modal de detalles */}
      {isDetailModalOpen && selectedResponse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Detalles de la Respuesta
              </h2>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedResponse(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Actividad
                  </label>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold">
                    {selectedResponse.activityTitle}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estudiante
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {selectedResponse.studentName || selectedResponse.studentId || 'Anónimo'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estado
                  </label>
                  {getStatusBadge(selectedResponse.status)}
                </div>
                {selectedResponse.score !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Calificación
                    </label>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">
                      {selectedResponse.score}/100
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha de creación
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {new Date(selectedResponse.createdAt).toLocaleString('es-ES')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Última actualización
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {new Date(selectedResponse.updatedAt).toLocaleString('es-ES')}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contenido de la respuesta
                </label>
                <Card>
                  <div className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                    {typeof selectedResponse.content === 'string' 
                      ? selectedResponse.content 
                      : JSON.stringify(selectedResponse.content, null, 2)}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

