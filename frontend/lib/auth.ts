'use client';

const ADMIN_KEY = 'formador_admin';
const ADMIN_PASSWORD_KEY = 'formador_admin_password';
const PASSWORD_CHANGED_KEY = 'formador_password_changed';

// Contraseña por defecto (debe cambiarse la primera vez)
const DEFAULT_ADMIN_PASSWORD = 'admin123';

export const auth = {
  // Verificar si el usuario es admin
  isAdmin: (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(ADMIN_KEY) === 'true';
  },

  // Verificar si la contraseña ha sido cambiada
  isPasswordChanged: (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(PASSWORD_CHANGED_KEY) === 'true';
  },

  // Iniciar sesión como admin
  login: (password: string): boolean => {
    const savedPassword = localStorage.getItem(ADMIN_PASSWORD_KEY);
    const isDefaultPassword = !savedPassword && password === DEFAULT_ADMIN_PASSWORD;
    const isCorrectPassword = savedPassword ? password === savedPassword : isDefaultPassword;

    if (isCorrectPassword) {
      localStorage.setItem(ADMIN_KEY, 'true');
      return true;
    }
    return false;
  },

  // Cerrar sesión
  logout: (): void => {
    localStorage.removeItem(ADMIN_KEY);
  },

  // Cambiar contraseña
  setPassword: (newPassword: string, oldPassword: string): boolean => {
    // Verificar contraseña antigua
    const savedPassword = localStorage.getItem(ADMIN_PASSWORD_KEY);
    const isDefaultPassword = !savedPassword && oldPassword === DEFAULT_ADMIN_PASSWORD;
    const isCorrectOldPassword = savedPassword ? oldPassword === savedPassword : isDefaultPassword;

    if (!isCorrectOldPassword) {
      return false;
    }

    localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword);
    localStorage.setItem(PASSWORD_CHANGED_KEY, 'true');
    return true;
  },

  // Verificar contraseña actual
  checkPassword: (password: string): boolean => {
    const savedPassword = localStorage.getItem(ADMIN_PASSWORD_KEY);
    if (!savedPassword) {
      return password === DEFAULT_ADMIN_PASSWORD;
    }
    return password === savedPassword;
  },
};

