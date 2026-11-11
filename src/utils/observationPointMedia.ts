export const defaultObservationPointImage = '/media/default-observation-point.jpg'
export const defaultObservationPointVideo = '/media/default-observation-point.mp4'

// API URLs remain visible in JSON; only media requests pass through the S3 proxy.
export function observationPointMediaUrl(value: string) {
  if (!value) return ''
  if (value.startsWith('/iss-visibility/')) return `/s3${value}`
  try {
    const url = new URL(value)
    if (url.pathname.startsWith('/iss-visibility/')) return `/s3${url.pathname}${url.search}`
  } catch { /* Local mock media already has a relative path. */ }
  return value
}
