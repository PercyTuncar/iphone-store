'use client';

/**
 * VariantMatrix - Tabla matricial para gestionar variantes de productos
 * Permite crear/editar múltiples variantes de forma visual e intuitiva
 */

import { useState, useMemo } from 'react';
import { Plus, Trash2, Save, AlertCircle, Image as ImageIcon, X, Upload, ExternalLink } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import type { StorageCapacity, ProductCondition, ProductGrade, BatteryHealth } from '@/types/product';
import { storage } from '@/lib/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentVariantKey, setCurrentVariantKey] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [urlInput, setUrlInput] = useState('');

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

  // Gestión de imágenes por variante
  const openImageModal = (color: string, storage: StorageCapacity) => {
    const key = buildCellKey(color, storage);
    setCurrentVariantKey(key);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setCurrentVariantKey(null);
    setUrlInput('');
  };

  const getCurrentVariantImages = (): string[] => {
    if (!currentVariantKey) return [];
    const cell = data.cells[currentVariantKey];
    return cell?.images || [];
  };

  const updateVariantImages = (images: string[]) => {
    if (!currentVariantKey) return;
    updateCell(
      currentVariantKey.split('|')[0],
      currentVariantKey.split('|')[1] as StorageCapacity,
      { images }
    );
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !currentVariantKey) return;

    setUploadingImages(true);
    try {
      const currentImages = getCurrentVariantImages();
      const newImageUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} no es una imagen válida`);
          continue;
        }

        // Subir a Firebase Storage
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storagePath = `products/variants/${currentVariantKey}/${timestamp}_${sanitizedName}`;
        const storageRef = ref(storage, storagePath);

        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);
        newImageUrls.push(downloadUrl);
      }

      updateVariantImages([...currentImages, ...newImageUrls]);
      toast.success(`${newImageUrls.length} imagen(es) subida(s)`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Error al subir imágenes');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleUrlAdd = () => {
    const trimmedUrl = urlInput.trim();
    if (!trimmedUrl) {
      toast.error('Ingresa una URL válida');
      return;
    }

    try {
      new URL(trimmedUrl); // Validar URL
      const currentImages = getCurrentVariantImages();
      updateVariantImages([...currentImages, trimmedUrl]);
      setUrlInput('');
      toast.success('Imagen agregada desde URL');
    } catch {
      toast.error('URL inválida');
    }
  };

  const removeVariantImage = (index: number) => {
    const currentImages = getCurrentVariantImages();
    const newImages = currentImages.filter((_, i) => i !== index);
    updateVariantImages(newImages);
    toast.success('Imagen eliminada');
  };

  const reorderVariantImages = (fromIndex: number, toIndex: number) => {
    const currentImages = getCurrentVariantImages();
    const newImages = [...currentImages];
    const [movedItem] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedItem);
    updateVariantImages(newImages);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (fromIndex !== toIndex) {
      reorderVariantImages(fromIndex, toIndex);
      toast.success('Orden actualizado');
    }
  };

  const copyImagesToAllVariants = () => {
    if (!currentVariantKey) return;

    const currentImages = getCurrentVariantImages();
    if (currentImages.length === 0) {
      toast.error('No hay imágenes para copiar');
      return;
    }

    const confirmed = confirm(`¿Copiar ${currentImages.length} imagen(es) a TODAS las variantes habilitadas?`);
    if (!confirmed) return;

    const newCells = { ...data.cells };
    let copiedCount = 0;

    Object.keys(newCells).forEach(key => {
      if (newCells[key].enabled && key !== currentVariantKey) {
        newCells[key] = { ...newCells[key], images: [...currentImages] };
        copiedCount++;
      }
    });

    onChange({ ...data, cells: newCells });
    toast.success(`Imágenes copiadas a ${copiedCount} variante(s)`);
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
                                <div className="pt-2 border-t border-border mt-2">
                                  <button
                                    type="button"
                                    onClick={() => openImageModal(color, storage)}
                                    className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm bg-surface-tertiary hover:bg-surface-secondary border border-border rounded transition-colors"
                                  >
                                    <ImageIcon size={14} />
                                    <span>
                                      {cell.images?.length || 0} {cell.images?.length === 1 ? 'imagen' : 'imágenes'}
                                    </span>
                                  </button>
                                  {cell.images && cell.images.length > 0 && (
                                    <div className="mt-2 flex gap-1 flex-wrap">
                                      {cell.images.slice(0, 3).map((img, idx) => (
                                        <img
                                          key={idx}
                                          src={img}
                                          alt={`Preview ${idx + 1}`}
                                          className="w-10 h-10 object-cover rounded border border-border"
                                        />
                                      ))}
                                      {cell.images.length > 3 && (
                                        <div className="w-10 h-10 flex items-center justify-center bg-surface-tertiary border border-border rounded text-caption">
                                          +{cell.images.length - 3}
                                        </div>
                                      )}
                                    </div>
                                  )}
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

      {/* Modal de gestión de imágenes */}
      {imageModalOpen && currentVariantKey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-surface border-b border-border p-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  Imágenes de Variante
                </h3>
                <p className="text-caption text-text-secondary">
                  {currentVariantKey.replace('|', ' - ')}
                </p>
              </div>
              <button
                type="button"
                onClick={closeImageModal}
                className="p-2 hover:bg-surface-tertiary rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Subir archivos */}
              <div className="card p-4">
                <label className="text-label font-medium mb-3 block">
                  Subir desde computadora
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-accent transition-colors">
                  <Upload size={32} className="mx-auto mb-3 text-text-secondary" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={e => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="variant-image-upload"
                    disabled={uploadingImages}
                  />
                  <label
                    htmlFor="variant-image-upload"
                    className={`btn btn-primary ${uploadingImages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {uploadingImages ? 'Subiendo...' : 'Seleccionar imágenes'}
                  </label>
                  <p className="text-caption text-text-secondary mt-2">
                    PNG, JPG o WEBP. Múltiples archivos permitidos.
                  </p>
                </div>
              </div>

              {/* Agregar desde URL */}
              <div className="card p-4">
                <label className="text-label font-medium mb-3 block">
                  Agregar desde URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleUrlAdd()}
                    className="input flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleUrlAdd}
                    className="btn btn-primary"
                    disabled={!urlInput.trim()}
                  >
                    <Plus size={16} /> Agregar
                  </button>
                </div>
              </div>

              {/* Galería de imágenes */}
              <div className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-label font-medium">
                    Imágenes actuales ({getCurrentVariantImages().length})
                  </label>
                  <div className="flex items-center gap-2">
                    {getCurrentVariantImages().length > 0 && (
                      <>
                        <p className="text-caption text-text-secondary">
                          Arrastra para reordenar
                        </p>
                        <button
                          type="button"
                          onClick={copyImagesToAllVariants}
                          className="btn btn-ghost text-sm"
                          title="Copiar estas imágenes a todas las variantes"
                        >
                          Copiar a todas
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {getCurrentVariantImages().length === 0 ? (
                  <div className="text-center py-8 text-text-secondary">
                    <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-body">No hay imágenes agregadas</p>
                    <p className="text-caption mt-1">Sube archivos o agrega desde URL</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {getCurrentVariantImages().map((img, idx) => (
                      <div
                        key={idx}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, idx)}
                        className="relative group cursor-move"
                      >
                        <img
                          src={img}
                          alt={`Imagen ${idx + 1}`}
                          className="w-full aspect-square object-cover rounded border border-border pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-2">
                          <a
                            href={img}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-surface rounded hover:bg-surface-secondary transition-colors"
                            title="Ver imagen"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink size={16} />
                          </a>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeVariantImage(idx);
                            }}
                            className="p-2 bg-danger rounded hover:bg-danger/80 transition-colors"
                            title="Eliminar imagen"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          #{idx + 1}
                        </div>
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          🔀 Arrastra
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-surface border-t border-border p-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeImageModal}
                className="btn btn-primary"
              >
                Guardar y cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
