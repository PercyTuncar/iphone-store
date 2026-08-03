'use client';

/**
 * Modal — Apple-style centered dialog on desktop, bottom sheet on mobile.
 *
 * On desktop:  fade-in + scale-in animation, centered
 * On mobile:   slide-up from bottom (sheet pattern)
 *
 * Handles:
 *  - Focus trap (first focusable element on open)
 *  - Escape key to close
 *  - Scroll lock on body when open
 *  - ARIA attributes (role="dialog", aria-modal, aria-labelledby)
 */

import React, { useEffect, useRef, useId } from 'react';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  /** 'sm' | 'md' | 'lg' — max-width of the dialog */
  size?: 'sm' | 'md' | 'lg';
  /** If true, clicking the overlay does not close the modal */
  persistent?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  persistent = false,
  className,
}: ModalProps) {
  const titleId = useId();
  const descId  = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open || persistent) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose, persistent]);

  // Focus first focusable element
  useEffect(() => {
    if (!open || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
      {/* Overlay */}
      <div
        className="overlay animate-fade-in"
        onClick={persistent ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        className={clsx(
          // Base
          'relative z-50 w-full bg-bg-card shadow-floating',
          // Mobile: full-width sheet sliding from bottom
          'rounded-t-[24px] sm:rounded-[18px]',
          // Desktop: centered, max-width constrained
          SIZE_CLASSES[size],
          // Animation: slide-up on mobile, scale-in on desktop
          'animate-slide-up sm:animate-scale-in',
          // Max height and scroll
          'max-h-[90vh] flex flex-col',
          className
        )}
      >
        {/* Header - Fixed */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 flex-shrink-0 border-b border-border">
          <div>
            {title && (
              <h2 id={titleId} className="text-subtitle">
                {title}
              </h2>
            )}
            {description && (
              <p id={descId} className="text-body mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className={clsx(
              'flex items-center justify-center rounded-full',
              'w-8 h-8 ml-4 -mt-0.5',
              'text-text-secondary hover:text-text-primary',
              'bg-bg-secondary hover:bg-border',
              'transition-colors duration-150',
              'flex-shrink-0'
            )}
            aria-label="Cerrar"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 pb-24">
          {children}
        </div>
      </div>
    </div>
  );
}
