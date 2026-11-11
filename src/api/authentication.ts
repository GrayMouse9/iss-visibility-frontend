export const tokenCookieName = 'iss_access_token'

export function saveTokenCookie(token: string, expiresIn: number) {
  document.cookie = `${tokenCookieName}=${encodeURIComponent(token)}; Max-Age=${expiresIn}; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`
}

export function clearTokenCookie() {
  document.cookie = `${tokenCookieName}=; Max-Age=0; Path=/; SameSite=Lax`
}
