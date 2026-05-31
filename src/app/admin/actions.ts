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

/* ─── Auth Check (devuelve user + role) ─── */
async function checkAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const { data: allowed } = await adminDb
    .from("allowed_users")
    .select("id, role")
    .eq("email", user.email)
    .single()
  if (!allowed) throw new Error("No autorizado")

  return { user, role: allowed.role as "super_admin" | "admin" }
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

/* ─── Get User Role ─── */
export async function getUserRole() {
  const { role } = await checkAuth()
  return role
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

/* ─── User Management Actions (solo super_admin) ─── */
export async function getAdminUsers() {
  const { role } = await checkAuth()
  if (role !== "super_admin") throw new Error("No autorizado")

  const { data, error } = await adminDb
    .from("allowed_users")
    .select("id, email, role, created_at")
    .order("created_at", { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

export async function createAdminUser(formData: FormData) {
  try {
    const { role: currentUserRole } = await checkAuth()
    if (currentUserRole !== "super_admin") {
      return { error: "Solo super_admin puede crear usuarios" }
    }

    const email = formData.get("email") as string
    const password = formData.get("password") as string

    /* SEGURIDAD: Desde la web solo se puede crear rol admin.
       El rol super_admin solo se gestiona desde la base de datos. */
    const role = "admin"

    if (!email || !password) {
      return { error: "Email y contraseña son obligatorios" }
    }

    /* Validar formato de email */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { error: "Ingresá un email válido (ej: correo@ejemplo.com)" }
    }

    if (password.length < 6) {
      return { error: "La contraseña debe tener al menos 6 caracteres" }
    }

    // Verificar si el email ya existe en allowed_users
    const { data: existing } = await adminDb
      .from("allowed_users")
      .select("id")
      .eq("email", email)
      .single()

    if (existing) {
      return { error: "Ya existe un usuario con ese email" }
    }

    // Crear usuario en Auth
    const { data: authData, error: authError } = await adminDb.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) throw new Error(authError.message)

    // Agregar a allowed_users
    const { error: dbError } = await adminDb
      .from("allowed_users")
      .insert({ id: authData.user.id, email, role })

    if (dbError) throw new Error(dbError.message)

    revalidatePath("/admin")
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" }
  }
}

export async function deleteAdminUser(id: string) {
  try {
    const { role: currentUserRole, user: currentUser } = await checkAuth()
    if (currentUserRole !== "super_admin") {
      return { error: "Solo super_admin puede eliminar usuarios" }
    }

    // No puede eliminarse a sí mismo
    if (id === currentUser.id) {
      return { error: "No podés eliminar tu propio usuario" }
    }

    /* SEGURIDAD: No se puede eliminar un super_admin desde la web.
       Solo se pueden eliminar usuarios con rol admin. */
    const { data: targetUser } = await adminDb
      .from("allowed_users")
      .select("role")
      .eq("id", id)
      .single()

    if (targetUser?.role === "super_admin") {
      return { error: "No se puede eliminar un usuario Super Admin desde aquí. Solo se gestiona desde la base de datos." }
    }

    // Eliminar de allowed_users
    const { error: dbError } = await adminDb
      .from("allowed_users")
      .delete()
      .eq("id", id)

    if (dbError) throw new Error(dbError.message)

    // Eliminar de Auth
    const { error: authError } = await adminDb.auth.admin.deleteUser(id)
    if (authError) throw new Error(authError.message)

    revalidatePath("/admin")
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" }
  }
}
/* ─── Get User Email ─── */
export async function getUserEmail() {
  const { user } = await checkAuth()
  return user.email || ""
}
