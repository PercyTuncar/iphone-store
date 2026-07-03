'use client';

/**
 * Toast — thin wrapper around react-hot-toast with Apple-style presets.
 *
 * Usage:
 *   import { toast } from '@/components/ui/Toast';
 *   toast.success('¡Pago aprobado!');
 *   toast.error('El comprobante fue rechazado.');
 */

import { toast as hotToast, type ToastOptions } from 'react-hot-toast';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

const BASE_OPTIONS: ToastOptions = {
  duration: 4000,
  style: {
    background: '#1D1D1F',
    color: '#FFFFFF',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '500',
    padding: '12px 20px',
    maxWidth: '420px',
  },
};

const successIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34C759" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
const errorIcon   = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
const infoIcon    = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5AC8FA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
const warnIcon    = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF9F0A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;

export const toast = {
  success: (message: string, options?: ToastOptions) =>
    hotToast.success(message, {
      ...BASE_OPTIONS,
      icon: successIcon as never,
      style: { ...BASE_OPTIONS.style, borderLeft: '4px solid #34C759' },
      ...options,
    }),

  error: (message: string, options?: ToastOptions) =>
    hotToast.error(message, {
      ...BASE_OPTIONS,
      icon: errorIcon as never,
      style: { ...BASE_OPTIONS.style, borderLeft: '4px solid #FF3B30' },
      ...options,
    }),

  info: (message: string, options?: ToastOptions) =>
    hotToast(message, {
      ...BASE_OPTIONS,
      icon: infoIcon as never,
      style: { ...BASE_OPTIONS.style, borderLeft: '4px solid #5AC8FA' },
      ...options,
    }),

  warning: (message: string, options?: ToastOptions) =>
    hotToast(message, {
      ...BASE_OPTIONS,
      icon: warnIcon as never,
      style: { ...BASE_OPTIONS.style, borderLeft: '4px solid #FF9F0A' },
      ...options,
    }),

  dismiss: hotToast.dismiss,
  loading: (message: string, options?: ToastOptions) =>
    hotToast.loading(message, { ...BASE_OPTIONS, ...options }),
  promise: hotToast.promise,
};

export { CheckCircle, XCircle, Info, AlertTriangle };
