/**
 * Convierte una URL de Supabase Storage en una URL optimizada
 * con transformaciones de imagen (resize, WebP, calidad).
 * Si la URL no es de Supabase, la devuelve sin modificar.
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}
): string | null {
  if (!url) return null;

  if (!url.includes('/storage/v1/object/public/')) return url;

  const { width = 120, height, quality = 80 } = options;

  const renderUrl = url.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  );

  const params = new URLSearchParams({
    width: String(width),
    quality: String(quality),
    format: 'webp',
  });

  if (height) {
    params.set('height', String(height));
  }

  return `${renderUrl}?${params.toString()}`;
}
