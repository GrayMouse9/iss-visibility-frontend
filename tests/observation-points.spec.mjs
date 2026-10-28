import { expect, test } from '@playwright/test'

test('плитка: фильтр применяется кнопкой, пустой результат и сброс', async ({ page }) => {
  await page.goto('/observation_points')
  await expect(page.locator('.grid .card')).toHaveCount(6)
  await page.getByRole('slider', { name: 'Широта, от' }).fill('0')
  await expect(page.locator('.grid .card')).toHaveCount(6)
  await page.getByRole('button', { name: 'Найти', exact: true }).click()
  await expect(page.locator('.grid .card')).toHaveCount(3)
  await page.getByRole('slider').fill('90')
  await page.getByRole('button', { name: 'Найти', exact: true }).click()
  await expect(page.locator('.empty')).toHaveText('Ничего не найдено')
  await page.getByRole('slider').fill('-90')
  await page.getByRole('button', { name: 'Найти', exact: true }).click()
  await expect(page.locator('.grid .card')).toHaveCount(6)
})

test('карточка открывает выбранную точку; Далее учитывает пропуски и замыкает ленту', async ({ page }) => {
  await page.goto('/observation_points')
  await page.getByRole('link', { name: /Национальная обсерватория Китт-Пик/ }).click()
  await expect(page).toHaveURL(/\/feed\/2$/)
  await expect(page.locator('h1')).toHaveText('Национальная обсерватория Китт-Пик, Аризона')
  await page.getByRole('link', { name: 'Далее', exact: true }).click()
  await expect(page).toHaveURL(/\/feed\/4$/)
  await expect(page.locator('video')).toHaveAttribute('src', /alma.mp4$/)
  await page.goto('/feed/8')
  await page.getByRole('link', { name: 'Далее', exact: true }).click()
  await expect(page).toHaveURL(/\/feed\/1$/)
  await page.goBack()
  await expect(page.locator('h1')).toHaveText('Учебная точка, Москва')
})

test('прямая лента, видео, координаты и описание; недоступные действия', async ({ page }) => {
  await page.goto('/feed/1')
  const video = page.locator('video')
  await expect(video).toBeVisible()
  await expect.poll(() => video.evaluate((node) => node.readyState)).toBeGreaterThanOrEqual(2)
  await expect.poll(() => video.evaluate((node) => node.paused)).toBe(false)
  await expect(page.locator('.stat__value').first()).toHaveText('19.8207°')
  await expect(page.locator('.stat__label').last()).toHaveText('Западная долгота')
  await page.getByText('Ещё ↓', { exact: true }).click()
  await expect(page.locator('details')).toHaveAttribute('open', '')
  await page.getByText('Меньше ↑', { exact: true }).click()
  await expect(page.locator('details')).not.toHaveAttribute('open')
  await expect(page.getByRole('button', { name: 'Добавление' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Войти' })).toBeDisabled()
  await expect(page.getByRole('link', { name: 'Лента', exact: true })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('button', { name: /нравится/i })).toHaveCount(0)
})

test('пустые медиа и недоступные файлы получают локальные замены без внешних запросов', async ({ page }) => {
  const requests = []
  page.on('request', (request) => requests.push(request.url()))
  await page.route('**/media/observation-points/maunakea.*', (route) => route.abort())
  for (const path of ['/feed/1', '/feed/8']) {
    await page.goto(path)
    await expect(page.locator('video')).toHaveAttribute('src', '/media/default-observation-point.mp4')
    await expect(page.locator('video')).toHaveAttribute('poster', '/media/default-observation-point.jpg')
    await expect.poll(() => page.locator('video').evaluate((node) => node.readyState)).toBeGreaterThanOrEqual(2)
  }
  await page.goto('/observation_points')
  const image = page.locator('.card img').first()
  await expect(image).toHaveAttribute('src', '/media/default-observation-point.jpg')
  expect(requests.every((url) => url.startsWith('http://127.0.0.1:5175/'))).toBe(true)
})

test('неизвестная точка и некорректный ID показывают понятное сообщение', async ({ page }) => {
  for (const id of ['3', 'abc', '0', '01']) {
    await page.goto(`/feed/${id}`)
    await expect(page.getByRole('heading', { name: 'Точка наблюдения не найдена' })).toBeVisible()
    await page.getByRole('link', { name: 'К плитке' }).click()
    await expect(page).toHaveURL(/\/observation_points$/)
  }
})

test('фиксированный макет ЛР2 и видео без кнопок управления', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 1000 })
  await page.goto('/feed/1')
  await expect(page.locator('.app-shell')).toHaveCSS('width', '390px')
  await expect(page.locator('.app-shell')).toHaveCSS('height', '844px')
  await page.setViewportSize({ width: 600, height: 700 })
  await expect(page.locator('.app-shell')).toHaveCSS('height', '844px')
  await expect(page.getByRole('button', { name: /видео/i })).toHaveCount(0)
  await expect(page.locator('video')).not.toHaveAttribute('controls')
  await expect(page.locator('video')).toHaveAttribute('autoplay', '')
  await expect(page.locator('video')).toHaveAttribute('loop', '')
  await expect.poll(() => page.locator('video').evaluate((video) => video.paused)).toBe(false)
})
