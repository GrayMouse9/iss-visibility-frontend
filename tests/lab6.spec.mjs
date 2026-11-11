import { expect, test } from '@playwright/test'

const point = (id, name, latitude) => ({ id, name, latitude, longitude: 37.6849, description: `Описание ${name}`, likes: 4, image_url: '', video_url: '' })

async function backend(page) {
  const state = {
    points: [point(1, 'Северная точка', 55), point(4, 'Южная точка', -23)],
    draft: null, unavailable: false, forbidden: false, delay: 0, requests: [], revoked: false,
  }
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    const method = request.method()
    const authenticated = request.headers().authorization === 'Bearer test-lab6-token' && !state.revoked
    state.requests.push({ path, method, query: url.search, authenticated, body: request.postData() })
    if (state.delay) await new Promise(resolve => setTimeout(resolve, state.delay))
    const reply = (status, body) => route.fulfill({ status, contentType: 'application/json', body: body === undefined ? '' : JSON.stringify(body) })
    if (state.unavailable) return reply(503)
    if (state.forbidden) return reply(500)
    if (path === '/api/users/login') {
      if (request.postDataJSON().password !== 'valid') return reply(401)
      state.revoked = false
      return reply(200, { access_token: 'test-lab6-token', expires_in: 3600, token_type: 'Bearer' })
    }
    if (path === '/api/users/logout') { state.revoked = true; return reply(authenticated ? 204 : 401) }
    if (method === 'GET' && path === '/api/observation_points') {
      return reply(200, state.points.filter(p => p.latitude >= Number(url.searchParams.get('min_latitude') ?? -90)).map(p => ({ ...p, is_mine: authenticated && p.id === 1 ? 1 : 0 })))
    }
    if (path === '/api/observation_points/feed') {
      const after = Number(url.searchParams.get('after'))
      const index = after ? (state.points.findIndex(p => p.id === after) + 1) % state.points.length : 0
      return reply(200, { ...state.points[index], liked: authenticated ? state.points[index].liked ?? 0 : 0 })
    }
    if (!authenticated) return reply(401)
    if (path === '/api/observation_points/draft') return state.draft ? reply(200, state.draft) : reply(404)
    if (method === 'POST' && path === '/api/observation_points') {
      if (state.draft) return reply(409)
      expect(request.headers()['content-type']).toContain('multipart/form-data; boundary=')
      expect(request.postData()).toContain('Учебная точка ЛР6')
      state.draft = point(9, 'Учебная точка ЛР6', null)
      return reply(201, state.draft)
    }
    if (path.endsWith('/publish')) {
      state.draft = { ...state.draft, ...request.postDataJSON() }
      state.points.push(state.draft)
      const result = state.draft
      state.draft = null
      return reply(200, result)
    }
    if (path.endsWith('/like')) {
      const p = state.points.find(p => p.id === Number(path.split('/').at(-2)))
      const value = request.postDataJSON().value
      p.likes += value - (p.liked ?? 0)
      p.liked = value
      return reply(200, p)
    }
    if (method === 'DELETE') {
      const id = Number(path.split('/').at(-1))
      state.points = state.points.filter(p => p.id !== id)
      if (state.draft?.id === id) state.draft = null
      return reply(204)
    }
    return reply(404)
  })
  return state
}

async function login(page) {
  await page.goto('/login')
  await page.getByLabel('Логин', { exact: true }).fill('observer')
  await page.getByLabel('Пароль', { exact: true }).fill('valid')
  await page.getByRole('button', { name: 'Войти', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Выход', exact: true })).toBeVisible()
  await expect(page.locator('.loading-overlay')).toHaveCount(0)
}

test('API, фильтр в запросе, сохранение при навигации и сброс при выходе', async ({ page }) => {
  const state = await backend(page)
  await login(page)
  await page.getByRole('slider').fill('0')
  await page.getByRole('button', { name: 'Найти', exact: true }).click()
  await expect(page.locator('.grid .card')).toHaveCount(1)
  expect(state.requests.some(r => r.query === '?min_latitude=0' && r.authenticated)).toBe(true)
  await page.getByRole('link', { name: /Северная точка/ }).click()
  await expect(page.getByRole('heading', { name: 'Северная точка' })).toBeVisible()
  await page.getByRole('link', { name: 'Плитка', exact: true }).click()
  await expect(page.getByRole('slider')).toHaveValue('0')
  await page.getByRole('button', { name: 'Выход', exact: true }).click()
  await expect(page.getByRole('slider')).toHaveValue('-90')
  await expect(page.getByRole('link', { name: 'Войти', exact: true })).toBeVisible()
  expect((await page.context().cookies()).some(c => c.name === 'iss_access_token')).toBe(false)
  expect(state.requests.some(r => r.path === '/api/users/logout' && r.authenticated)).toBe(true)
})

test('после F5 cookie остаётся, Redux и публичные запросы гостевые', async ({ page }) => {
  const state = await backend(page)
  await login(page)
  expect((await page.context().cookies()).find(c => c.name === 'iss_access_token')?.value).toBe('test-lab6-token')
  state.requests.length = 0
  await page.reload()
  await expect(page.getByRole('link', { name: 'Войти', exact: true })).toBeVisible()
  await expect(page.locator('.loading-overlay')).toHaveCount(0)
  await expect(page.getByRole('button', { name: /^Удалить:/ })).toHaveCount(0)
  expect((await page.context().cookies()).find(c => c.name === 'iss_access_token')?.value).toBe('test-lab6-token')
  expect(state.requests.filter(r => r.path === '/api/observation_points').at(-1)?.authenticated).toBe(false)
})

test('ошибка входа и повторный вход; регистрация не вызывается', async ({ page }) => {
  const state = await backend(page)
  await page.goto('/login')
  await page.getByLabel('Логин', { exact: true }).fill('observer')
  await page.getByLabel('Пароль', { exact: true }).fill('bad')
  await page.getByRole('button', { name: 'Войти', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Неверный логин')
  await expect(page.getByRole('button', { name: 'Зарегистрироваться', exact: true })).toHaveCount(0)
  await page.getByLabel('Пароль', { exact: true }).fill('valid')
  await page.getByRole('button', { name: 'Войти', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Выход', exact: true })).toBeVisible()
  expect(state.requests.some(r => r.path === '/api/users' && r.method === 'POST')).toBe(false)
})

test('лайк и снятие; удаление доступно только своей точке', async ({ page }) => {
  const state = await backend(page)
  await login(page)
  await expect(page.getByRole('button', { name: /^Удалить:/ })).toHaveCount(1)
  await page.getByRole('link', { name: /Северная точка/ }).click()
  const like = page.getByRole('button', { name: 'Нравится', exact: true })
  await like.click()
  await expect(like).toHaveAttribute('aria-pressed', 'true')
  await expect(like).toHaveText('5')
  await like.click()
  await expect(like).toHaveAttribute('aria-pressed', 'false')
  await expect(like).toHaveText('4')
  await page.getByRole('link', { name: 'Плитка', exact: true }).click()
  page.once('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: 'Удалить: Северная точка' }).click()
  await expect(page.locator('.grid .card')).toHaveCount(1)
  expect(state.points.map(p => p.id)).toEqual([4])
})

test('черновик multipart, координаты 0, публикация и переход к новой точке', async ({ page }) => {
  const state = await backend(page)
  await login(page)
  await page.getByRole('link', { name: 'Добавление', exact: true }).click()
  await page.getByLabel('Название', { exact: true }).fill('Учебная точка ЛР6')
  await page.getByLabel('Выбрать изображение', { exact: true }).setInputFiles({ name: 'point.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('photo') })
  await page.getByRole('button', { name: 'Далее', exact: true }).click()
  await expect(page.getByLabel('Название', { exact: true })).toHaveValue('Учебная точка ЛР6')
  await page.getByLabel('Краткое описание', { exact: true }).fill('Описание новой точки')
  await page.getByLabel('Широта, °', { exact: true }).fill('0')
  await page.getByLabel('Долгота, °', { exact: true }).fill('0')
  await page.getByRole('button', { name: 'Опубликовать', exact: true }).click()
  await expect(page).toHaveURL(/\/feed\/9$/)
  await expect(page.locator('.feed__title')).toHaveText('Учебная точка ЛР6')
  expect(state.draft).toBeNull()
  expect(state.points.at(-1).latitude).toBe(0)
})

test('ошибка API у пользователя не подменяется mock; ошибка 500 гостю тоже видна', async ({ page }) => {
  const state = await backend(page)
  await login(page)
  state.unavailable = true
  await page.getByRole('button', { name: 'Найти', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Веб-сервис недоступен')
  await expect(page.locator('.grid .card')).toHaveCount(0)
  state.unavailable = false
  state.forbidden = true
  await page.reload()
  await expect(page.getByRole('alert')).toContainText('Не удалось выполнить запрос')
})

test('загрузка блокирует кнопки до получения отфильтрованной выдачи', async ({ page }) => {
  const state = await backend(page)
  await login(page)
  state.delay = 600
  await page.getByRole('slider').fill('0')
  await page.getByRole('button', { name: 'Найти', exact: true }).click()
  await expect(page.locator('.loading-overlay')).toBeVisible()
  await expect(page.locator('button[aria-label="Найти"]')).toBeDisabled()
  await expect(page.locator('.app-interaction')).toHaveAttribute('inert', '')
  await expect(page.locator('.grid .card')).toHaveCount(1)
  await expect(page.locator('.loading-overlay')).toHaveCount(0)
})

test('гость не может открыть добавление напрямую', async ({ page }) => {
  await backend(page)
  await page.goto('/observation_points/new')
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Вход', exact: true })).toBeVisible()
})
