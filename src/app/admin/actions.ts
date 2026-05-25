'use server';

import { createClient } from '@/lib/supabase/server';
import { adminDb } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// ==========================================================================
// Auth helper
// ==========================================================================

async function checkAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('No autenticado');
  }

  const { data: allowedUser } = await adminDb
    .from('allowed_users')
    .select('email, role')
    .eq('email', user.email)
    .single();

  if (!allowedUser) {
    throw new Error('No autorizado');
  }

  return { user, role: allowedUser.role };
}

// ==========================================================================
// Sign out
// ==========================================================================

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

// ==========================================================================
// Get admin data (all categories + products, including inactive)
// ==========================================================================

export async function getAdminData() {
  await checkAuth();

  const { data: categories, error: catError } = await adminDb
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (catError) {
    return { categories: [], products: [] };
  }

  const { data: products, error: prodError } = await adminDb
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true });

  if (prodError) {
    return { categories: categories || [], products: [] };
  }

  return { categories: categories || [], products: products || [] };
}

// ==========================================================================
// Image upload helper
// ==========================================================================

async function uploadToStorage(file: File, bucket: 'category-images' | 'product-images') {
  const ext = file.name.split('.').pop() || 'webp';
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

  const { error } = await adminDb.storage
    .from(bucket)
    .upload(filename, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return { error: error.message };
  }

  const { data: urlData } = adminDb.storage
    .from(bucket)
    .getPublicUrl(filename);

  return { url: urlData.publicUrl };
}

// ==========================================================================
// Slug generator
// ==========================================================================

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ==========================================================================
// Categories CRUD
// ==========================================================================

export async function createCategory(formData: FormData) {
  await checkAuth();

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const isActive = formData.get('is_active') === 'on';
  const imageFile = formData.get('image') as File | null;

  let imageUrl: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const result = await uploadToStorage(imageFile, 'category-images');
    if (result.error) {
      return { error: result.error };
    }
    imageUrl = result.url ?? null;
  }

  const { data: existing } = await adminDb
    .from('categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { error } = await adminDb
    .from('categories')
    .insert({
      name,
      slug: generateSlug(name),
      description: description || null,
      image_url: imageUrl,
      sort_order: nextOrder,
      is_active: isActive,
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}

export async function updateCategory(formData: FormData) {
  await checkAuth();

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const isActive = formData.get('is_active') === 'on';
  const imageFile = formData.get('image') as File | null;

  let imageUrl: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const result = await uploadToStorage(imageFile, 'category-images');
    if (result.error) {
      return { error: result.error };
    }
    imageUrl = result.url ?? null;
  }

  const updateData: Record<string, unknown> = {
    name,
    slug: generateSlug(name),
    description: description || null,
    is_active: isActive,
  };

  if (imageUrl !== null) {
    updateData.image_url = imageUrl;
  }

  const { error } = await adminDb
    .from('categories')
    .update(updateData)
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}

export async function deleteCategory(id: string) {
  await checkAuth();

  await adminDb.from('products').delete().eq('category_id', id);
  const { error } = await adminDb.from('categories').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}

export async function toggleCategoryActive(id: string) {
  await checkAuth();

  const { data: category } = await adminDb
    .from('categories')
    .select('is_active')
    .eq('id', id)
    .single();

  if (!category) {
    return { error: 'Categoría no encontrada' };
  }

  const { error } = await adminDb
    .from('categories')
    .update({ is_active: !category.is_active })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}

// ==========================================================================
// Products CRUD
// ==========================================================================

export async function createProduct(formData: FormData) {
  await checkAuth();

  const name = formData.get('name') as string;
  const categoryId = formData.get('category_id') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const family = formData.get('family') as string;
  const isAvailable = formData.get('is_available') === 'on';
  const imageFile = formData.get('image') as File | null;

  let imageUrl: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const result = await uploadToStorage(imageFile, 'product-images');
    if (result.error) {
      return { error: result.error };
    }
    imageUrl = result.url ?? null;
  }

  const { data: existing } = await adminDb
    .from('products')
    .select('sort_order')
    .eq('category_id', categoryId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { error } = await adminDb
    .from('products')
    .insert({
      name,
      slug: generateSlug(name),
      category_id: categoryId,
      description: description || null,
      price: isNaN(price) ? 0 : price,
      image_url: imageUrl,
      family: family || null,
      is_available: isAvailable,
      sort_order: nextOrder,
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}

export async function updateProduct(formData: FormData) {
  await checkAuth();

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const categoryId = formData.get('category_id') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const family = formData.get('family') as string;
  const isAvailable = formData.get('is_available') === 'on';
  const imageFile = formData.get('image') as File | null;

  let imageUrl: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const result = await uploadToStorage(imageFile, 'product-images');
    if (result.error) {
      return { error: result.error };
    }
    imageUrl = result.url ?? null;
  }

  const updateData: Record<string, unknown> = {
    name,
    slug: generateSlug(name),
    category_id: categoryId,
    description: description || null,
    price: isNaN(price) ? 0 : price,
    family: family || null,
    is_available: isAvailable,
  };

  if (imageUrl !== null) {
    updateData.image_url = imageUrl;
  }

  const { error } = await adminDb
    .from('products')
    .update(updateData)
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}

export async function deleteProduct(id: string) {
  await checkAuth();

  const { error } = await adminDb.from('products').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}

export async function toggleProductAvailable(id: string) {
  await checkAuth();

  const { data: product } = await adminDb
    .from('products')
    .select('is_available')
    .eq('id', id)
    .single();

  if (!product) {
    return { error: 'Producto no encontrado' };
  }

  const { error } = await adminDb
    .from('products')
    .update({ is_available: !product.is_available })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}