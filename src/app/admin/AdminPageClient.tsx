'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Category } from '@/types/category'
import type { Product } from '@/types/product'
import {
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryActive,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductAvailable,
} from './actions'

/* ─── Tipos ─── */
interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

interface CategoryModalState {
  open: boolean
  mode: 'create' | 'edit'
  data?: Category
}

interface ProductModalState {
  open: boolean
  mode: 'create' | 'edit'
  categoryId?: string
  data?: Product
}

interface DeleteConfirmState {
  type: 'category' | 'product'
  id: string
  name: string
}

/* ─── Iconos SVG inline ─── */
function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-5 h-5 text-[#d4af37] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function IconEdit() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}

function IconEye() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function IconEyeOff() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}

function IconX() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function IconImage() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

/* ─── Componente principal ─── */
export default function AdminPageClient({
  initialCategories,
  initialProducts,
}: {
  initialCategories: Category[]
  initialProducts: Product[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  /* Estado UI */
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [categoryModal, setCategoryModal] = useState<CategoryModalState>({ open: false, mode: 'create' })
  const [productModal, setProductModal] = useState<ProductModalState>({ open: false, mode: 'create' })
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null)

  /* Refs para formularios e imágenes */
  const categoryFormRef = useRef<HTMLFormElement>(null)
  const productFormRef = useRef<HTMLFormElement>(null)
  const categoryImageRef = useRef<HTMLInputElement>(null)
  const productImageRef = useRef<HTMLInputElement>(null)
  const [categoryImagePreview, setCategoryImagePreview] = useState<string | null>(null)
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null)

  /* ─── Helpers ─── */
  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }

  const getProductsByCategory = (categoryId: string) =>
    initialProducts.filter(p => p.category_id === categoryId)

  /* ─── Acciones de Categoría ─── */
  const handleCategorySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        const action = categoryModal.mode === 'create' ? createCategory : updateCategory
        const result = await action(formData)
        if (result?.error) {
          addToast(result.error, 'error')
        } else {
          addToast(
            categoryModal.mode === 'create' ? 'Categoría creada exitosamente' : 'Categoría actualizada',
            'success'
          )
          setCategoryModal({ open: false, mode: 'create' })
          setCategoryImagePreview(null)
          router.refresh()
        }
      } catch {
        addToast('Error al guardar la categoría', 'error')
      }
    })
  }

  const handleToggleCategory = (id: string) => {
    startTransition(async () => {
      try {
        const result = await toggleCategoryActive(id)
        if (result?.error) {
          addToast(result.error, 'error')
        } else {
          addToast('Estado de categoría actualizado', 'success')
          router.refresh()
        }
      } catch {
        addToast('Error al cambiar el estado', 'error')
      }
    })
  }

  const handleDeleteCategory = (id: string) => {
    startTransition(async () => {
      try {
        const result = await deleteCategory(id)
        if (result?.error) {
          addToast(result.error, 'error')
        } else {
          addToast('Categoría eliminada', 'success')
          setDeleteConfirm(null)
          if (expandedId === id) setExpandedId(null)
          router.refresh()
        }
      } catch {
        addToast('Error al eliminar la categoría', 'error')
      }
    })
  }

  /* ─── Acciones de Producto ─── */
  const handleProductSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        const action = productModal.mode === 'create' ? createProduct : updateProduct
        const result = await action(formData)
        if (result?.error) {
          addToast(result.error, 'error')
        } else {
          addToast(
            productModal.mode === 'create' ? 'Producto creado exitosamente' : 'Producto actualizado',
            'success'
          )
          setProductModal({ open: false, mode: 'create' })
          setProductImagePreview(null)
          router.refresh()
        }
      } catch {
        addToast('Error al guardar el producto', 'error')
      }
    })
  }

  const handleToggleProduct = (id: string) => {
    startTransition(async () => {
      try {
        const result = await toggleProductAvailable(id)
        if (result?.error) {
          addToast(result.error, 'error')
        } else {
          addToast('Estado de producto actualizado', 'success')
          router.refresh()
        }
      } catch {
        addToast('Error al cambiar el estado', 'error')
      }
    })
  }

  const handleDeleteProduct = (id: string) => {
    startTransition(async () => {
      try {
        const result = await deleteProduct(id)
        if (result?.error) {
          addToast(result.error, 'error')
        } else {
          addToast('Producto eliminado', 'success')
          setDeleteConfirm(null)
          router.refresh()
        }
      } catch {
        addToast('Error al eliminar el producto', 'error')
      }
    })
  }

  /* ─── Imagen preview ─── */
  const handleCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCategoryImagePreview(URL.createObjectURL(file))
    }
  }

  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProductImagePreview(URL.createObjectURL(file))
    }
  }

  /* ─── Botón de acción genérico ─── */
  const ActionButton = ({ onClick, title, children, variant = 'ghost' }: {
    onClick: () => void
    title: string
    children: React.ReactNode
    variant?: 'ghost' | 'danger'
  }) => (
    <button
      onClick={onClick}
      title={title}
      disabled={isPending}
      className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${
        variant === 'danger'
          ? 'text-red-400 hover:bg-red-900/30'
          : 'text-gray-400 hover:text-[#d4af37] hover:bg-[rgba(212,175,55,0.1)]'
      }`}
    >
      {children}
    </button>
  )

  /* ═══════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#0A1128] text-white px-4 py-6 md:px-8 md:py-10">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#d4af37]">
          Panel de Administración
        </h1>
        <button
          onClick={() => {
            setCategoryImagePreview(null)
            setCategoryModal({ open: true, mode: 'create' })
          }}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d4af37] text-[#0A1128] font-semibold text-sm hover:bg-[#c4a030] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <IconPlus /> Nueva Categoría
        </button>
      </div>

      {/* ─── Lista de categorías ─── */}
      {initialCategories.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="text-gray-500 mb-2 flex justify-center">
            <IconImage />
          </div>
          <p className="text-gray-400 text-lg">No hay categorías todavía</p>
          <p className="text-gray-500 text-sm mt-1">Crea la primera categoría para comenzar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {initialCategories.map(category => {
            const isExpanded = expandedId === category.id
            const categoryProducts = getProductsByCategory(category.id)

            return (
              <div
                key={category.id}
                className="glass-card rounded-2xl overflow-hidden transition-all duration-200"
              >
                {/* ── Cabecera de categoría ── */}
                <div
                  className="flex items-center justify-between p-4 md:p-5 cursor-pointer select-none"
                  onClick={() => setExpandedId(isExpanded ? null : category.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-lg bg-[rgba(212,175,55,0.1)] flex items-center justify-center text-[#d4af37] font-bold text-lg flex-shrink-0">
                        {category.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-white truncate">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-gray-400 truncate">{category.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        category.is_active
                          ? 'bg-green-900/40 text-green-400'
                          : 'bg-red-900/40 text-red-400'
                      }`}
                    >
                      {category.is_active ? 'Activa' : 'Inactiva'}
                    </span>

                    <span className="text-xs px-2.5 py-1 rounded-full bg-[rgba(255,255,255,0.05)] text-gray-400">
                      {categoryProducts.length} prod.
                    </span>

                    <IconChevron open={isExpanded} />
                  </div>
                </div>

                {/* ── Contenido expandido ── */}
                {isExpanded && (
                  <div className="border-t border-[rgba(212,175,55,0.1)]">
                    {/* Botones de acción de categoría */}
                    <div className="flex items-center gap-1 px-4 md:px-5 py-3 border-b border-[rgba(255,255,255,0.04)]">
                      <ActionButton
                        onClick={() => {
                          setCategoryImagePreview(category.image_url ?? null)
                          setCategoryModal({ open: true, mode: 'edit', data: category })
                        }}
                        title="Editar categoría"
                      >
                        <IconEdit />
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleToggleCategory(category.id)}
                        title={category.is_active ? 'Desactivar categoría' : 'Activar categoría'}
                      >
                        {category.is_active ? <IconEye /> : <IconEyeOff />}
                      </ActionButton>
                      <ActionButton
                        onClick={() =>
                          setDeleteConfirm({
                            type: 'category',
                            id: category.id,
                            name: category.name,
                          })
                        }
                        title="Eliminar categoría"
                        variant="danger"
                      >
                        <IconTrash />
                      </ActionButton>
                    </div>

                    {/* Lista de productos */}
                    <div className="px-4 md:px-5 py-2">
                      {categoryProducts.length === 0 ? (
                        <p className="text-gray-500 text-sm py-4 text-center">
                          No hay productos en esta categoría
                        </p>
                      ) : (
                        <div className="divide-y divide-[rgba(255,255,255,0.04)]">
                          {categoryProducts.map(product => (
                            <div
                              key={product.id}
                              className="flex items-center justify-between py-3 gap-3"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {product.image_url ? (
                                  <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-lg bg-[rgba(212,175,55,0.06)] flex items-center justify-center text-[#d4af37] text-sm font-bold flex-shrink-0">
                                    {product.family
                                      ? product.family.charAt(0).toUpperCase()
                                      : product.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-medium text-sm text-white truncate">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    $ {product.price.toLocaleString('es-AR')}
                                    {product.family && (
                                      <span className="ml-2 text-gray-500">· {product.family}</span>
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 flex-shrink-0">
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full font-medium hidden sm:inline-block ${
                                    product.is_available
                                      ? 'bg-green-900/40 text-green-400'
                                      : 'bg-red-900/40 text-red-400'
                                  }`}
                                >
                                  {product.is_available ? 'Disp.' : 'No disp.'}
                                </span>

                                <ActionButton
                                  onClick={() => {
                                    setProductImagePreview(product.image_url ?? null)
                                    setProductModal({
                                      open: true,
                                      mode: 'edit',
                                      categoryId: category.id,
                                      data: product,
                                    })
                                  }}
                                  title="Editar producto"
                                >
                                  <IconEdit />
                                </ActionButton>
                                <ActionButton
                                  onClick={() => handleToggleProduct(product.id)}
                                  title={product.is_available ? 'Marcar no disponible' : 'Marcar disponible'}
                                >
                                  {product.is_available ? <IconEye /> : <IconEyeOff />}
                                </ActionButton>
                                <ActionButton
                                  onClick={() =>
                                    setDeleteConfirm({
                                      type: 'product',
                                      id: product.id,
                                      name: product.name,
                                    })
                                  }
                                  title="Eliminar producto"
                                  variant="danger"
                                >
                                  <IconTrash />
                                </ActionButton>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Botón nuevo producto */}
                      <button
                        onClick={() => {
                          setProductImagePreview(null)
                          setProductModal({
                            open: true,
                            mode: 'create',
                            categoryId: category.id,
                          })
                        }}
                        disabled={isPending}
                        className="mt-2 w-full py-2.5 rounded-xl border border-dashed border-[rgba(212,175,55,0.25)] text-[#d4af37] text-sm font-medium hover:bg-[rgba(212,175,55,0.05)] transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
                      >
                        <IconPlus /> Nuevo Producto
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          MODAL: Categoría
          ═══════════════════════════════════════════════════ */}
      {categoryModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => { setCategoryModal({ open: false, mode: 'create' }); setCategoryImagePreview(null) }}
        >
          <div
            className="glass-modal w-full max-w-md rounded-2xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#d4af37]">
                {categoryModal.mode === 'create' ? 'Nueva Categoría' : 'Editar Categoría'}
              </h2>
              <button
                onClick={() => { setCategoryModal({ open: false, mode: 'create' }); setCategoryImagePreview(null) }}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <IconX />
              </button>
            </div>

            <form ref={categoryFormRef} onSubmit={handleCategorySubmit} className="space-y-4">
              {categoryModal.mode === 'edit' && categoryModal.data && (
                <input type="hidden" name="id" value={categoryModal.data.id} />
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Nombre *</label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={categoryModal.data?.name ?? ''}
                  placeholder="Ej: Tragos de Autor"
                  className="w-full px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(212,175,55,0.12)] text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Descripción</label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={categoryModal.data?.description ?? ''}
                  placeholder="Descripción breve de la categoría"
                  className="w-full px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(212,175,55,0.12)] text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Imagen</label>
                <input
                  ref={categoryImageRef}
                  type="file"
                  name="image"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleCategoryImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => categoryImageRef.current?.click()}
                  className="w-full py-3 rounded-xl border border-dashed border-[rgba(212,175,55,0.25)] hover:bg-[rgba(212,175,55,0.05)] transition-colors flex items-center justify-center overflow-hidden"
                >
                  {categoryImagePreview ? (
                    <img src={categoryImagePreview} alt="Preview" className="max-h-24 rounded-lg object-contain" />
                  ) : (
                    <span className="text-gray-500 text-sm flex items-center gap-2">
                      <IconImage /> Seleccionar imagen
                    </span>
                  )}
                </button>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  name="is_active"
                  type="checkbox"
                  defaultChecked={categoryModal.data?.is_active ?? true}
                  className="w-4 h-4 rounded border-[rgba(212,175,55,0.3)] bg-[rgba(255,255,255,0.05)] text-[#d4af37] focus:ring-[#d4af37] focus:ring-offset-0"
                />
                <span className="text-sm text-gray-300">Categoría activa</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setCategoryModal({ open: false, mode: 'create' }); setCategoryImagePreview(null) }}
                  className="flex-1 py-2.5 rounded-xl border border-[rgba(255,255,255,0.1)] text-gray-300 text-sm font-medium hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 rounded-xl bg-[#d4af37] text-[#0A1128] text-sm font-semibold hover:bg-[#c4a030] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Guardando...' : categoryModal.mode === 'create' ? 'Crear' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          MODAL: Producto
          ═══════════════════════════════════════════════════ */}
      {productModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => { setProductModal({ open: false, mode: 'create' }); setProductImagePreview(null) }}
        >
          <div
            className="glass-modal w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#d4af37]">
                {productModal.mode === 'create' ? 'Nuevo Producto' : 'Editar Producto'}
              </h2>
              <button
                onClick={() => { setProductModal({ open: false, mode: 'create' }); setProductImagePreview(null) }}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <IconX />
              </button>
            </div>

            <form ref={productFormRef} onSubmit={handleProductSubmit} className="space-y-4">
              {productModal.mode === 'edit' && productModal.data && (
                <input type="hidden" name="id" value={productModal.data.id} />
              )}
              <input type="hidden" name="category_id" value={productModal.categoryId ?? productModal.data?.category_id ?? ''} />

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Nombre *</label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={productModal.data?.name ?? ''}
                  placeholder="Ej: Fernet con Cola"
                  className="w-full px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(212,175,55,0.12)] text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Precio *</label>
                  <input
                    name="price"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    defaultValue={productModal.data?.price ?? ''}
                    placeholder="4500"
                    className="w-full px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(212,175,55,0.12)] text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Familia</label>
                  <input
                    name="family"
                    type="text"
                    defaultValue={productModal.data?.family ?? ''}
                    placeholder="Ej: Fernet"
                    className="w-full px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(212,175,55,0.12)] text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Descripción</label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={productModal.data?.description ?? ''}
                  placeholder="Descripción breve del producto"
                  className="w-full px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(212,175,55,0.12)] text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Imagen</label>
                <input
                  ref={productImageRef}
                  type="file"
                  name="image"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleProductImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => productImageRef.current?.click()}
                  className="w-full py-3 rounded-xl border border-dashed border-[rgba(212,175,55,0.25)] hover:bg-[rgba(212,175,55,0.05)] transition-colors flex items-center justify-center overflow-hidden"
                >
                  {productImagePreview ? (
                    <img src={productImagePreview} alt="Preview" className="max-h-24 rounded-lg object-contain" />
                  ) : (
                    <span className="text-gray-500 text-sm flex items-center gap-2">
                      <IconImage /> Seleccionar imagen
                    </span>
                  )}
                </button>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  name="is_available"
                  type="checkbox"
                  defaultChecked={productModal.data?.is_available ?? true}
                  className="w-4 h-4 rounded border-[rgba(212,175,55,0.3)] bg-[rgba(255,255,255,0.05)] text-[#d4af37] focus:ring-[#d4af37] focus:ring-offset-0"
                />
                <span className="text-sm text-gray-300">Producto disponible</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setProductModal({ open: false, mode: 'create' }); setProductImagePreview(null) }}
                  className="flex-1 py-2.5 rounded-xl border border-[rgba(255,255,255,0.1)] text-gray-300 text-sm font-medium hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 rounded-xl bg-[#d4af37] text-[#0A1128] text-sm font-semibold hover:bg-[#c4a030] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Guardando...' : productModal.mode === 'create' ? 'Crear' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          DIÁLOGO: Confirmar eliminación
          ═══════════════════════════════════════════════════ */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="glass-modal w-full max-w-sm rounded-2xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-red-400 mb-2">Confirmar eliminación</h2>
            <p className="text-gray-300 text-sm mb-6">
              ¿Estás seguro de eliminar{' '}
              <span className="text-white font-medium">{deleteConfirm.name}</span>?
              {deleteConfirm.type === 'category' && (
                <span className="block mt-1 text-xs text-gray-500">
                  También se eliminarán todos los productos de esta categoría.
                </span>
              )}
              <span className="block mt-1 text-xs text-gray-500">Esta acción no se puede deshacer.</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-[rgba(255,255,255,0.1)] text-gray-300 text-sm font-medium hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() =>
                  deleteConfirm.type === 'category'
                    ? handleDeleteCategory(deleteConfirm.id)
                    : handleDeleteProduct(deleteConfirm.id)
                }
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          TOASTS
          ═══════════════════════════════════════════════════ */}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg backdrop-blur-md pointer-events-auto animate-in slide-in-from-right ${
              toast.type === 'success'
                ? 'bg-green-900/80 text-green-300 border border-green-700/30'
                : 'bg-red-900/80 text-red-300 border border-red-700/30'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  )
}