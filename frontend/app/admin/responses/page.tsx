'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Filter, Download, Eye, CheckCircle, Clock, X, Search, XCircle, Star, BarChart3, Calendar, User, Award, FileJson, FileSpreadsheet } from 'lucide-react';
import { db, Response, Activity } from '@/lib/db';
import BackButton from '@/components/ui/BackButton';

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

function Button({ children, variant = 'outline', size = 'sm', className = '', ...props }: { children: React.ReactNode; variant?: 'outline' | 'primary'; size?: 'sm' | 'md'; className?: string; [key: string]: any }) {
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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterActivityId, setFilterActivityId] = useState<string>('all');
  const [filterStudent, setFilterStudent] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [gradingScore, setGradingScore] = useState<number | ''>('');
  const [gradingComment, setGradingComment] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterResponses();
  }, [responses, filterStatus, filterActivityId, filterStudent, filterDateFrom, filterDateTo, searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allResponses, allActivities] = await Promise.all([
        db.responses.toArray(),
        db.activities.toArray(),
      ]);
      setResponses(allResponses);
      setActivities(allActivities);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setResponses([]);
      setActivities([]);
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

    // Filtrar por actividad
    if (filterActivityId !== 'all') {
      filtered = filtered.filter(r => r.activityId === filterActivityId);
    }

    // Filtrar por estudiante
    if (filterStudent !== 'all') {
      filtered = filtered.filter(r => 
        (r.studentId && r.studentId === filterStudent) ||
        (r.studentName && r.studentName === filterStudent)
      );
    }

    // Filtrar por fecha desde
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom).getTime();
      filtered = filtered.filter(r => r.createdAt >= fromDate);
    }

    // Filtrar por fecha hasta
    if (filterDateTo) {
      const toDate = new Date(filterDateTo).getTime() + 86400000; // +1 día para incluir todo el día
      filtered = filtered.filter(r => r.createdAt < toDate);
    }

    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.activityTitle.toLowerCase().includes(query) ||
        r.studentName?.toLowerCase().includes(query) ||
        r.studentId?.toLowerCase().includes(query) ||
        (typeof r.content === 'object' && JSON.stringify(r.content).toLowerCase().includes(query))
      );
    }

    setFilteredResponses(filtered);
  };

  const getUniqueStudents = () => {
    const students = new Set<string>();
    responses.forEach(r => {
      if (r.studentId) students.add(r.studentId);
      if (r.studentName) students.add(r.studentName);
    });
    return Array.from(students).sort();
  };

  const getStatistics = () => {
    const total = filteredResponses.length;
    const completed = filteredResponses.filter(r => r.status === 'completed').length;
    const graded = filteredResponses.filter(r => r.status === 'graded').length;
    const pending = filteredResponses.filter(r => r.status === 'pending').length;
    const withScore = filteredResponses.filter(r => r.score !== undefined);
    const avgScore = withScore.length > 0
      ? Math.round(withScore.reduce((sum, r) => sum + (r.score || 0), 0) / withScore.length)
      : 0;
    
    return { total, completed, graded, pending, avgScore, withScore: withScore.length };
  };

  const handleGradeResponse = async () => {
    if (!selectedResponse || gradingScore === '') return;

    const score = Number(gradingScore);
    if (score < 0 || score > 100) {
      alert('La calificación debe estar entre 0 y 100');
      return;
    }

    try {
      await db.responses.update(selectedResponse.id!, {
        score,
        status: 'graded',
        updatedAt: Date.now(),
      });

      // Actualizar estado local
      setResponses(prev => prev.map(r => 
        r.id === selectedResponse.id 
          ? { ...r, score, status: 'graded' as const, updatedAt: Date.now() }
          : r
      ));

      setSelectedResponse({ ...selectedResponse, score, status: 'graded', updatedAt: Date.now() });
      setGradingScore('');
      setGradingComment('');
      alert('Calificación guardada correctamente');
    } catch (error) {
      console.error('Error calificando respuesta:', error);
      alert('Error al guardar la calificación');
    }
  };

  const exportToCSV = () => {
    if (filteredResponses.length === 0) {
      alert('No hay respuestas para exportar');
      return;
    }

    const headers = ['ID', 'Actividad', 'Estudiante', 'ID Estudiante', 'Estado', 'Calificación', 'Fecha Creación', 'Fecha Actualización'];
    const rows = filteredResponses.map(r => [
      r.responseId,
      r.activityTitle,
      r.studentName || '',
      r.studentId || '',
      r.status,
      r.score !== undefined ? r.score.toString() : '',
      new Date(r.createdAt).toISOString(),
      new Date(r.updatedAt).toISOString(),
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

  const exportToJSON = () => {
    if (filteredResponses.length === 0) {
      alert('No hay respuestas para exportar');
      return;
    }

    const data = filteredResponses.map(r => ({
      responseId: r.responseId,
      activityId: r.activityId,
      activityTitle: r.activityTitle,
      studentName: r.studentName,
      studentId: r.studentId,
      content: r.content,
      score: r.score,
      status: r.status,
      createdAt: new Date(r.createdAt).toISOString(),
      updatedAt: new Date(r.updatedAt).toISOString(),
    }));

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `respuestas-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const exportToExcel = () => {
    // Usar CSV como Excel (formato compatible)
    exportToCSV();
  };

  const openDetailModal = async (response: Response) => {
    setSelectedResponse(response);
    setGradingScore(response.score !== undefined ? response.score : '');
    setGradingComment('');
    
    // Cargar actividad para mostrar preguntas
    const activity = await db.activities.where('activityId').equals(response.activityId).first();
    setSelectedActivity(activity || null);
    
    setIsDetailModalOpen(true);
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

  const renderAnswerContent = (response: Response) => {
    if (!response.content || typeof response.content !== 'object') {
      return <p className="text-gray-600 dark:text-gray-400">Sin contenido</p>;
    }

    const content = response.content as any;
    const answers = content.answers || {};

    if (!selectedActivity) {
      // Si no hay actividad, mostrar JSON formateado
      return (
        <pre className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
          {JSON.stringify(content, null, 2)}
        </pre>
      );
    }

    // Obtener todas las preguntas de la actividad
    const activityContent = selectedActivity.content as any;
    const sections = activityContent?.sections || [];
    const allQuestions: any[] = [];
    
    sections.forEach((section: any) => {
      if (section.type === 'questions' && section.questions) {
        section.questions.forEach((question: any) => {
          allQuestions.push(question);
        });
      }
    });

    if (allQuestions.length === 0) {
      return <p className="text-gray-600 dark:text-gray-400">No hay preguntas en esta actividad</p>;
    }

    return (
      <div className="space-y-4">
        {allQuestions.map((question, index) => {
          const answer = answers[question.id];
          if (!answer) return null;

          return (
            <div key={question.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Pregunta {index + 1}
                    </span>
                    {question.points && (
                      <Badge variant="default">
                        {question.points} punto{question.points !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-900 dark:text-gray-100 font-medium mb-3">
                    {question.question || 'Pregunta sin texto'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Respuesta:</p>
                {question.type === 'multiple-choice' && question.options && (
                  <p className="text-gray-900 dark:text-gray-100">
                    {question.options[answer.answer as number] || `Opción ${(answer.answer as number) + 1}`}
                  </p>
                )}
                {question.type === 'true-false' && (
                  <p className="text-gray-900 dark:text-gray-100">
                    {answer.answer === 0 ? 'Verdadero' : 'Falso'}
                  </p>
                )}
                {(question.type === 'text' || question.type === 'code' || question.type === 'essay') && (
                  <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {answer.answer as string}
                  </pre>
                )}
              </div>
            </div>
          );
        })}
        
        {content.duration && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Tiempo de realización:</strong> {Math.floor(content.duration / 1000 / 60)} minutos
            </p>
          </div>
        )}
      </div>
    );
  };

  const stats = getStatistics();
  const uniqueStudents = getUniqueStudents();

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
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowStats(!showStats)}>
            <BarChart3 className="w-4 h-4" />
            {showStats ? 'Ocultar' : 'Mostrar'} Estadísticas
          </Button>
          <div className="relative group">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <button
                onClick={exportToCSV}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={exportToJSON}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <FileJson className="w-4 h-4" />
                JSON
              </button>
              <button
                onClick={exportToExcel}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Excel (CSV)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-indigo-500" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Calificadas</p>
                <p className="text-2xl font-bold text-blue-600">{stats.graded}</p>
              </div>
              <Award className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Promedio</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgScore}/100</p>
              </div>
              <Star className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card className="mb-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Filtros</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="lg:col-span-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por actividad, estudiante, contenido..."
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

            {/* Filtro por estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="completed">Completadas</option>
                <option value="graded">Calificadas</option>
              </select>
            </div>

            {/* Filtro por actividad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Actividad
              </label>
              <select
                value={filterActivityId}
                onChange={(e) => setFilterActivityId(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Todas las actividades</option>
                {activities.map(activity => (
                  <option key={activity.activityId} value={activity.activityId}>
                    {activity.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por estudiante */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estudiante
              </label>
              <select
                value={filterStudent}
                onChange={(e) => setFilterStudent(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Todos los estudiantes</option>
                {uniqueStudents.map(student => (
                  <option key={student} value={student}>
                    {student}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por fecha desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Desde
              </label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Filtro por fecha hasta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Hasta
              </label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Botón limpiar filtros */}
          {(filterStatus !== 'all' || filterActivityId !== 'all' || filterStudent !== 'all' || filterDateFrom || filterDateTo || searchQuery) && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterStatus('all');
                  setFilterActivityId('all');
                  setFilterStudent('all');
                  setFilterDateFrom('');
                  setFilterDateTo('');
                  setSearchQuery('');
                }}
              >
                <X className="w-4 h-4 mr-1" />
                Limpiar filtros
              </Button>
            </div>
          )}
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
                        <User className="w-4 h-4 inline mr-1" />
                        <strong>Estudiante:</strong> {response.studentName || response.studentId || 'Anónimo'}
                      </p>
                      {response.score !== undefined && (
                        <p>
                          <Award className="w-4 h-4 inline mr-1" />
                          <strong>Calificación:</strong> {response.score}/100
                        </p>
                      )}
                      <p>
                        <Calendar className="w-4 h-4 inline mr-1" />
                        <strong>Fecha:</strong> {new Date(response.createdAt).toLocaleString('es-ES')}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => openDetailModal(response)}
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
              {searchQuery || filterStatus !== 'all' || filterActivityId !== 'all' || filterStudent !== 'all' || filterDateFrom || filterDateTo
                ? 'No se encontraron respuestas'
                : 'No hay respuestas aún'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              {searchQuery || filterStatus !== 'all' || filterActivityId !== 'all' || filterStudent !== 'all' || filterDateFrom || filterDateTo
                ? 'Intenta cambiar los filtros de búsqueda'
                : 'Las respuestas de los estudiantes aparecerán aquí una vez que completen las actividades.'}
            </p>
            {(searchQuery || filterStatus !== 'all' || filterActivityId !== 'all' || filterStudent !== 'all' || filterDateFrom || filterDateTo) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                  setFilterActivityId('all');
                  setFilterStudent('all');
                  setFilterDateFrom('');
                  setFilterDateTo('');
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Detalles de la Respuesta
              </h2>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedResponse(null);
                  setSelectedActivity(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Información básica */}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Calificación
                  </label>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">
                    {selectedResponse.score !== undefined ? `${selectedResponse.score}/100` : 'Sin calificar'}
                  </p>
                </div>
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

              {/* Sistema de calificación */}
              <Card className="bg-indigo-50 dark:bg-indigo-900/20">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Calificar Respuesta
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Calificación (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={gradingScore}
                      onChange={(e) => setGradingScore(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Ingresa la calificación"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Comentario (opcional)
                    </label>
                    <textarea
                      value={gradingComment}
                      onChange={(e) => setGradingComment(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      placeholder="Añade un comentario sobre la respuesta..."
                    />
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleGradeResponse}
                    disabled={gradingScore === ''}
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Guardar Calificación
                  </Button>
                </div>
              </Card>

              {/* Contenido de la respuesta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Respuestas del Estudiante
                </label>
                <Card>
                  {renderAnswerContent(selectedResponse)}
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
