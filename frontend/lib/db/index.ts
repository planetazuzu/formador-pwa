import Dexie, { Table } from 'dexie';

// Interfaces básicas
export interface Activity {
  id?: number;
  activityId: string;
  title: string;
  content: any;
  createdAt: number;
  updatedAt: number;
}

export interface Resource {
  id?: number;
  resourceId: string;
  title: string;
  type: string;
  url: string;
  metadata: any;
  createdAt: number;
  updatedAt: number;
}

export interface Session {
  id?: number;
  sessionId: string;
  title: string;
  activities: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Link {
  id?: number;
  linkId: string;
  title: string;
  url: string;
  description?: string;
  expiresAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Response {
  id?: number;
  responseId: string;
  activityId: string;
  activityTitle: string;
  studentName?: string;
  studentId?: string;
  content: any; // Respuestas del estudiante
  score?: number; // Calificación opcional
  status: 'pending' | 'completed' | 'graded';
  createdAt: number;
  updatedAt: number;
}

export interface Token {
  id?: number;
  tokenId: string;
  token: string; // Token único generado
  activityId?: string; // ID de actividad asociada (opcional)
  activityTitle?: string; // Título de actividad para referencia
  expiresAt?: number; // Fecha de expiración (timestamp)
  maxUses?: number; // Máximo número de usos
  uses: number; // Número de veces usado
  isActive: boolean; // Si el token está activo o revocado
  description?: string; // Descripción opcional
  createdAt: number;
  updatedAt: number;
}

// Base de datos Dexie
class FormadorDatabase extends Dexie {
  activities!: Table<Activity>;
  resources!: Table<Resource>;
  sessions!: Table<Session>;
  links!: Table<Link>;
  responses!: Table<Response>;
  tokens!: Table<Token>;

  constructor() {
    super('FormadorDB');
    this.version(1).stores({
      activities: '++id, activityId, title, createdAt, updatedAt',
      resources: '++id, resourceId, title, type, createdAt, updatedAt',
      sessions: '++id, sessionId, title, createdAt, updatedAt',
      links: '++id, linkId, title, createdAt, updatedAt',
      responses: '++id, responseId, activityId, studentId, status, createdAt, updatedAt',
      tokens: '++id, tokenId, token, activityId, isActive, createdAt, updatedAt',
    });
  }
}

export const db = new FormadorDatabase();

