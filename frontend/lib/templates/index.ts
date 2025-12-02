/**
 * Plantillas predefinidas de actividades
 */

import { Activity } from '@/lib/db';
import { generateId } from '@/lib/utils';

export interface ActivityTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  content: any; // Estructura de contenido de la actividad
}

export const activityTemplates: ActivityTemplate[] = [
  {
    id: 'quiz-basico',
    name: 'Quiz Básico',
    description: 'Quiz con preguntas de opción múltiple',
    category: 'Evaluación',
    icon: '📝',
    content: {
      description: 'Quiz básico de evaluación',
      sections: [
        {
          id: 'intro',
          type: 'text',
          content: 'Bienvenido al quiz. Lee las preguntas cuidadosamente y selecciona la respuesta correcta.',
        },
        {
          id: 'questions',
          type: 'questions',
          questions: [
            {
              id: 'q1',
              type: 'multiple-choice',
              question: 'Pregunta de ejemplo',
              options: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
              correctAnswer: 0,
              required: true,
              points: 10,
            },
          ],
        },
      ],
    },
  },
  {
    id: 'encuesta',
    name: 'Encuesta',
    description: 'Encuesta con preguntas abiertas y de opción múltiple',
    category: 'Encuesta',
    icon: '📊',
    content: {
      description: 'Encuesta de opinión',
      sections: [
        {
          id: 'intro',
          type: 'text',
          content: 'Por favor, completa esta encuesta. Tus respuestas son importantes para nosotros.',
        },
        {
          id: 'questions',
          type: 'questions',
          questions: [
            {
              id: 'q1',
              type: 'text',
              question: '¿Cuál es tu opinión sobre...?',
              placeholder: 'Escribe tu respuesta aquí',
              required: true,
              points: 5,
            },
            {
              id: 'q2',
              type: 'multiple-choice',
              question: 'Selecciona una opción',
              options: ['Opción 1', 'Opción 2', 'Opción 3'],
              required: false,
              points: 5,
            },
          ],
        },
      ],
    },
  },
  {
    id: 'evaluacion-codigo',
    name: 'Evaluación de Código',
    description: 'Actividad para evaluar conocimientos de programación',
    category: 'Programación',
    icon: '💻',
    content: {
      description: 'Evaluación de conocimientos de programación',
      sections: [
        {
          id: 'intro',
          type: 'text',
          content: 'Completa los siguientes ejercicios de programación.',
        },
        {
          id: 'questions',
          type: 'questions',
          questions: [
            {
              id: 'q1',
              type: 'code',
              question: 'Escribe una función que calcule la suma de dos números',
              placeholder: 'function suma(a, b) {\n  // Tu código aquí\n}',
              required: true,
              points: 20,
            },
            {
              id: 'q2',
              type: 'true-false',
              question: 'JavaScript es un lenguaje de programación',
              correctAnswer: 0,
              required: true,
              points: 10,
            },
          ],
        },
      ],
    },
  },
  {
    id: 'ensayo',
    name: 'Ensayo',
    description: 'Actividad de escritura extensa',
    category: 'Escritura',
    icon: '✍️',
    content: {
      description: 'Actividad de escritura de ensayo',
      sections: [
        {
          id: 'intro',
          type: 'text',
          content: 'Escribe un ensayo sobre el tema propuesto. Asegúrate de incluir introducción, desarrollo y conclusión.',
        },
        {
          id: 'questions',
          type: 'questions',
          questions: [
            {
              id: 'q1',
              type: 'essay',
              question: 'Escribe tu ensayo aquí',
              placeholder: 'Mínimo 500 palabras',
              required: true,
              points: 50,
            },
          ],
        },
      ],
    },
  },
  {
    id: 'examen-completo',
    name: 'Examen Completo',
    description: 'Examen con múltiples tipos de preguntas',
    category: 'Evaluación',
    icon: '📚',
    content: {
      description: 'Examen completo de evaluación',
      sections: [
        {
          id: 'intro',
          type: 'text',
          content: 'Este examen contiene diferentes tipos de preguntas. Lee cada pregunta cuidadosamente antes de responder.',
        },
        {
          id: 'questions',
          type: 'questions',
          questions: [
            {
              id: 'q1',
              type: 'multiple-choice',
              question: 'Pregunta de opción múltiple',
              options: ['A', 'B', 'C', 'D'],
              correctAnswer: 0,
              required: true,
              points: 10,
            },
            {
              id: 'q2',
              type: 'true-false',
              question: 'Verdadero o Falso',
              correctAnswer: 0,
              required: true,
              points: 5,
            },
            {
              id: 'q3',
              type: 'text',
              question: 'Pregunta de texto corto',
              placeholder: 'Escribe tu respuesta',
              required: true,
              points: 10,
            },
          ],
        },
      ],
    },
  },
];

/**
 * Crear actividad desde plantilla
 */
export function createActivityFromTemplate(templateId: string, title: string): Activity {
  const template = activityTemplates.find(t => t.id === templateId);
  
  if (!template) {
    throw new Error(`Plantilla ${templateId} no encontrada`);
  }

  return {
    activityId: generateId(),
    title,
    content: JSON.parse(JSON.stringify(template.content)), // Deep copy
    tags: [template.category.toLowerCase()],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Obtener plantillas por categoría
 */
export function getTemplatesByCategory(category?: string): ActivityTemplate[] {
  if (!category) {
    return activityTemplates;
  }
  return activityTemplates.filter(t => t.category === category);
}

/**
 * Obtener categorías disponibles
 */
export function getCategories(): string[] {
  return Array.from(new Set(activityTemplates.map(t => t.category)));
}

