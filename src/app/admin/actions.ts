"use server"

import { revalidatePath } from "next/cache"
import { adminDb } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

/* ─── Slug Generator ─── */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
}

/* ─── Auth Check ─── */
async function checkAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const { data: allowed } = await adminDb
    .from("allowed_users")
    .select("id")
    .eq("email", user.email)
    .single()
  if (!allowed) throw new Error("No autorizado")

  return user
}

/* ─── Image Upload Helper ─── */
async function uploadToStorage(
  file: File,
  bucket: "category-images" | "product-images"
): Promise<string> {
  const ext = file.name.split(".").pop() || "webp"
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { data, error } = await adminDb.storage
    .from(bucket)
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (error) throw new Error(`Error subiendo imagen: ${error.message}`)

  const { data: urlData } = adminDb.storage.from(bucket).getPublicUrl(filename)
  return urlData.publicUrl
}

/* ─── Get Admin Data ─── */
export async function getAdminData() {
  await checkAuth()

  const { data: categories, error } = await adminDb
    .from("categories")
    .select("*, products(*)")
    .order("sort_order", { ascending: true })

  if (error) throw new Error(`Error cargando datos: ${error.message}`)
  return categories || []
}

/* ─── Category Actions ─── */
export async function createCategory(formData: FormData) {
  try {
    await checkAuth()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const isActive = formData.get("is_active") === "on"
    const imageFile = formData.get("image") as File | null

    if (!name || name.trim().length === 0) {
      return { error: "El nombre es obligatorio" }
    }

    let image_url: string | null = null
    if (imageFile && imageFile.size > 0) {
      image_url = await uploadToStorage(imageFile, "category-images")
    }

    const { data: maxSort } = await adminDb
      .from("categories")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .single()

    const nextSort = (maxSort?.sort_order ?? 0) + 1
    const slug = generateSlug(name)

    const { error } = await adminDb.from("categories").insert({
      name,
      slug,
      description: description || null,
      is_active: isActive,
      image_url,
      sort_order: nextSort,
    })

    if (error) throw new Error(error.message)
    revalidatePath("/admin")
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" }
  }
}

export async function updateCategory(formData: FormData) {
  try {
    await checkAuth()
    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const isActive = formData.get("is_active") === "on"
    const imageFile = formData.get("image") as File | null

    if (!name || name.trim().length === 0) {
      return { error: "El nombre es obligatorio" }
    }

    const updateData: Record<string, unknown> = {
      name,
      slug: generateSlug(name),
      description: description || null,
      is_active: isActive,
    }

    if (imageFile && imageFile.size > 0) {
      updateData.image_url = await uploadToStorage(imageFile, "category-images")
    }

    const { error } = await adminDb
      .from("categories")
      .update(updateData)
      .eq("id", id)

    if (error) throw new Error(error.message)
    revalidatePath("/admin")
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" }
  }
}

export async function toggleCategoryActive(id: string) {
  try {
    await checkAuth()
    const { data: category } = await adminDb
      .from("categories")
      .select("is_active")
      .eq("id", id)
      .single()

    if (!category) throw new Error("Categoría no encontrada")

    const { error } = await adminDb
      .from("categories")
      .update({ is_active: !category.is_active })
      .eq("id", id)

    if (error) throw new Error(error.message)
    revalidatePath("/admin")
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" }
  }
}

export async function deleteCategory(id: string) {
  try {
    await checkAuth()
    const { error } = await adminDb.from("categories").delete().eq("id", id)
    if (error) throw new Error(error.message)
    revalidatePath("/admin")
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" }
  }
}

/* ─── Product Actions ─── */
export async function createProduct(formData: FormData) {
  try {
    await checkAuth()
    const name = formData.get("name") as string
    const price = parseFloat(formData.get("price") as string)
    const description = formData.get("description") as string
    const categoryId = formData.get("category_id") as string
    const isAvailable = formData.get("is_available") === "on"
    const imageFile = formData.get("image") as File | null

    if (!name || name.trim().length === 0) {
      return { error: "El nombre es obligatorio" }
    }
    if (!categoryId || categoryId.trim().length === 0) {
      return { error: "Seleccioná una categoría" }
    }
    if (isNaN(price) || price <= 0) {
      return { error: "El precio debe ser mayor a 0" }
    }

    let image_url: string | null = null
    if (imageFile && imageFile.size > 0) {
      image_url = await uploadToStorage(imageFile, "product-images")
    }

    const slug = generateSlug(name)

    const { error } = await adminDb.from("products").insert({
      name,
      slug,
      price,
      description: description || null,
      category_id: categoryId,
      is_available: isAvailable,
      image_url,
    })

    if (error) throw new Error(error.message)
    revalidatePath("/admin")
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" }
  }
}

export async function updateProduct(formData: FormData) {
  try {
    await checkAuth()
    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const price = parseFloat(formData.get("price") as string)
    const description = formData.get("description") as string
    const categoryId = formData.get("category_id") as string
    const isAvailable = formData.get("is_available") === "on"
    const imageFile = formData.get("image") as File | null

    if (!name || name.trim().length === 0) {
      return { error: "El nombre es obligatorio" }
    }
    if (!categoryId || categoryId.trim().length === 0) {
      return { error: "Seleccioná una categoría" }
    }
    if (isNaN(price) || price <= 0) {
      return { error: "El precio debe ser mayor a 0" }
    }

    const updateData: Record<string, unknown> = {
      name,
      slug: generateSlug(name),
      price,
      description: description || null,
      category_id: categoryId,
      is_available: isAvailable,
    }

    if (imageFile && imageFile.size > 0) {
      updateData.image_url = await uploadToStorage(imageFile, "product-images")
    }

    const { error } = await adminDb
      .from("products")
      .update(updateData)
      .eq("id", id)

    if (error) throw new Error(error.message)
    revalidatePath("/admin")
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" }
  }
}

export async function toggleProductAvailable(id: string) {
  try {
    await checkAuth()
    const { data: product } = await adminDb
      .from("products")
      .select("is_available")
      .eq("id", id)
      .single()

    if (!product) throw new Error("Producto no encontrado")

    const { error } = await adminDb
      .from("products")
      .update({ is_available: !product.is_available })
      .eq("id", id)

    if (error) throw new Error(error.message)
    revalidatePath("/admin")
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" }
  }
}

export async function deleteProduct(id: string) {
  try {
    await checkAuth()
    const { error } = await adminDb.from("products").delete().eq("id", id)
    if (error) throw new Error(error.message)
    revalidatePath("/admin")
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" }
  }
}