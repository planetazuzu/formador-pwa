'use client';

import { useState, useEffect } from 'react';
import { Plus, X, GripVertical, Eye, Trash2, Search, BookOpen, CheckCircle2 } from 'lucide-react';
import { db, Activity } from '@/lib/db';
import { generateId } from '@/lib/utils';

interface SessionBuilderProps {
  initialTitle?: string;
  initialActivities?: string[];
  onSave?: (sessionData: { title: string; activities: string[] }) => void;
  onCancel?: () => void;
}

export default function SessionBuilder({ 
  initialTitle = '', 
  initialActivities = [],
  onSave,
  onCancel 
}: SessionBuilderProps) {
  const [title, setTitle] = useState(initialTitle);
  const [selectedActivities, setSelectedActivities] = useState<string[]>(initialActivities);
  const [availableActivities, setAvailableActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [availableActivities, searchQuery, selectedActivities]);

  const loadActivities = async () => {
    try {
      const activities = await db.activities.toArray();
      setAvailableActivities(activities);
    } catch (error) {
      console.error('Error cargando actividades:', error);
      setAvailableActivities([]);
    }
  };

  const filterActivities = () => {
    let filtered = availableActivities.filter(activity => 
      !selectedActivities.includes(activity.activityId)
    );

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(query) ||
        activity.activityId.toLowerCase().includes(query)
      );
    }

    setFilteredActivities(filtered);
  };

  const addActivity = (activityId: string) => {
    if (!selectedActivities.includes(activityId)) {
      setSelectedActivities([...selectedActivities, activityId]);
      setSearchQuery('');
    }
  };

  const removeActivity = (activityId: string) => {
    setSelectedActivities(selectedActivities.filter(id => id !== activityId));
  };

  const moveActivity = (fromIndex: number, toIndex: number) => {
    const newActivities = [...selectedActivities];
    const [removed] = newActivities.splice(fromIndex, 1);
    newActivities.splice(toIndex, 0, removed);
    setSelectedActivities(newActivities);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    if (draggedIndex !== index) {
      moveActivity(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Por favor, ingresa un título para la sesión');
      return;
    }

    if (onSave) {
      onSave({
        title: title.trim(),
        activities: selectedActivities,
      });
    }
  };

  const getActivityById = (activityId: string) => {
    return availableActivities.find(a => a.activityId === activityId);
  };

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Título de la Sesión *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Ej: Introducción a React"
        />
      </div>

      {/* Actividades seleccionadas */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Actividades de la Sesión ({selectedActivities.length})
          </label>
          {selectedActivities.length > 0 && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Ocultar' : 'Mostrar'} Vista Previa
            </button>
          )}
        </div>

        {selectedActivities.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              No hay actividades seleccionadas. Busca y agrega actividades desde el panel de abajo.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedActivities.map((activityId, index) => {
              const activity = getActivityById(activityId);
              return (
                <div
                  key={activityId}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-all cursor-move ${
                    draggedIndex === index ? 'opacity-50' : ''
                  }`}
                >
                  <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                        #{index + 1}
                      </span>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {activity?.title || activityId}
                      </h4>
                    </div>
                    {activity && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        ID: {activity.activityId}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeActivity(activityId)}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                    title="Eliminar actividad"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Vista previa */}
      {showPreview && selectedActivities.length > 0 && (
        <div className="border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 bg-indigo-50 dark:bg-indigo-900/20">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Vista Previa de la Sesión
          </h3>
          <div className="space-y-2">
            {selectedActivities.map((activityId, index) => {
              const activity = getActivityById(activityId);
              return (
                <div
                  key={activityId}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="font-medium">{index + 1}.</span>
                  <span>{activity?.title || activityId}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Buscar y agregar actividades */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Buscar y Agregar Actividades
        </label>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Buscar actividades por título o ID..."
          />
        </div>

        {filteredActivities.length === 0 ? (
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery
                ? 'No se encontraron actividades con ese criterio'
                : availableActivities.length === 0
                ? 'No hay actividades disponibles. Crea actividades primero.'
                : 'Todas las actividades ya están agregadas a la sesión'}
            </p>
          </div>
        ) : (
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl max-h-64 overflow-y-auto">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredActivities.map((activity) => (
                <button
                  key={activity.activityId}
                  onClick={() => addActivity(activity.activityId)}
                  className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {activity.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      ID: {activity.activityId}
                    </p>
                  </div>
                  <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      {(onSave || onCancel) && (
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
          )}
          {onSave && (
            <button
              onClick={handleSave}
              disabled={loading || !title.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Guardando...' : 'Guardar Sesión'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
