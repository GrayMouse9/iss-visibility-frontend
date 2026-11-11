import axios from 'axios'
import { Api } from './generated/ObservationPointsApi'

export const observationPointsApi = new Api({ baseURL: '/api', timeout: 15000 })
export const authenticationApi = axios.create({ baseURL: '/api/users', timeout: 15000 })

export function authorizationHeaders(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function apiUnavailable(error: unknown) {
  return axios.isAxiosError(error) && (
    (!error.response && error.code !== 'ERR_CANCELED') ||
    [502, 503, 504].includes(error.response?.status ?? 0)
  )
}

export function requestError(error: unknown) {
  if (axios.isAxiosError(error)) {
    switch (error.response?.status) {
      case 400: return 'Проверьте введённые данные и формат файлов.'
      case 401: return 'Не удалось подтвердить вход. Войдите снова.'
      case 403: return 'Недостаточно прав для этого действия.'
      case 404: return 'Точка наблюдения не найдена или недоступна.'
      case 409: return 'Черновик уже существует или логин занят.'
    }
    if (apiUnavailable(error)) return 'Веб-сервис недоступен. Попробуйте ещё раз.'
  }
  return 'Не удалось выполнить запрос. Попробуйте ещё раз.'
}
