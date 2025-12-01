'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Eye, Save, X, FileText, Video, Link as LinkIcon, Image } from 'lucide-react';
import { db, Activity, Resource } from '@/lib/db';
import { generateId } from '@/lib/utils';

// Tipos de preguntas
type QuestionType = 'multiple-choice' | 'text' | 'true-false' | 'code' | 'essay';

interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; // Para opción múltiple
  correctAnswer?: string | number; // Para opción múltiple y verdadero/falso
  placeholder?: string; // Para texto y código
  required: boolean;
  points?: number;
}

interface Section {
  id: string;
  type: 'text' | 'resource' | 'questions';
  content?: string; // Para texto
  resourceId?: string; // Para recursos
  questions?: Question[]; // Para preguntas
}

interface ActivityBuilderProps {
  activity?: Activity | null;
  onSave?: (activity: Activity) => void;
  onCancel?: () => void;
}

export default function ActivityBuilder({ activity, onSave, onCancel }: ActivityBuilderProps) {
  const [title, setTitle] = useState(activity?.title || '');
  const [description, setDescription] = useState((activity?.content as any)?.description || '');
  const [sections, setSections] = useState<Section[]>(
    (activity?.content as any)?.sections || []
  );
  const [resources, setResources] = useState<Resource[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null);

  // Cargar recursos disponibles
  useEffect(() => {
    db.resources.toArray().then(setResources);
  }, []);

  const addSection = (type: 'text' | 'resource' | 'questions') => {
    const newSection: Section = {
      id: generateId(),
      type,
      ...(type === 'text' && { content: '' }),
      ...(type === 'questions' && { questions: [] }),
    };
    setSections([...sections, newSection]);
    setActiveSectionIndex(sections.length);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
    if (activeSectionIndex === index) setActiveSectionIndex(null);
  };

  const updateSection = (index: number, updates: Partial<Section>) => {
    setSections(sections.map((s, i) => i === index ? { ...s, ...updates } : s));
  };

  const addQuestion = (sectionIndex: number, type: QuestionType) => {
    const newQuestion: Question = {
      id: generateId(),
      type,
      question: '',
      required: true,
      points: 1,
      ...(type === 'multiple-choice' && { options: ['', ''], correctAnswer: 0 }),
      ...(type === 'true-false' && { correctAnswer: 0 }),
    };

    const section = sections[sectionIndex];
    if (section.type === 'questions') {
      updateSection(sectionIndex, {
        questions: [...(section.questions || []), newQuestion],
      });
    }
  };

  const updateQuestion = (sectionIndex: number, questionIndex: number, updates: Partial<Question>) => {
    const section = sections[sectionIndex];
    if (section.type === 'questions' && section.questions) {
      const updatedQuestions = section.questions.map((q, i) =>
        i === questionIndex ? { ...q, ...updates } : q
      );
      updateSection(sectionIndex, { questions: updatedQuestions });
    }
  };

  const removeQuestion = (sectionIndex: number, questionIndex: number) => {
    const section = sections[sectionIndex];
    if (section.type === 'questions' && section.questions) {
      updateSection(sectionIndex, {
        questions: section.questions.filter((_, i) => i !== questionIndex),
      });
    }
  };

  const addOption = (sectionIndex: number, questionIndex: number) => {
    const section = sections[sectionIndex];
    if (section.type === 'questions' && section.questions) {
      const question = section.questions[questionIndex];
      if (question.type === 'multiple-choice' && question.options) {
        updateQuestion(sectionIndex, questionIndex, {
          options: [...question.options, ''],
        });
      }
    }
  };

  const updateOption = (sectionIndex: number, questionIndex: number, optionIndex: number, value: string) => {
    const section = sections[sectionIndex];
    if (section.type === 'questions' && section.questions) {
      const question = section.questions[questionIndex];
      if (question.type === 'multiple-choice' && question.options) {
        const updatedOptions = question.options.map((opt, i) =>
          i === optionIndex ? value : opt
        );
        updateQuestion(sectionIndex, questionIndex, { options: updatedOptions });
      }
    }
  };

  const removeOption = (sectionIndex: number, questionIndex: number, optionIndex: number) => {
    const section = sections[sectionIndex];
    if (section.type === 'questions' && section.questions) {
      const question = section.questions[questionIndex];
      if (question.type === 'multiple-choice' && question.options && question.options.length > 2) {
        const updatedOptions = question.options.filter((_, i) => i !== optionIndex);
        updateQuestion(sectionIndex, questionIndex, {
          options: updatedOptions,
          correctAnswer: question.correctAnswer === optionIndex ? 0 : question.correctAnswer,
        });
      }
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('El título es obligatorio');
      return;
    }

    setLoading(true);
    try {
      const activityId = activity?.activityId || `activity-${Date.now()}`;
      const now = Date.now();

      const activityData: Activity = {
        activityId,
        title: title.trim(),
        content: {
          description: description.trim() || undefined,
          sections: sections,
        },
        createdAt: activity?.createdAt || now,
        updatedAt: now,
      };

      if (activity?.id) {
        // Actualizar actividad existente
        await db.activities.update(activity.id, activityData);
      } else {
        // Crear nueva actividad
        await db.activities.add(activityData);
      }

      if (onSave) {
        onSave({ ...activityData, id: activity?.id });
      }
    } catch (error) {
      console.error('Error guardando actividad:', error);
      alert('Error al guardar la actividad. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getQuestionTypeLabel = (type: QuestionType): string => {
    const labels = {
      'multiple-choice': 'Opción Múltiple',
      'text': 'Texto Libre',
      'true-false': 'Verdadero/Falso',
      'code': 'Código',
      'essay': 'Ensayo',
    };
    return labels[type];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {activity ? 'Editar Actividad' : 'Crear Nueva Actividad'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Construye actividades interactivas con diferentes tipos de contenido
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Editar' : 'Vista Previa'}
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={loading || !title.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {!showPreview ? (
        <div className="space-y-6">
          {/* Información básica */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Información Básica
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título de la Actividad *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ej: Introducción a React"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Descripción de la actividad..."
                />
              </div>
            </div>
          </div>

          {/* Secciones */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Contenido de la Actividad
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => addSection('text')}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Texto
                </button>
                <button
                  onClick={() => addSection('resource')}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <LinkIcon className="w-4 h-4" />
                  Recurso
                </button>
                <button
                  onClick={() => addSection('questions')}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Preguntas
                </button>
              </div>
            </div>

            {sections.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No hay contenido aún. Añade secciones para construir tu actividad.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sections.map((section, sectionIndex) => (
                  <div
                    key={section.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {section.type === 'text' && 'Texto'}
                          {section.type === 'resource' && 'Recurso'}
                          {section.type === 'questions' && 'Preguntas'}
                        </span>
                      </div>
                      <button
                        onClick={() => removeSection(sectionIndex)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {section.type === 'text' && (
                      <textarea
                        value={section.content || ''}
                        onChange={(e) => updateSection(sectionIndex, { content: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        placeholder="Escribe el contenido aquí..."
                      />
                    )}

                    {section.type === 'resource' && (
                      <select
                        value={section.resourceId || ''}
                        onChange={(e) => updateSection(sectionIndex, { resourceId: e.target.value })}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Selecciona un recurso</option>
                        {resources.map((resource) => (
                          <option key={resource.resourceId} value={resource.resourceId}>
                            {resource.title} ({resource.type})
                          </option>
                        ))}
                      </select>
                    )}

                    {section.type === 'questions' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {section.questions?.length || 0} pregunta(s)
                          </span>
                          <div className="flex items-center gap-2">
                            <select
                              onChange={(e) => {
                                const type = e.target.value as QuestionType;
                                addQuestion(sectionIndex, type);
                                e.target.value = '';
                              }}
                              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="">Añadir pregunta...</option>
                              <option value="multiple-choice">Opción Múltiple</option>
                              <option value="true-false">Verdadero/Falso</option>
                              <option value="text">Texto Libre</option>
                              <option value="code">Código</option>
                              <option value="essay">Ensayo</option>
                            </select>
                          </div>
                        </div>

                        {section.questions?.map((question, questionIndex) => (
                          <div
                            key={question.id}
                            className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                  {getQuestionTypeLabel(question.type)}
                                </span>
                                {question.points && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {question.points} punto(s)
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => removeQuestion(sectionIndex, questionIndex)}
                                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <input
                              type="text"
                              value={question.question}
                              onChange={(e) => updateQuestion(sectionIndex, questionIndex, { question: e.target.value })}
                              className="w-full px-3 py-2 mb-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Escribe la pregunta..."
                            />

                            {question.type === 'multiple-choice' && question.options && (
                              <div className="space-y-2">
                                {question.options.map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`correct-${sectionIndex}-${questionIndex}`}
                                      checked={question.correctAnswer === optionIndex}
                                      onChange={() => updateQuestion(sectionIndex, questionIndex, { correctAnswer: optionIndex })}
                                      className="w-4 h-4 text-indigo-600"
                                    />
                                    <input
                                      type="text"
                                      value={option}
                                      onChange={(e) => updateOption(sectionIndex, questionIndex, optionIndex, e.target.value)}
                                      className="flex-1 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                      placeholder={`Opción ${optionIndex + 1}`}
                                    />
                                    {question.options && question.options.length > 2 && (
                                      <button
                                        onClick={() => removeOption(sectionIndex, questionIndex, optionIndex)}
                                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button
                                  onClick={() => addOption(sectionIndex, questionIndex)}
                                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                  + Añadir opción
                                </button>
                              </div>
                            )}

                            {question.type === 'true-false' && (
                              <div className="space-y-2">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`tf-${sectionIndex}-${questionIndex}`}
                                    checked={question.correctAnswer === 0}
                                    onChange={() => updateQuestion(sectionIndex, questionIndex, { correctAnswer: 0 })}
                                    className="w-4 h-4 text-indigo-600"
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">Verdadero</span>
                                </label>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`tf-${sectionIndex}-${questionIndex}`}
                                    checked={question.correctAnswer === 1}
                                    onChange={() => updateQuestion(sectionIndex, questionIndex, { correctAnswer: 1 })}
                                    className="w-4 h-4 text-indigo-600"
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">Falso</span>
                                </label>
                              </div>
                            )}

                            {(question.type === 'text' || question.type === 'code' || question.type === 'essay') && (
                              <input
                                type="text"
                                value={question.placeholder || ''}
                                onChange={(e) => updateQuestion(sectionIndex, questionIndex, { placeholder: e.target.value })}
                                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Placeholder para la respuesta..."
                              />
                            )}

                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={question.required}
                                  onChange={(e) => updateQuestion(sectionIndex, questionIndex, { required: e.target.checked })}
                                  className="w-4 h-4 text-indigo-600"
                                />
                                <span className="text-xs text-gray-600 dark:text-gray-400">Obligatoria</span>
                              </label>
                              <input
                                type="number"
                                value={question.points || 1}
                                onChange={(e) => updateQuestion(sectionIndex, questionIndex, { points: parseInt(e.target.value) || 1 })}
                                min="1"
                                className="w-20 px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Puntos"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title || 'Sin título'}</h3>
          {description && (
            <p className="text-gray-600 dark:text-gray-400 mb-6">{description}</p>
          )}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <div key={section.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                {section.type === 'text' && (
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{section.content}</p>
                  </div>
                )}
                {section.type === 'resource' && section.resourceId && (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Recurso: {resources.find(r => r.resourceId === section.resourceId)?.title || section.resourceId}
                    </p>
                  </div>
                )}
                {section.type === 'questions' && section.questions && (
                  <div className="space-y-4">
                    {section.questions.map((question, qIndex) => (
                      <div key={question.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                            {getQuestionTypeLabel(question.type)}
                          </span>
                          {question.points && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {question.points} punto(s)
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                          {question.question || 'Pregunta sin texto'}
                        </p>
                        {question.type === 'multiple-choice' && question.options && (
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`p-2 rounded-lg border ${
                                  question.correctAnswer === optIndex
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}
                              >
                                <span className="text-sm">{option || 'Opción vacía'}</span>
                                {question.correctAnswer === optIndex && (
                                  <span className="ml-2 text-xs text-green-600 dark:text-green-400">✓ Correcta</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {question.type === 'true-false' && (
                          <div className="space-y-2">
                            <div className={`p-2 rounded-lg border ${
                              question.correctAnswer === 0
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              <span className="text-sm">Verdadero</span>
                              {question.correctAnswer === 0 && (
                                <span className="ml-2 text-xs text-green-600 dark:text-green-400">✓ Correcta</span>
                              )}
                            </div>
                            <div className={`p-2 rounded-lg border ${
                              question.correctAnswer === 1
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              <span className="text-sm">Falso</span>
                              {question.correctAnswer === 1 && (
                                <span className="ml-2 text-xs text-green-600 dark:text-green-400">✓ Correcta</span>
                              )}
                            </div>
                          </div>
                        )}
                        {(question.type === 'text' || question.type === 'code' || question.type === 'essay') && (
                          <div className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {question.placeholder || 'Campo de respuesta...'}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
