'use client';

/**
 * /admin/resenas — review moderation queue.
 * Lists pending reviews; admin can approve, reject, or feature them.
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getPendingReviews } from '@/lib/firebase/reviews';
import { actionApproveReview, actionRejectReview, actionFeatureReview } from '@/lib/actions/review.actions';
import { AppImage } from '@/components/ui/AppImage';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from '@/components/ui/Toast';
import type { Review } from '@/types/review';

export default function AdminResenasPage() {
  const { appUser } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setReviews(await getPendingReviews()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handle = async (
    action: 'approve' | 'reject' | 'feature',
    review: Review
  ) => {
    if (!appUser) return;
    const fn = action === 'approve'
      ? actionApproveReview
      : action === 'reject'
        ? actionRejectReview
        : actionFeatureReview;

    const res = await fn(appUser.uid, appUser.email, review.id, review.productId);
    if (res.success) {
      toast.success(action === 'approve' ? 'Aprobada ✓' : action === 'reject' ? 'Rechazada.' : 'Destacada ⭐');
      setReviews(prev => prev.filter(r => r.id !== review.id));
    } else {
      toast.error(res.error ?? 'Error.');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-section-title mb-1">Reseñas</h1>
        <p className="text-body text-text-secondary">Cola de moderación — más antigua primero.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : reviews.length === 0 ? (
        <div className="card p-12 text-center text-body text-text-secondary">
          No hay reseñas pendientes de moderación.
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-label text-text-secondary">{reviews.length} reseña{reviews.length > 1 ? 's' : ''} pendiente{reviews.length > 1 ? 's' : ''}</p>
          {reviews.map(r => (
            <div key={r.id} className="card p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start gap-3">
                {r.userPhoto ? (
                  <AppImage src={r.userPhoto} alt={r.userName} width={40} height={40} preset="avatar" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {r.userName[0]}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-[15px]">{r.userName}</p>
                    <span className="text-[#FF9F0A] text-[13px]">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    <Badge variant="warning">Pendiente</Badge>
                  </div>
                  <p className="text-caption text-text-tertiary mt-0.5">
                    {new Date((r.createdAt as { toDate(): Date }).toDate()).toLocaleDateString('es-PE')}
                  </p>
                </div>
              </div>

              {/* Content */}
              {r.title && <p className="font-semibold text-[15px]">{r.title}</p>}
              <p className="text-[15px] leading-relaxed">{r.body}</p>

              {/* Actions */}
              <div className="flex gap-2 pt-1 flex-wrap">
                <Button variant="primary" size="sm" onClick={() => handle('approve', r)}>
                  Aprobar ✓
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handle('feature', r)}>
                  Destacar ⭐
                </Button>
                <Button variant="danger" size="sm" onClick={() => handle('reject', r)}>
                  Rechazar ✗
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
