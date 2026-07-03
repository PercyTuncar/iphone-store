'use client';

/**
 * ReviewSection — reviews display + ReviewForm integration.
 * Phase 10: the "Escribir Opinión" button now opens ReviewForm inline.
 */

import { useState } from 'react';
import { clsx } from 'clsx';
import { AppImage } from '@/components/ui/AppImage';
import { ReviewForm } from './ReviewForm';
import { useAuth } from '@/lib/hooks/useAuth';
import type { Review } from '@/types/review';

interface ReviewSectionProps {
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
  productId: string;
  orderId?: string;           // required to submit a review
  canReview?: boolean;
  alreadyReviewed?: boolean;
}

export function ReviewSection({
  reviews,
  averageRating,
  reviewCount,
  productId,
  orderId,
  canReview  = false,
  alreadyReviewed = false,
}: ReviewSectionProps) {
  const { firebaseUser } = useAuth();
  const [expanded,    setExpanded]    = useState(false);
  const [showForm,    setShowForm]    = useState(false);
  const [submitted,   setSubmitted]   = useState(false);

  const visibleReviews = expanded ? reviews : reviews.slice(0, 4);

  return (
    <section aria-labelledby="reviews-heading" className="py-20 bg-bg-primary">
      <div className="container-main">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div>
            <h2 id="reviews-heading" className="text-section-title mb-2">
              Lo que dicen nuestros clientes
            </h2>
            {reviewCount > 0 ? (
              <div className="flex items-center gap-3">
                <div className="flex text-[#FF9F0A] text-xl" aria-label={`${averageRating} de 5 estrellas`}>
                  {[1,2,3,4,5].map(n => (
                    <span key={n} className={n <= Math.round(averageRating) ? 'text-[#FF9F0A]' : 'text-border'}>★</span>
                  ))}
                </div>
                <span className="text-[17px] font-semibold">{averageRating.toFixed(1)}</span>
                <span className="text-label text-text-secondary">
                  ({reviewCount} reseña{reviewCount !== 1 ? 's' : ''})
                </span>
              </div>
            ) : (
              <p className="text-body">Sé el primero en dejar tu opinión.</p>
            )}
          </div>

          {/* CTA */}
          {!showForm && !submitted && (
            <ReviewCTA
              firebaseUser={firebaseUser}
              canReview={canReview}
              alreadyReviewed={alreadyReviewed}
              onOpen={() => setShowForm(true)}
            />
          )}
        </div>

        {/* Inline review form */}
        {showForm && orderId && (
          <div className="mb-10 max-w-xl">
            <ReviewForm
              productId={productId}
              orderId={orderId}
              onSubmitted={() => { setShowForm(false); setSubmitted(true); }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {submitted && (
          <div className="mb-8 p-4 bg-success/5 border border-success/25 rounded-[14px] max-w-xl">
            <p className="text-[15px] text-success font-medium">
              ✓ Reseña enviada. Aparecerá aquí una vez aprobada.
            </p>
          </div>
        )}

        {/* Review cards */}
        {visibleReviews.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {visibleReviews.map(r => <ReviewCard key={r.id} review={r} />)}
            </div>
            {reviews.length > 4 && (
              <div className="text-center mt-8">
                <button onClick={() => setExpanded(v => !v)} className="btn btn-secondary text-[15px] px-6 py-2.5">
                  {expanded ? 'Ver menos' : `Ver todas las ${reviewCount} reseñas`}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-body text-text-secondary">
            Aún no hay reseñas para este modelo.
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function ReviewCard({ review }: { review: Review }) {
  const dateStr = review.approvedAt
    ? new Date((review.approvedAt as { toDate(): Date }).toDate()).toLocaleDateString('es-PE', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '';
  return (
    <article className="card p-5">
      <div className="flex items-start gap-3 mb-3">
        {review.userPhoto ? (
          <AppImage src={review.userPhoto} alt={`Foto de ${review.userName}`} width={40} height={40} preset="avatar" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-semibold text-[15px] flex-shrink-0">
            {review.userName[0]?.toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[15px] truncate">{review.userName}</p>
          <div className="flex items-center gap-2">
            <span className="text-[#FF9F0A] text-[13px]" aria-label={`${review.rating} estrellas`}>
              {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
            </span>
            {dateStr && <time className="text-caption text-text-tertiary" dateTime={dateStr}>{dateStr}</time>}
          </div>
        </div>
      </div>
      {review.title && <p className="font-semibold text-[15px] mb-1">{review.title}</p>}
      <p className="text-body text-[15px] leading-relaxed">{review.body}</p>
      {review.isSeeded && <p className="text-caption text-text-tertiary mt-2">✓ Compra verificada</p>}
    </article>
  );
}

function ReviewCTA({
  firebaseUser, canReview, alreadyReviewed, onOpen,
}: {
  firebaseUser: { uid: string } | null;
  canReview: boolean;
  alreadyReviewed: boolean;
  onOpen: () => void;
}) {
  if (!firebaseUser) return (
    <a href="/login" className="btn btn-secondary text-[15px] px-5 py-2.5 whitespace-nowrap">
      Inicia sesión para opinar
    </a>
  );
  if (alreadyReviewed) return (
    <span className="text-label text-text-secondary italic">Ya enviaste tu opinión ✓</span>
  );
  if (!canReview) return (
    <button disabled title="Solo clientes que ya recibieron su equipo pueden dejar una reseña."
      className="btn btn-ghost text-[15px] px-5 py-2.5 opacity-40 cursor-not-allowed">
      Escribir Opinión
    </button>
  );
  return (
    <button onClick={onOpen} className="btn btn-secondary text-[15px] px-5 py-2.5 whitespace-nowrap">
      Escribir Opinión
    </button>
  );
}
