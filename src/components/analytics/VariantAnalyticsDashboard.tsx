'use client';

/**
 * VariantAnalyticsDashboard - Panel de analytics para variantes
 * Muestra métricas de vistas, interacciones y conversiones
 */

import { useEffect, useState } from 'react';
import { Eye, MousePointer, ShoppingCart, TrendingUp, Calendar } from 'lucide-react';
import { getVariantAnalytics, getTopVariants, getVariantHeatmap } from '@/lib/analytics/variantTracking';
import type { VariantAnalytics } from '@/lib/analytics/variantTracking';
import type { Product } from '@/types/product';

interface VariantAnalyticsDashboardProps {
  masterProduct: Product;
  variants: Product[];
}

export function VariantAnalyticsDashboard({ masterProduct, variants }: VariantAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<Record<string, VariantAnalytics>>({});
  const [topVariants, setTopVariants] = useState<Array<{ variantId: string; viewCount: number }>>([]);
  const [heatmap, setHeatmap] = useState<Record<string, number>>({});
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [masterProduct.id, dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);

    const dateFrom = dateRange === '7d'
      ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      : dateRange === '30d'
      ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      : undefined;

    // Cargar analytics por variante
    const variantAnalytics: Record<string, VariantAnalytics> = {};
    for (const variant of variants) {
      const data = await getVariantAnalytics(variant.id, dateFrom);
      variantAnalytics[variant.id] = data;
    }
    setAnalytics(variantAnalytics);

    // Cargar top variantes
    const top = await getTopVariants(masterProduct.id, 5);
    setTopVariants(top);

    // Cargar heatmap
    const heat = await getVariantHeatmap(masterProduct.id, dateFrom);
    setHeatmap(heat);

    setLoading(false);
  };

  const getTotalMetrics = () => {
    const totals = { views: 0, interactions: 0, conversions: 0 };
    Object.values(analytics).forEach(a => {
      totals.views += a.views;
      totals.interactions += a.interactions;
      totals.conversions += a.conversions;
    });
    return totals;
  };

  const totals = getTotalMetrics();
  const overallConversionRate = totals.views > 0 ? (totals.conversions / totals.views) * 100 : 0;

  const getVariantById = (id: string) => variants.find(v => v.id === id);

  if (loading) {
    return (
      <div className="card p-8 text-center">
        <p className="text-body text-text-secondary">Cargando analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-semibold">Analytics de Variantes</h2>
          <p className="text-body text-text-secondary">{masterProduct.model}</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-text-secondary" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | 'all')}
            className="input"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="all">Todo el tiempo</option>
          </select>
        </div>
      </div>

      {/* Métricas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Eye size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-caption text-text-secondary">Vistas totales</p>
              <p className="text-[24px] font-bold">{totals.views.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <MousePointer size={20} className="text-purple-500" />
            </div>
            <div>
              <p className="text-caption text-text-secondary">Interacciones</p>
              <p className="text-[24px] font-bold">{totals.interactions.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
              <ShoppingCart size={20} className="text-success" />
            </div>
            <div>
              <p className="text-caption text-text-secondary">Conversiones</p>
              <p className="text-[24px] font-bold">{totals.conversions.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <TrendingUp size={20} className="text-accent" />
            </div>
            <div>
              <p className="text-caption text-text-secondary">Tasa de conversión</p>
              <p className="text-[24px] font-bold">{overallConversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top variantes */}
      <div className="card p-5">
        <h3 className="text-[18px] font-semibold mb-4">Variantes Más Vistas</h3>
        <div className="space-y-3">
          {topVariants.map((item, idx) => {
            const variant = getVariantById(item.variantId);
            if (!variant) return null;

            const variantAnalytics = analytics[item.variantId];
            const maxViews = topVariants[0]?.viewCount || 1;
            const percentage = (item.viewCount / maxViews) * 100;

            return (
              <div key={item.variantId} className="flex items-center gap-3">
                <div className="text-[18px] font-bold text-text-secondary w-6">
                  #{idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-body font-medium">
                      {variant.storage} {variant.color}
                    </p>
                    <div className="flex items-center gap-4 text-caption text-text-secondary">
                      <span>{item.viewCount} vistas</span>
                      <span>{variantAnalytics?.conversions || 0} conversiones</span>
                      <span className="font-semibold text-accent">
                        {variantAnalytics?.conversionRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-surface-tertiary rounded-full h-2">
                    <div
                      className="bg-accent rounded-full h-2 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabla de todas las variantes */}
      <div className="card p-5">
        <h3 className="text-[18px] font-semibold mb-4">Todas las Variantes</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-caption font-semibold text-text-secondary">
                  Variante
                </th>
                <th className="text-center py-3 px-2 text-caption font-semibold text-text-secondary">
                  Vistas
                </th>
                <th className="text-center py-3 px-2 text-caption font-semibold text-text-secondary">
                  Interacciones
                </th>
                <th className="text-center py-3 px-2 text-caption font-semibold text-text-secondary">
                  Conversiones
                </th>
                <th className="text-center py-3 px-2 text-caption font-semibold text-text-secondary">
                  Tasa Conv.
                </th>
                <th className="text-center py-3 px-2 text-caption font-semibold text-text-secondary">
                  Stock
                </th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => {
                const data = analytics[variant.id];
                if (!data) return null;

                return (
                  <tr key={variant.id} className="border-b border-border hover:bg-surface-secondary">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={variant.thumbnailUrl}
                          alt={variant.title}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div>
                          <p className="text-body font-medium">
                            {variant.storage} {variant.color}
                          </p>
                          <p className="text-caption text-text-secondary">
                            S/ {variant.priceTotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-3 px-2">{data.views}</td>
                    <td className="text-center py-3 px-2">{data.interactions}</td>
                    <td className="text-center py-3 px-2">{data.conversions}</td>
                    <td className="text-center py-3 px-2">
                      <span className="font-semibold text-accent">
                        {data.conversionRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className={variant.stock > 0 ? 'text-success' : 'text-danger'}>
                        {variant.stock}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Heatmap */}
      <div className="card p-5">
        <h3 className="text-[18px] font-semibold mb-4">Mapa de Calor de Interacciones</h3>
        <p className="text-caption text-text-secondary mb-4">
          Combinaciones más populares de almacenamiento y color
        </p>
        <div className="space-y-2">
          {Object.entries(heatmap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([key, count]) => {
              const [storage, color] = key.split('_');
              const maxCount = Math.max(...Object.values(heatmap));
              const intensity = (count / maxCount) * 100;

              return (
                <div key={key} className="flex items-center gap-3">
                  <div className="w-40 text-body font-medium">
                    {storage} - {color}
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-surface-tertiary rounded-full h-6">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-6 flex items-center justify-end px-2 transition-all"
                        style={{ width: `${intensity}%` }}
                      >
                        <span className="text-white text-xs font-semibold">
                          {count}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
