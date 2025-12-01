'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Clock, Save, Send, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { db, Activity, Resource, Response } from '@/lib/db';
import { generateId } from '@/lib/utils';
import PdfViewer from './PdfViewer';
import VideoPlayer from './VideoPlayer';

interface ActivityPlayerProps {
  activityId: string;
  onComplete?: (response: Response) => void;
}

interface Answer {
  questionId: string;
  answer: string | number | boolean;
}

export default function ActivityPlayer({ activityId, onComplete }: ActivityPlayerProps) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [startTime] = useState(Date.now());
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [studentName, setStudentName] = useState('');

  useEffect(() => {
    loadActivity();
  }, [activityId]);

  useEffect(() => {
    // Cargar recursos cuando cambie la actividad
    if (activity) {
      const content = activity.content as any;
      const resourceIds = content?.sections
        ?.filter((s: any) => s.type === 'resource' && s.resourceId)
        .map((s: any) => s.resourceId) || [];
      
      if (resourceIds.length > 0) {
        db.resources.where('resourceId').anyOf(resourceIds).toArray().then(setResources);
      }
    }
  }, [activity]);

  const loadActivity = async () => {
    try {
      setLoading(true);
      const found = await db.activities.where('activityId').equals(activityId).first();
      setActivity(found || null);
    } catch (error) {
      console.error('Error cargando actividad:', error);
      setActivity(null);
    } finally {
      setLoading(false);
    }
  };

  const getSections = () => {
    if (!activity) return [];
    const content = activity.content as any;
    return content?.sections || [];
  };

  const getAllQuestions = () => {
    const sections = getSections();
    const questions: any[] = [];
    sections.forEach((section: any) => {
      if (section.type === 'questions' && section.questions) {
        section.questions.forEach((question: any) => {
          questions.push({ ...question, sectionId: section.id });
        });
      }
    });
    return questions;
  };

  const getProgress = () => {
    const questions = getAllQuestions();
    const requiredQuestions = questions.filter(q => q.required);
    const answeredRequired = requiredQuestions.filter(q => {
      const answer = answers[q.id];
      return answer && answer.answer !== '' && answer.answer !== null && answer.answer !== undefined;
    });
    return requiredQuestions.length > 0 
      ? Math.round((answeredRequired.length / requiredQuestions.length) * 100)
      : 100;
  };

  const canSubmit = () => {
    const questions = getAllQuestions();
    const requiredQuestions = questions.filter(q => q.required);
    return requiredQuestions.every(q => {
      const answer = answers[q.id];
      return answer && answer.answer !== '' && answer.answer !== null && answer.answer !== undefined;
    });
  };

  const handleAnswer = (questionId: string, answer: string | number | boolean) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { questionId, answer },
    }));
  };

  const handleSave = async () => {
    if (!activity) return;

    setSaving(true);
    try {
      const responseId = `response-${Date.now()}`;
      const now = Date.now();

      const responseData: Response = {
        responseId,
        activityId: activity.activityId,
        activityTitle: activity.title,
        studentName: studentName || undefined,
        content: {
          answers,
          startTime,
          endTime: now,
          duration: now - startTime,
        },
        status: 'completed',
        createdAt: now,
        updatedAt: now,
      };

      await db.responses.add(responseData);
      
      if (onComplete) {
        onComplete(responseData);
      }
      
      setSubmitted(true);
    } catch (error) {
      console.error('Error guardando respuesta:', error);
      alert('Error al guardar la respuesta. Por favor, intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit()) {
      alert('Por favor, completa todas las preguntas obligatorias antes de enviar.');
      return;
    }

    await handleSave();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando actividad...</p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Actividad no encontrada
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          La actividad que buscas no existe o ha sido eliminada.
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="text-center py-16">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          ¡Respuesta enviada!
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Tu respuesta ha sido guardada correctamente.
        </p>
      </div>
    );
  }

  const content = activity.content as any;
  const sections = getSections();
  const currentSection = sections[currentSectionIndex];
  const progress = getProgress();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {activity.title}
            </h2>
            {content?.description && (
              <p className="text-gray-600 dark:text-gray-400">
                {content.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{Math.floor((Date.now() - startTime) / 1000 / 60)} min</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">Progreso</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Student name input */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tu nombre (opcional)
          </label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Escribe tu nombre..."
          />
        </div>
      </div>

      {/* Sections navigation */}
      {sections.length > 1 && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {sections.map((section: any, index: number) => (
            <button
              key={section.id}
              onClick={() => setCurrentSectionIndex(index)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                index === currentSectionIndex
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* Current section */}
      {currentSection && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          {currentSection.type === 'text' && (
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                {currentSection.content || ''}
              </p>
            </div>
          )}

          {currentSection.type === 'resource' && currentSection.resourceId && (
            <div>
              {(() => {
                const resource = resources.find(r => r.resourceId === currentSection.resourceId);
                if (!resource) {
                  return (
                    <p className="text-gray-600 dark:text-gray-400">
                      Recurso no encontrado
                    </p>
                  );
                }
                if (resource.type === 'pdf') {
                  return <PdfViewer url={resource.url} />;
                }
                if (resource.type === 'video') {
                  return <VideoPlayer url={resource.url} title={resource.title} />;
                }
                return (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {resource.title} - Abrir recurso
                    </a>
                  </div>
                );
              })()}
            </div>
          )}

          {currentSection.type === 'questions' && currentSection.questions && (
            <div className="space-y-6">
              {currentSection.questions.map((question: any, questionIndex: number) => {
                const answer = answers[question.id];
                const isRequired = question.required;
                const isAnswered = answer && answer.answer !== '' && answer.answer !== null && answer.answer !== undefined;

                return (
                  <div
                    key={question.id}
                    className={`p-4 rounded-lg border ${
                      isRequired && !isAnswered
                        ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Pregunta {questionIndex + 1}
                          </span>
                          {isRequired && (
                            <span className="text-xs text-red-500">*</span>
                          )}
                          {question.points && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ({question.points} punto{question.points !== 1 ? 's' : ''})
                            </span>
                          )}
                        </div>
                        <p className="text-gray-900 dark:text-gray-100 font-medium">
                          {question.question || 'Pregunta sin texto'}
                        </p>
                      </div>
                      {isAnswered && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>

                    {question.type === 'multiple-choice' && question.options && (
                      <div className="space-y-2">
                        {question.options.map((option: string, optionIndex: number) => (
                          <label
                            key={optionIndex}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              answer?.answer === optionIndex
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              checked={answer?.answer === optionIndex}
                              onChange={() => handleAnswer(question.id, optionIndex)}
                              className="w-4 h-4 text-indigo-600"
                            />
                            <span className="text-gray-900 dark:text-gray-100 flex-1">
                              {option || `Opción ${optionIndex + 1}`}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'true-false' && (
                      <div className="space-y-2">
                        <label
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            answer?.answer === 0
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            checked={answer?.answer === 0}
                            onChange={() => handleAnswer(question.id, 0)}
                            className="w-4 h-4 text-indigo-600"
                          />
                          <span className="text-gray-900 dark:text-gray-100">Verdadero</span>
                        </label>
                        <label
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            answer?.answer === 1
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            checked={answer?.answer === 1}
                            onChange={() => handleAnswer(question.id, 1)}
                            className="w-4 h-4 text-indigo-600"
                          />
                          <span className="text-gray-900 dark:text-gray-100">Falso</span>
                        </label>
                      </div>
                    )}

                    {(question.type === 'text' || question.type === 'code' || question.type === 'essay') && (
                      <div>
                        {question.type === 'essay' ? (
                          <textarea
                            value={(answer?.answer as string) || ''}
                            onChange={(e) => handleAnswer(question.id, e.target.value)}
                            rows={6}
                            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            placeholder={question.placeholder || 'Escribe tu respuesta aquí...'}
                          />
                        ) : (
                          <input
                            type="text"
                            value={(answer?.answer as string) || ''}
                            onChange={(e) => handleAnswer(question.id, e.target.value)}
                            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder={question.placeholder || 'Escribe tu respuesta aquí...'}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))}
          disabled={currentSectionIndex === 0}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !canSubmit()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Enviar Respuesta
          </button>
        </div>

        <button
          onClick={() => setCurrentSectionIndex(Math.min(sections.length - 1, currentSectionIndex + 1))}
          disabled={currentSectionIndex === sections.length - 1}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          Siguiente
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
