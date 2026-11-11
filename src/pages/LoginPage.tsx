import { useState } from 'react'
import type { FormEvent } from 'react'
import { Form, Button } from 'react-bootstrap'
import { Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { authenticationApi, requestError } from '../api/client'
import { saveTokenCookie } from '../api/authentication'
import { authenticationStarted, authenticationFailed, loggedIn } from '../store/authSlice'
import { useAppDispatch, useAppSelector } from '../store/store'
import { RequestError } from '../components/RequestError'

export function LoginPage() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const { isAuthenticated, loading, error } = useAppSelector(state => state.auth)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  if (isAuthenticated) return <Navigate to="/observation_points" replace />

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    dispatch(authenticationStarted())
    try {
      const credentials = { login: login.trim(), password }
      // Ordinary Axios + dispatch: no generated users client and no createAsyncThunk.
      const response = await authenticationApi.post<{ access_token: string; expires_in: number }>('/login', credentials)
      if (!response.data.access_token || !(response.data.expires_in > 0)) throw new Error('Некорректный ответ входа')
      saveTokenCookie(response.data.access_token, response.data.expires_in)
      dispatch(loggedIn({ login: credentials.login, token: response.data.access_token }))
      navigate('/observation_points', { replace: true })
    } catch (error) {
      dispatch(authenticationFailed(axios.isAxiosError(error) && error.response?.status === 401 ? 'Неверный логин или пароль.' : requestError(error)))
    }
  }

  return <section className="entry-page">
    <h1 className="title">Вход</h1>
    <RequestError message={error} />
    <Form className="entry-form" onSubmit={submit}>
      <fieldset disabled={loading}>
        <Form.Group controlId="login"><Form.Label>Логин</Form.Label>
          <Form.Control required maxLength={25} autoComplete="username" value={login} onChange={e => setLogin(e.target.value)} />
        </Form.Group>
        <Form.Group controlId="password"><Form.Label>Пароль</Form.Label>
          <Form.Control required type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} />
        </Form.Group>
        <Button type="submit">Войти</Button>
      </fieldset>
    </Form>
  </section>
}
