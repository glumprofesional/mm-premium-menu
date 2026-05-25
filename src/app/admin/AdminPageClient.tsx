"use client"

import { useState, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  toggleCategoryActive,
  toggleProductAvailable,
  deleteCategory,
  deleteProduct,
  createCategory,
  updateCategory,
  createProduct,
  updateProduct,
} from "./actions"

/* ─── Types ─── */
type Category = {
  id: string
  name: string
  description: string | null
  image_url: string | null
  is_active: boolean
  sort_order: number
  products: Product[]
}

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean
  category_id: string
}

type CategoryModalState = {
  open: boolean
  mode: "create" | "edit"
  data: Category | null
}

type ProductModalState = {
  open: boolean
  mode: "create" | "edit"
  data: Product | null
  categoryId: string | null
}

type DeleteConfirmState = {
  open: boolean
  type: "category" | "product"
  id: string
  name: string
}

type ToastState = {
  show: boolean
  message: string
  type: "success" | "error"
}

/* ─── Icons ─── */
function IconEdit() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  )
}

function IconToggleOn() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="12" x="2" y="6" rx="6" />
      <circle cx="16" cy="12" r="3" />
    </svg>
  )
}

function IconToggleOff() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="12" x="2" y="6" rx="6" />
      <circle cx="8" cy="12" r="3" />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}

function IconChevronDown() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function IconChevronRight() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function IconClose() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function IconImage() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  )
}

/* ─── Status Badge ─── */
function StatusBadge({ active, activeLabel, inactiveLabel }: { active: boolean; activeLabel: string; inactiveLabel: string }) {
  if (active) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
        {activeLabel}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fde8e5] text-[#b9412f]">
      {inactiveLabel}
    </span>
  )
}

/* ─── Main Component ─── */
export default function AdminPageClient({ initialData }: { initialData: Category[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [categoryModal, setCategoryModal] = useState<CategoryModalState>({
    open: false,
    mode: "create",
    data: null,
  })
  const [productModal, setProductModal] = useState<ProductModalState>({
    open: false,
    mode: "create",
    data: null,
    categoryId: null,
  })
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    open: false,
    type: "category",
    id: "",
    name: "",
  })
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    type: "success",
  })

  const [categoryImagePreview, setCategoryImagePreview] = useState<string | null>(null)
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null)

  const categoryFormRef = useRef<HTMLFormElement>(null)
  const productFormRef = useRef<HTMLFormElement>(null)

  /* ─── Helpers ─── */
  function showToast(message: string, type: "success" | "error") {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500)
  }

  function toggleAccordion(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  /* ─── Action Handlers ─── */
  function handleToggleCategory(id: string) {
    startTransition(async () => {
      const result = await toggleCategoryActive(id)
      if (result?.error) {
        showToast(result.error, "error")
      } else {
        showToast("Estado de categoría actualizado", "success")
        router.refresh()
      }
    })
  }

  function handleToggleProduct(id: string) {
    startTransition(async () => {
      const result = await toggleProductAvailable(id)
      if (result?.error) {
        showToast(result.error, "error")
      } else {
        showToast("Estado de producto actualizado", "success")
        router.refresh()
      }
    })
  }

  function handleOpenDeleteConfirm(type: "category" | "product", id: string, name: string) {
    setDeleteConfirm({ open: true, type, id, name })
  }

  function handleConfirmDelete() {
    startTransition(async () => {
      const action = deleteConfirm.type === "category" ? deleteCategory : deleteProduct
      const result = await action(deleteConfirm.id)
      setDeleteConfirm({ open: false, type: "category", id: "", name: "" })
      if (result?.error) {
        showToast(result.error, "error")
      } else {
        showToast(
          deleteConfirm.type === "category" ? "Categoría eliminada" : "Producto eliminado",
          "success"
        )
        if (deleteConfirm.type === "category") {
          setExpandedId(null)
        }
        router.refresh()
      }
    })
  }

  /* ─── Category Modal ─── */
  function handleOpenCategoryModal(mode: "create" | "edit", category?: Category) {
    setCategoryImagePreview(category?.image_url ?? null)
    setCategoryModal({ open: true, mode, data: category ?? null })
  }

  function handleCloseCategoryModal() {
    setCategoryModal({ open: false, mode: "create", data: null })
    setCategoryImagePreview(null)
  }

  async function handleCategoryFormSubmit(formData: FormData) {
    startTransition(async () => {
      const action = categoryModal.mode === "create" ? createCategory : updateCategory
      const result = await action(formData)
      handleCloseCategoryModal()
      if (result?.error) {
        showToast(result.error, "error")
      } else {
        showToast(
          categoryModal.mode === "create" ? "Categoría creada" : "Categoría actualizada",
          "success"
        )
        router.refresh()
      }
    })
  }

  /* ─── Product Modal ─── */
  function handleOpenProductModal(mode: "create" | "edit", categoryId: string, product?: Product) {
    setProductImagePreview(product?.image_url ?? null)
    setProductModal({ open: true, mode, data: product ?? null, categoryId })
  }

  function handleCloseProductModal() {
    setProductModal({ open: false, mode: "create", data: null, categoryId: null })
    setProductImagePreview(null)
  }

  async function handleProductFormSubmit(formData: FormData) {
    startTransition(async () => {
      const action = productModal.mode === "create" ? createProduct : updateProduct
      const result = await action(formData)
      handleCloseProductModal()
      if (result?.error) {
        showToast(result.error, "error")
      } else {
        showToast(
          productModal.mode === "create" ? "Producto creado" : "Producto actualizado",
          "success"
        )
        router.refresh()
      }
    })
  }

  /* ─── Image preview ─── */
  function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: (url: string | null) => void
  ) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  /* ─── Render ─── */
  return (
    <div className="min-h-screen bg-[#e6dec8]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[#14130e]">Panel de Administración</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenCategoryModal("create")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#da5a47] text-white rounded-lg hover:bg-[#c44d3c] transition-colors font-medium text-sm cursor-pointer"
            >
              <span className="pointer-events-none"><IconPlus /></span>
              Nueva Categoría
            </button>
            <button
              type="button"
              onClick={() => handleOpenProductModal("create", "")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#da5a47] text-white rounded-lg hover:bg-[#c44d3c] transition-colors font-medium text-sm cursor-pointer"
            >
              <span className="pointer-events-none"><IconPlus /></span>
              Nuevo Producto
            </button>
          </div>
        </div>

        {/* Loading bar */}
        {isPending && (
          <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[#d4cbaf] overflow-hidden">
            <div className="h-full bg-[#da5a47] animate-pulse" style={{ width: "60%" }} />
          </div>
        )}

        {/* Categories */}
        {initialData.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#6b6858] text-lg">No hay categorías aún.</p>
            <button
              type="button"
              onClick={() => handleOpenCategoryModal("create")}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#da5a47] text-white rounded-lg hover:bg-[#c44d3c] transition-colors font-medium text-sm cursor-pointer"
            >
              <span className="pointer-events-none"><IconPlus /></span>
              Crear primera categoría
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {initialData.map((category) => {
              const isExpanded = expandedId === category.id
              return (
                <div
                  key={category.id}
                  className="border-2 border-[#da5a47] rounded-xl bg-[#eee7d4] overflow-hidden"
                >
                  {/* Category Header */}
                  <button
                    type="button"
                    onClick={() => toggleAccordion(category.id)}
                    className="w-full flex items-center justify-between p-4 text-left cursor-pointer hover:bg-[#e6dec8] transition-colors rounded-t-xl"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {category.image_url ? (
                        <Image
                          src={category.image_url}
                          alt={category.name}
                          width={40}
                          height={40}
                          className="rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#d4cbaf] flex items-center justify-center flex-shrink-0">
                          <span className="pointer-events-none text-[#6b6858]"><IconImage /></span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-semibold text-[#14130e] truncate">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-[#6b6858] truncate">{category.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <StatusBadge
                        active={category.is_active}
                        activeLabel="Activo"
                        inactiveLabel="Inactivo"
                      />
                      <span className="pointer-events-none text-[#6b6858]">
                        {isExpanded ? <IconChevronDown /> : <IconChevronRight />}
                      </span>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-[#d4cbaf]">
                      {/* Category Actions */}
                      <div className="flex items-center gap-2 px-4 py-3 bg-[#e6dec8] border-b border-[#d4cbaf]">
                        <button
                          type="button"
                          onClick={() => handleOpenCategoryModal("edit", category)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[#6b6858] hover:bg-[#d4cbaf] transition-colors cursor-pointer"
                          title="Editar categoría"
                        >
                          <span className="pointer-events-none"><IconEdit /></span>
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleCategory(category.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[#6b6858] hover:bg-[#d4cbaf] transition-colors cursor-pointer"
                          title={category.is_active ? "Desactivar categoría" : "Activar categoría"}
                        >
                          <span className="pointer-events-none">
                            {category.is_active ? <IconToggleOn /> : <IconToggleOff />}
                          </span>
                          {category.is_active ? "Desactivar" : "Activar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteConfirm("category", category.id, category.name)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[#da5a47] hover:bg-[#fde8e5] transition-colors cursor-pointer"
                          title="Eliminar categoría"
                        >
                          <span className="pointer-events-none"><IconTrash /></span>
                          Eliminar
                        </button>
                      </div>

                      {/* Products */}
                      <div className="p-4">
                        {category.products.length === 0 ? (
                          <p className="text-sm text-[#6b6858] text-center py-4">
                            No hay productos en esta categoría.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {category.products.map((product) => (
                              <div
                                key={product.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-[#e6dec8] border border-[#d4cbaf]"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  {product.image_url ? (
                                    <Image
                                      src={product.image_url}
                                      alt={product.name}
                                      width={36}
                                      height={36}
                                      className="rounded-lg object-cover flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded-lg bg-[#d4cbaf] flex items-center justify-center flex-shrink-0">
                                      <span className="pointer-events-none text-[#6b6858]">
                                        <IconImage />
                                      </span>
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="font-medium text-[#14130e] text-sm truncate">
                                      {product.name}
                                    </p>
                                    <p className="text-xs text-[#6b6858]">
                                      ${product.price.toLocaleString("es-AR")}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                                  <StatusBadge
                                    active={product.is_available}
                                    activeLabel="Disponible"
                                    inactiveLabel="No disponible"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleOpenProductModal("edit", category.id, product)}
                                    className="p-1.5 rounded-lg text-[#6b6858] hover:bg-[#d4cbaf] transition-colors cursor-pointer"
                                    title="Editar producto"
                                  >
                                    <span className="pointer-events-none"><IconEdit /></span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleProduct(product.id)}
                                    className="p-1.5 rounded-lg text-[#6b6858] hover:bg-[#d4cbaf] transition-colors cursor-pointer"
                                    title={product.is_available ? "Marcar no disponible" : "Marcar disponible"}
                                  >
                                    <span className="pointer-events-none">
                                      {product.is_available ? <IconToggleOn /> : <IconToggleOff />}
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDeleteConfirm("product", product.id, product.name)}
                                    className="p-1.5 rounded-lg text-[#da5a47] hover:bg-[#fde8e5] transition-colors cursor-pointer"
                                    title="Eliminar producto"
                                  >
                                    <span className="pointer-events-none"><IconTrash /></span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Product inside category */}
                        <button
                          type="button"
                          onClick={() => handleOpenProductModal("create", category.id)}
                          className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#da5a47] text-white rounded-lg hover:bg-[#c44d3c] transition-colors font-medium text-sm cursor-pointer"
                        >
                          <span className="pointer-events-none"><IconPlus /></span>
                          Nuevo Producto
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ─── Category Modal ─── */}
      {categoryModal.open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-[#eee7d4] rounded-2xl border border-[#d4cbaf] shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#d4cbaf]">
              <h2 className="text-lg font-semibold text-[#14130e]">
                {categoryModal.mode === "create" ? "Nueva Categoría" : "Editar Categoría"}
              </h2>
              <button
                type="button"
                onClick={handleCloseCategoryModal}
                className="p-1 rounded-lg text-[#6b6858] hover:bg-[#d4cbaf] transition-colors cursor-pointer"
              >
                <span className="pointer-events-none"><IconClose /></span>
              </button>
            </div>
            <form
              ref={categoryFormRef}
              action={handleCategoryFormSubmit}
              className="p-4 space-y-4"
            >
              {categoryModal.mode === "edit" && categoryModal.data && (
                <input type="hidden" name="id" value={categoryModal.data.id} />
              )}

              <div>
                <label className="block text-sm font-medium text-[#14130e] mb-1">Nombre *</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={categoryModal.data?.name ?? ""}
                  className="w-full px-3 py-2 rounded-lg border border-[#d4cbaf] bg-[#f5f0e2] text-[#14130e] placeholder:text-[#a09e8e] focus:outline-none focus:ring-2 focus:ring-[#da5a47] focus:border-transparent text-sm"
                  placeholder="Nombre de la categoría"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#14130e] mb-1">Descripción</label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={categoryModal.data?.description ?? ""}
                  className="w-full px-3 py-2 rounded-lg border border-[#d4cbaf] bg-[#f5f0e2] text-[#14130e] placeholder:text-[#a09e8e] focus:outline-none focus:ring-2 focus:ring-[#da5a47] focus:border-transparent text-sm resize-none"
                  placeholder="Descripción breve"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#14130e] mb-1">Imagen</label>
                <div className="flex items-center gap-3">
                  {(categoryImagePreview || categoryModal.data?.image_url) && (
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={(categoryImagePreview || categoryModal.data?.image_url)!}
                        alt="Preview"
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    name="image"
                    accept="image/webp,image/png,image/jpeg"
                    onChange={(e) => handleImageChange(e, setCategoryImagePreview)}
                    className="block w-full text-sm text-[#6b6858] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#da5a47] file:text-white hover:file:bg-[#c44d3c] file:cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked={categoryModal.data?.is_active ?? true}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#d4cbaf] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#da5a47] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#da5a47]" />
                </label>
                <span className="text-sm font-medium text-[#14130e]">Categoría activa</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseCategoryModal}
                  className="px-4 py-2 rounded-lg bg-[#d4cbaf] text-[#14130e] hover:bg-[#c9c0a8] transition-colors font-medium text-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-lg bg-[#da5a47] text-white hover:bg-[#c44d3c] transition-colors font-medium text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Guardando..." : categoryModal.mode === "create" ? "Crear Categoría" : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Product Modal ─── */}
      {productModal.open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-[#eee7d4] rounded-2xl border border-[#d4cbaf] shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#d4cbaf]">
              <h2 className="text-lg font-semibold text-[#14130e]">
                {productModal.mode === "create" ? "Nuevo Producto" : "Editar Producto"}
              </h2>
              <button
                type="button"
                onClick={handleCloseProductModal}
                className="p-1 rounded-lg text-[#6b6858] hover:bg-[#d4cbaf] transition-colors cursor-pointer"
              >
                <span className="pointer-events-none"><IconClose /></span>
              </button>
            </div>
            <form
              ref={productFormRef}
              action={handleProductFormSubmit}
              className="p-4 space-y-4"
            >
              {productModal.mode === "edit" && productModal.data && (
                <input type="hidden" name="id" value={productModal.data.id} />
              )}

              {/* Category selector - always visible when no categoryId, also in edit mode */}
              {(!productModal.categoryId || productModal.mode === "edit") && (
                <div>
                  <label className="block text-sm font-medium text-[#14130e] mb-1">Categoría *</label>
                  <select
                    name="category_id"
                    required
                    defaultValue={productModal.data?.category_id ?? productModal.categoryId ?? ""}
                    className="w-full px-3 py-2 rounded-lg border border-[#d4cbaf] bg-[#f5f0e2] text-[#14130e] focus:outline-none focus:ring-2 focus:ring-[#da5a47] focus:border-transparent text-sm"
                  >
                    <option value="">Seleccionar categoría</option>
                    {initialData.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Hidden category_id when it comes from inside a category */}
              {productModal.categoryId && productModal.mode === "create" && (
                <input type="hidden" name="category_id" value={productModal.categoryId} />
              )}

              <div>
                <label className="block text-sm font-medium text-[#14130e] mb-1">Nombre *</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={productModal.data?.name ?? ""}
                  className="w-full px-3 py-2 rounded-lg border border-[#d4cbaf] bg-[#f5f0e2] text-[#14130e] placeholder:text-[#a09e8e] focus:outline-none focus:ring-2 focus:ring-[#da5a47] focus:border-transparent text-sm"
                  placeholder="Nombre del producto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#14130e] mb-1">Precio *</label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  defaultValue={productModal.data?.price ?? ""}
                  className="w-full px-3 py-2 rounded-lg border border-[#d4cbaf] bg-[#f5f0e2] text-[#14130e] placeholder:text-[#a09e8e] focus:outline-none focus:ring-2 focus:ring-[#da5a47] focus:border-transparent text-sm"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#14130e] mb-1">Descripción</label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={productModal.data?.description ?? ""}
                  className="w-full px-3 py-2 rounded-lg border border-[#d4cbaf] bg-[#f5f0e2] text-[#14130e] placeholder:text-[#a09e8e] focus:outline-none focus:ring-2 focus:ring-[#da5a47] focus:border-transparent text-sm resize-none"
                  placeholder="Descripción breve del producto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#14130e] mb-1">Imagen</label>
                <div className="flex items-center gap-3">
                  {(productImagePreview || productModal.data?.image_url) && (
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={(productImagePreview || productModal.data?.image_url)!}
                        alt="Preview"
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    name="image"
                    accept="image/webp,image/png,image/jpeg"
                    onChange={(e) => handleImageChange(e, setProductImagePreview)}
                    className="block w-full text-sm text-[#6b6858] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#da5a47] file:text-white hover:file:bg-[#c44d3c] file:cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_available"
                    defaultChecked={productModal.data?.is_available ?? true}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#d4cbaf] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#da5a47] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#da5a47]" />
                </label>
                <span className="text-sm font-medium text-[#14130e]">Producto disponible</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseProductModal}
                  className="px-4 py-2 rounded-lg bg-[#d4cbaf] text-[#14130e] hover:bg-[#c9c0a8] transition-colors font-medium text-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-lg bg-[#da5a47] text-white hover:bg-[#c44d3c] transition-colors font-medium text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Guardando..." : productModal.mode === "create" ? "Crear Producto" : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation ─── */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-[#eee7d4] rounded-2xl border border-[#d4cbaf] shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-[#14130e] mb-2">Confirmar eliminación</h2>
            <p className="text-sm text-[#6b6858] mb-6">
              ¿Estás seguro de que querés eliminar {deleteConfirm.type === "category" ? "la categoría" : "el producto"}{" "}
              <strong className="text-[#14130e]">&quot;{deleteConfirm.name}&quot;</strong>?
              {deleteConfirm.type === "category" && (
                <span className="block mt-1 text-[#da5a47]">
                  Esto también eliminará todos los productos dentro de esta categoría.
                </span>
              )}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ open: false, type: "category", id: "", name: "" })}
                className="px-4 py-2 rounded-lg bg-[#d4cbaf] text-[#14130e] hover:bg-[#c9c0a8] transition-colors font-medium text-sm cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isPending}
                className="px-4 py-2 rounded-lg bg-[#da5a47] text-white hover:bg-[#c44d3c] transition-colors font-medium text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Toast ─── */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
              toast.type === "success" ? "bg-emerald-600" : "bg-[#da5a47]"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  )
}