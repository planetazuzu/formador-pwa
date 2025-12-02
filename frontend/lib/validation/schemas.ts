/**
 * Servicio de validación de esquemas JSON
 * 
 * Valida datos contra esquemas JSON Schema antes de guardarlos
 */

import Ajv, { ValidateFunction, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);

// Esquemas adaptados a nuestra estructura de datos
const activitySchema = {
  type: 'object',
  properties: {
    activityId: { type: 'string', minLength: 1 },
    title: { type: 'string', minLength: 1 },
    content: { type: 'object' },
    createdAt: { type: 'number' },
    updatedAt: { type: 'number' },
  },
  required: ['activityId', 'title'],
  additionalProperties: true,
};

const resourceSchema = {
  type: 'object',
  properties: {
    resourceId: { type: 'string', minLength: 1 },
    title: { type: 'string', minLength: 1 },
    type: { type: 'string', enum: ['pdf', 'video', 'link', 'document', 'image', 'other'] },
    url: { type: 'string', minLength: 1 },
    metadata: { type: 'object' },
    createdAt: { type: 'number' },
    updatedAt: { type: 'number' },
  },
  required: ['resourceId', 'title', 'type'],
  additionalProperties: true,
};

const sessionSchema = {
  type: 'object',
  properties: {
    sessionId: { type: 'string', minLength: 1 },
    title: { type: 'string', minLength: 1 },
    activities: { type: 'array', items: { type: 'string' } },
    createdAt: { type: 'number' },
    updatedAt: { type: 'number' },
  },
  required: ['sessionId', 'title', 'activities'],
  additionalProperties: true,
};

const responseSchema = {
  type: 'object',
  properties: {
    responseId: { type: 'string', minLength: 1 },
    activityId: { type: 'string', minLength: 1 },
    activityTitle: { type: 'string' },
    studentName: { type: 'string' },
    studentId: { type: 'string' },
    content: { type: 'object' },
    score: { type: 'number', minimum: 0, maximum: 100 },
    status: { type: 'string', enum: ['pending', 'completed', 'graded'] },
    createdAt: { type: 'number' },
    updatedAt: { type: 'number' },
  },
  required: ['responseId', 'activityId'],
  additionalProperties: true,
};

// Compilar esquemas
const validators = {
  activity: ajv.compile(activitySchema),
  resource: ajv.compile(resourceSchema),
  session: ajv.compile(sessionSchema),
  response: ajv.compile(responseSchema),
};

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * Convertir errores de AJV a formato legible
 */
function formatErrors(errors: ErrorObject[] | null | undefined): ValidationError[] {
  if (!errors || errors.length === 0) {
    return [];
  }

  return errors.map((error) => {
    const field = error.instancePath?.replace('/', '') || error.params?.missingProperty || 'root';
    let message = error.message || 'Error de validación';

    // Mensajes más descriptivos según el tipo de error
    switch (error.keyword) {
      case 'required':
        message = `El campo "${error.params?.missingProperty}" es obligatorio`;
        break;
      case 'type':
        message = `El campo "${field}" debe ser de tipo ${error.params?.type}`;
        break;
      case 'format':
        message = `El campo "${field}" tiene un formato inválido (${error.params?.format})`;
        break;
      case 'enum':
        message = `El campo "${field}" debe ser uno de: ${(error.params?.allowedValues as string[])?.join(', ')}`;
        break;
      case 'minimum':
        message = `El campo "${field}" debe ser mayor o igual a ${error.params?.limit}`;
        break;
      case 'maximum':
        message = `El campo "${field}" debe ser menor o igual a ${error.params?.limit}`;
        break;
      case 'minLength':
        message = `El campo "${field}" debe tener al menos ${error.params?.limit} caracteres`;
        break;
      case 'maxLength':
        message = `El campo "${field}" no puede tener más de ${error.params?.limit} caracteres`;
        break;
      default:
        message = `Error en el campo "${field}": ${message}`;
    }

    return {
      field,
      message,
      value: error.data,
    };
  });
}

/**
 * Validar actividad
 */
export function validateActivity(data: any): ValidationResult {
  const valid = validators.activity(data);
  return {
    valid: valid || false,
    errors: formatErrors(validators.activity.errors),
  };
}

/**
 * Validar recurso
 */
export function validateResource(data: any): ValidationResult {
  const valid = validators.resource(data);
  return {
    valid: valid || false,
    errors: formatErrors(validators.resource.errors),
  };
}

/**
 * Validar sesión
 */
export function validateSession(data: any): ValidationResult {
  const valid = validators.session(data);
  return {
    valid: valid || false,
    errors: formatErrors(validators.session.errors),
  };
}

/**
 * Validar respuesta
 */
export function validateResponse(data: any): ValidationResult {
  const valid = validators.response(data);
  return {
    valid: valid || false,
    errors: formatErrors(validators.response.errors),
  };
}

/**
 * Sanitizar datos antes de guardar
 */
export function sanitizeData(data: any, type: 'activity' | 'resource' | 'session' | 'response'): any {
  const sanitized = { ...data };

  // Eliminar campos undefined
  Object.keys(sanitized).forEach((key) => {
    if (sanitized[key] === undefined) {
      delete sanitized[key];
    }
  });

  // Sanitización específica por tipo
  switch (type) {
    case 'activity':
      // Asegurar que title es string y no vacío
      if (sanitized.title && typeof sanitized.title === 'string') {
        sanitized.title = sanitized.title.trim();
      }
      break;

    case 'resource':
      // Asegurar que title es string y no vacío
      if (sanitized.title && typeof sanitized.title === 'string') {
        sanitized.title = sanitized.title.trim();
      }
      // Validar URL si existe
      if (sanitized.url && typeof sanitized.url === 'string') {
        sanitized.url = sanitized.url.trim();
      }
      break;

    case 'session':
      // Asegurar que title es string y no vacío
      if (sanitized.title && typeof sanitized.title === 'string') {
        sanitized.title = sanitized.title.trim();
      }
      // Asegurar que activities es un array
      if (!Array.isArray(sanitized.activities)) {
        sanitized.activities = [];
      }
      break;

    case 'response':
      // Asegurar que activityId existe
      if (!sanitized.activityId) {
        throw new Error('activityId es obligatorio para respuestas');
      }
      break;
  }

  return sanitized;
}

/**
 * Validar y sanitizar datos en un solo paso
 */
export function validateAndSanitize(
  data: any,
  type: 'activity' | 'resource' | 'session' | 'response'
): { valid: boolean; errors: ValidationError[]; sanitized?: any } {
  // Primero sanitizar
  const sanitized = sanitizeData(data, type);

  // Luego validar
  let validation: ValidationResult;
  switch (type) {
    case 'activity':
      validation = validateActivity(sanitized);
      break;
    case 'resource':
      validation = validateResource(sanitized);
      break;
    case 'session':
      validation = validateSession(sanitized);
      break;
    case 'response':
      validation = validateResponse(sanitized);
      break;
  }

  return {
    valid: validation.valid,
    errors: validation.errors,
    sanitized: validation.valid ? sanitized : undefined,
  };
}
