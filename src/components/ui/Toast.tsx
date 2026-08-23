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

export const toast = {
  success: (message: string, options?: ToastOptions) =>
    hotToast.success(message, {
      ...BASE_OPTIONS,
      icon: <CheckCircle size={18} color="#34C759" />,
      style: { ...BASE_OPTIONS.style, borderLeft: '4px solid #34C759' },
      ...options,
    }),

  error: (message: string, options?: ToastOptions) =>
    hotToast.error(message, {
      ...BASE_OPTIONS,
      icon: <XCircle size={18} color="#FF3B30" />,
      style: { ...BASE_OPTIONS.style, borderLeft: '4px solid #FF3B30' },
      ...options,
    }),

  info: (message: string, options?: ToastOptions) =>
    hotToast(message, {
      ...BASE_OPTIONS,
      icon: <Info size={18} color="#5AC8FA" />,
      style: { ...BASE_OPTIONS.style, borderLeft: '4px solid #5AC8FA' },
      ...options,
    }),

  warning: (message: string, options?: ToastOptions) =>
    hotToast(message, {
      ...BASE_OPTIONS,
      icon: <AlertTriangle size={18} color="#FF9F0A" />,
      style: { ...BASE_OPTIONS.style, borderLeft: '4px solid #FF9F0A' },
      ...options,
    }),

  dismiss: hotToast.dismiss,
  loading: (message: string, options?: ToastOptions) =>
    hotToast.loading(message, { ...BASE_OPTIONS, ...options }),
  promise: hotToast.promise,
};

export { CheckCircle, XCircle, Info, AlertTriangle };
