import { Nav, Navbar } from 'react-bootstrap'
import { NavLink, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { authenticationApi, authorizationHeaders, requestError } from '../api/client'
import { clearTokenCookie } from '../api/authentication'
import { authenticationStarted, loggedOut, authenticationFailed } from '../store/authSlice'
import { useAppDispatch, useAppSelector, selectBusy } from '../store/store'

export function BottomNavigation() {
  const { isAuthenticated, token } = useAppSelector(state => state.auth)
  const busy = useAppSelector(selectBusy)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  async function logout() {
    dispatch(authenticationStarted())
    try {
      // Authentication deliberately uses neither generated code nor thunk.
      await authenticationApi.post('/logout', undefined, { headers: authorizationHeaders(token) })
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 401) {
        dispatch(authenticationFailed(requestError(error)))
        return
      }
    }
    clearTokenCookie()
    dispatch(loggedOut())
    navigate('/observation_points')
  }

  return <Navbar as="nav" className="tabs" aria-label="Основная навигация">
    <Nav>
      <Nav.Link as={NavLink} className="tab" to="/feed">
        <span className="tab__icon tab__icon--feed" aria-hidden="true" /><span className="tab__label">Лента</span>
      </Nav.Link>
      {isAuthenticated
        ? <Nav.Link as={NavLink} className="tab" to="/observation_points/new"><span className="tab__icon tab__icon--add" aria-hidden="true" /><span className="tab__label">Добавление</span></Nav.Link>
        : <Nav.Link as="button" className="tab" type="button" disabled><span className="tab__icon tab__icon--add" aria-hidden="true" /><span className="tab__label">Добавление</span></Nav.Link>}
      <Nav.Link as={NavLink} className="tab" to="/observation_points" end>
        <span className="tab__icon tab__icon--points" aria-hidden="true" /><span className="tab__label">Плитка</span>
      </Nav.Link>
      {isAuthenticated
        ? <Nav.Link as="button" className="tab" type="button" disabled={busy} onClick={() => { void logout() }}><span className="tab__icon tab__icon--login" aria-hidden="true" /><span className="tab__label">Выход</span></Nav.Link>
        : <Nav.Link as={NavLink} className="tab" to="/login"><span className="tab__icon tab__icon--login" aria-hidden="true" /><span className="tab__label">Войти</span></Nav.Link>}
    </Nav>
  </Navbar>
}
