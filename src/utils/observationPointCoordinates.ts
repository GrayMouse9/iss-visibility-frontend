export function formatLatitude(latitude: number | null, fractionDigits = 4): string {
  if (latitude === null) return 'Не указана'
  return `${Math.abs(latitude).toFixed(fractionDigits)}° ${latitude < 0 ? 'ю. ш.' : 'с. ш.'}`
}

export function formatLongitude(longitude: number | null): string {
  if (longitude === null) return 'Не указана'
  return `${Math.abs(longitude).toFixed(4)}° ${longitude < 0 ? 'з. д.' : 'в. д.'}`
}
