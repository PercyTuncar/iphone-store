'use client';

/**
 * VariantMatrix - Tabla matricial para gestionar variantes de productos
 * Permite crear/editar múltiples variantes de forma visual e intuitiva
 */

import { useState, useMemo } from 'react';
import { Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import type { StorageCapacity, ProductCondition, ProductGrade, BatteryHealth } from '@/types/product';

export interface VariantCell {
  enabled: boolean;
  stock: number;
  priceTotal: number;
  condition: ProductCondition;
  grade: ProductGrade | '';
  batteryHealth: BatteryHealth | null;
  sku?: string;
  images?: string[]; // URLs de imágenes específicas de esta variante
}

export interface VariantMatrixData {
  colors: string[];
  storages: StorageCapacity[];
  cells: Record<string, VariantCell>; // key: "color|storage"
}

interface VariantMatrixProps {
  data: VariantMatrixData;
  onChange: (data: VariantMatrixData) => void;
  modelName: string;
  basePrice?: number;
}

const STORAGE_ORDER: StorageCapacity[] = ['64GB', '128GB', '256GB', '512GB', '1TB'];
const STORAGE_MULTIPLIERS = {
  '64GB': 1.0,
  '128GB': 1.1,
  '256GB': 1.2,
  '512GB': 1.4,
  '1TB': 1.6,
};

function buildCellKey(color: string, storage: StorageCapacity): string {
  return `${color}|${storage}`;
}

function buildSKU(modelName: string, storage: StorageCapacity, color: string, grade: string | ProductGrade): string {
  return [modelName, storage, color, grade || 'NEW']
    .join('-')
    .replace(/\s+/g, '-')
    .toUpperCase();
}

export function VariantMatrix({ data, onChange, modelName, basePrice = 3999 }: VariantMatrixProps) {
  const [newColor, setNewColor] = useState('');
  const [selectedStorages, setSelectedStorages] = useState<Set<StorageCapacity>>(
    new Set(data.storages.length ? data.storages : ['128GB', '256GB', '512GB'])
  );

  // Calcular precio sugerido basado en storage
  const getSuggestedPrice = (storage: StorageCapacity): number => {
    return Math.round(basePrice * STORAGE_MULTIPLIERS[storage]);
  };

  // Agregar nuevo color
  const addColor = () => {
    const trimmed = newColor.trim();
    if (!trimmed) {
      toast.error('Ingresa un color válido');
      return;
    }
    if (data.colors.includes(trimmed)) {
      toast.error('Ese color ya existe');
      return;
    }

    const newCells = { ...data.cells };
    Array.from(selectedStorages).forEach(storage => {
      const key = buildCellKey(trimmed, storage);
      newCells[key] = {
        enabled: true,
        stock: 0,
        priceTotal: getSuggestedPrice(storage),
        condition: 'new',
        grade: '',
        batteryHealth: null,
      };
    });

    onChange({
      colors: [...data.colors, trimmed],
      storages: Array.from(selectedStorages),
      cells: newCells,
    });
    setNewColor('');
    toast.success(`Color "${trimmed}" agregado`);
  };

  // Remover color
  const removeColor = (color: string) => {
    const newCells = { ...data.cells };
    Array.from(selectedStorages).forEach(storage => {
      delete newCells[buildCellKey(color, storage)];
    });

    onChange({
      colors: data.colors.filter(c => c !== color),
      storages: data.storages,
      cells: newCells,
    });
    toast.success(`Color "${color}" eliminado`);
  };

  // Toggle storage column
  const toggleStorage = (storage: StorageCapacity) => {
    const newSet = new Set(selectedStorages);
    if (newSet.has(storage)) {
      newSet.delete(storage);
      // Remover celdas de este storage
      const newCells = { ...data.cells };
      data.colors.forEach(color => {
        delete newCells[buildCellKey(color, storage)];
      });
      onChange({
        ...data,
        storages: Array.from(newSet),
        cells: newCells,
      });
    } else {
      newSet.add(storage);
      // Agregar celdas para este storage
      const newCells = { ...data.cells };
      data.colors.forEach(color => {
        const key = buildCellKey(color, storage);
        if (!newCells[key]) {
          newCells[key] = {
            enabled: true,
            stock: 0,
            priceTotal: getSuggestedPrice(storage),
            condition: 'new',
            grade: '',
            batteryHealth: null,
          };
        }
      });
      onChange({
        ...data,
        storages: Array.from(newSet),
        cells: newCells,
      });
    }
    setSelectedStorages(newSet);
  };

  // Actualizar celda
  const updateCell = (color: string, storage: StorageCapacity, updates: Partial<VariantCell>) => {
    const key = buildCellKey(color, storage);
    const cell = data.cells[key];
    if (!cell) return;

    onChange({
      ...data,
      cells: {
        ...data.cells,
        [key]: { ...cell, ...updates },
      },
    });
  };

  // Toggle enabled de una celda
  const toggleCell = (color: string, storage: StorageCapacity) => {
    const key = buildCellKey(color, storage);
    const cell = data.cells[key];
    if (!cell) {
      // Crear celda si no existe
      onChange({
        ...data,
        cells: {
          ...data.cells,
          [key]: {
            enabled: true,
            stock: 0,
            priceTotal: getSuggestedPrice(storage),
            condition: 'new',
            grade: '',
            batteryHealth: null,
          },
        },
      });
    } else {
      updateCell(color, storage, { enabled: !cell.enabled });
    }
  };

  // Bulk actions
  const applyStockToAll = () => {
    const stock = prompt('¿Cuánto stock aplicar a todas las variantes habilitadas?');
    if (!stock) return;
    const stockNum = parseInt(stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      toast.error('Stock inválido');
      return;
    }

    const newCells = { ...data.cells };
    Object.keys(newCells).forEach(key => {
      if (newCells[key].enabled) {
        newCells[key] = { ...newCells[key], stock: stockNum };
      }
    });
    onChange({ ...data, cells: newCells });
    toast.success(`Stock de ${stockNum} aplicado a todas las variantes`);
  };

  const incrementPrices = () => {
    const percent = prompt('¿Qué porcentaje incrementar? (ej: 10 para +10%)');
    if (!percent) return;
    const percentNum = parseFloat(percent);
    if (isNaN(percentNum)) {
      toast.error('Porcentaje inválido');
      return;
    }

    const newCells = { ...data.cells };
    Object.keys(newCells).forEach(key => {
      if (newCells[key].enabled) {
        const newPrice = Math.round(newCells[key].priceTotal * (1 + percentNum / 100));
        newCells[key] = { ...newCells[key], priceTotal: newPrice };
      }
    });
    onChange({ ...data, cells: newCells });
    toast.success(`Precios incrementados +${percentNum}%`);
  };

  // Contar variantes habilitadas
  const enabledCount = useMemo(() => {
    return Object.values(data.cells).filter(cell => cell.enabled).length;
  }, [data.cells]);

  const activeStorages = Array.from(selectedStorages).sort((a, b) =>
    STORAGE_ORDER.indexOf(a) - STORAGE_ORDER.indexOf(b)
  );

  return (
    <div className="space-y-6">
      {/* Header con stats */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-[18px] font-semibold">Variantes del Producto</h3>
          <p className="text-body text-text-secondary">
            {enabledCount} variante{enabledCount !== 1 ? 's' : ''} habilitada{enabledCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-ghost text-sm"
            onClick={applyStockToAll}
            disabled={enabledCount === 0}
          >
            Aplicar stock a todas
          </button>
          <button
            type="button"
            className="btn btn-ghost text-sm"
            onClick={incrementPrices}
            disabled={enabledCount === 0}
          >
            Incrementar precios
          </button>
        </div>
      </div>

      {/* Selector de storages */}
      <div className="card p-4">
        <p className="text-label font-medium mb-3">Capacidades disponibles:</p>
        <div className="flex items-center gap-3 flex-wrap">
          {STORAGE_ORDER.map(storage => (
            <label key={storage} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedStorages.has(storage)}
                onChange={() => toggleStorage(storage)}
                className="w-4 h-4 rounded border-border accent-accent"
              />
              <span className="text-body">{storage}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Agregar color */}
      <div className="card p-4">
        <p className="text-label font-medium mb-3">Agregar color:</p>
        <div className="flex items-center gap-3">
          <input
            type="text"
            className="input flex-1"
            placeholder="ej: Negro, Azul Titanio, Oro Rosa"
            value={newColor}
            onChange={e => setNewColor(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addColor()}
          />
          <button type="button" className="btn btn-primary" onClick={addColor}>
            <Plus size={16} /> Agregar
          </button>
        </div>
      </div>

      {/* Matriz de variantes */}
      {data.colors.length === 0 ? (
        <div className="card p-8 text-center">
          <AlertCircle size={32} className="mx-auto text-text-secondary mb-3" />
          <p className="text-body text-text-secondary">
            Agrega al menos un color para empezar a crear variantes
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-secondary">
                <th className="p-3 text-left text-label font-semibold border border-border">
                  Color / Storage
                </th>
                {activeStorages.map(storage => (
                  <th key={storage} className="p-3 text-center text-label font-semibold border border-border min-w-[180px]">
                    {storage}
                  </th>
                ))}
                <th className="p-3 text-center text-label font-semibold border border-border w-[60px]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {data.colors.map((color, colorIdx) => (
                <tr key={color} className={colorIdx % 2 === 0 ? 'bg-surface' : 'bg-surface-secondary'}>
                  <td className="p-3 font-medium border border-border">
                    {color}
                  </td>
                  {activeStorages.map(storage => {
                    const key = buildCellKey(color, storage);
                    const cell = data.cells[key];
                    const sku = cell ? buildSKU(modelName, storage, color, cell.grade || cell.condition) : '';

                    return (
                      <td key={storage} className="p-2 border border-border">
                        {cell ? (
                          <div className="space-y-2">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={cell.enabled}
                                onChange={() => toggleCell(color, storage)}
                                className="w-4 h-4 rounded border-border accent-accent"
                              />
                              <span className="text-caption text-text-secondary">Habilitar</span>
                            </label>
                            {cell.enabled && (
                              <>
                                <div>
                                  <label className="text-caption text-text-secondary">Stock</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={cell.stock}
                                    onChange={e => updateCell(color, storage, { stock: parseInt(e.target.value, 10) || 0 })}
                                    className="input w-full text-sm mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-caption text-text-secondary">Precio (PEN)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={cell.priceTotal}
                                    onChange={e => updateCell(color, storage, { priceTotal: parseFloat(e.target.value) || 0 })}
                                    className="input w-full text-sm mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-caption text-text-secondary">Condición</label>
                                  <select
                                    value={cell.condition}
                                    onChange={e => updateCell(color, storage, { condition: e.target.value as ProductCondition })}
                                    className="input w-full text-sm mt-1"
                                  >
                                    <option value="new">Nuevo</option>
                                    <option value="refurbished">Reacondicionado</option>
                                  </select>
                                </div>
                                {cell.condition === 'refurbished' && (
                                  <>
                                    <div>
                                      <label className="text-caption text-text-secondary">Grado</label>
                                      <select
                                        value={cell.grade}
                                        onChange={e => updateCell(color, storage, { grade: e.target.value as ProductGrade | '' })}
                                        className="input w-full text-sm mt-1"
                                      >
                                        <option value="">—</option>
                                        <option value="A+">A+</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-caption text-text-secondary">Batería</label>
                                      <select
                                        value={cell.batteryHealth ?? ''}
                                        onChange={e => updateCell(color, storage, {
                                          batteryHealth: e.target.value ? (Number(e.target.value) as BatteryHealth) : null
                                        })}
                                        className="input w-full text-sm mt-1"
                                      >
                                        <option value="">—</option>
                                        <option value="100">100%</option>
                                        <option value="95">95%</option>
                                        <option value="90">90%</option>
                                        <option value="85">85%</option>
                                        <option value="80">80%</option>
                                      </select>
                                    </div>
                                  </>
                                )}
                                <div className="pt-1">
                                  <p className="text-caption text-text-secondary font-mono truncate" title={sku}>
                                    SKU: {sku}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="w-full h-full min-h-[100px] text-text-secondary hover:bg-surface-tertiary transition-colors"
                            onClick={() => toggleCell(color, storage)}
                          >
                            <Plus size={20} className="mx-auto" />
                          </button>
                        )}
                      </td>
                    );
                  })}
                  <td className="p-2 border border-border text-center">
                    <button
                      type="button"
                      onClick={() => removeColor(color)}
                      className="text-danger hover:opacity-70 p-2"
                      title="Eliminar color"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {enabledCount === 0 && data.colors.length > 0 && (
        <div className="card p-4 bg-warning/10 border-warning">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-warning mt-0.5" />
            <div>
              <p className="text-body font-medium">No hay variantes habilitadas</p>
              <p className="text-caption text-text-secondary mt-1">
                Habilita al menos una combinación de color/storage para crear variantes
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
