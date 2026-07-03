'use client';

/**
 * ReviewForm — star-rating + text form for verified buyers.
 * PRD §15.1: only customers with a "delivered" order can submit.
 * Saved with status "pending" — admin must approve before it's public.
 */

import { useState } from 'react';
import { clsx } from 'clsx';
import { Star } from 'lucide-react';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { createReview } from '@/lib/firebase/reviews';
import { useAuth } from '@/lib/hooks/useAuth';

interface ReviewFormProps {
  productId: string;
  orderId: string;
  onSubmitted: () => void;
  onCancel: () => void;
}

export function ReviewForm({ productId, orderId, onSubmitted, onCancel }: ReviewFormProps) {
  const { firebaseUser } = useAuth();
  const [rating,   setRating]   = useState(0);
  const [hovered,  setHovered]  = useState(0);
  const [title,    setTitle]    = useState('');
  const [body,     setBody]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<{ rating?: string; body?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (rating === 0)       e.rating = 'Selecciona una puntuación.';
    if (body.trim().length < 20) e.body = 'La reseña debe tener al menos 20 caracteres.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate() || !firebaseUser) return;
    setLoading(true);
    try {
      await createReview({
        productId,
        orderId,
        userId:    firebaseUser.uid,
        userName:  firebaseUser.displayName ?? 'Cliente',
        userPhoto: firebaseUser.photoURL    ?? '',
        rating,
        title:     title.trim(),
        body:      body.trim(),
        isSeeded:  false,
      });
      toast.success('¡Gracias! Tu reseña está pendiente de revisión.');
      onSubmitted();
    } catch (err) {
      console.error(err);
      toast.error('No se pudo enviar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const displayRating = hovered || rating;

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5 animate-fade-in" noValidate>
      <h3 className="font-semibold text-[17px]">Escribe tu Opinión</h3>

      {/* Star selector */}
      <div>
        <p className="text-label text-text-primary mb-2">
          Puntuación <span className="text-danger">*</span>
        </p>
        <div className="flex gap-1" role="radiogroup" aria-label="Puntuación de 1 a 5 estrellas">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            >
              <Star
                size={28}
                className={clsx(
                  'transition-colors',
                  n <= displayRating
                    ? 'fill-[#FF9F0A] stroke-[#FF9F0A]'
                    : 'fill-transparent stroke-border'
                )}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className="text-label text-danger mt-1">{errors.rating}</p>
        )}
      </div>

      <Input
        label="Título (opcional)"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Resumen de tu experiencia"
        maxLength={100}
      />

      <Textarea
        label="Tu opinión"
        required
        value={body}
        onChange={e => setBody(e.target.value)}
        error={errors.body}
        placeholder="Cuéntanos tu experiencia con el equipo y el proceso de compra (mín. 20 caracteres)…"
        rows={4}
      />

      <div className="flex gap-3">
        <Button type="submit" variant="primary" loading={loading} className="flex-1">
          Enviar Reseña
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>

      <p className="text-caption text-text-tertiary">
        Tu reseña será publicada tras ser revisada por el equipo de iPhone en Cuotas.
      </p>
    </form>
  );
}
