import { useEffect } from 'react'
import { Container, Spinner } from 'react-bootstrap'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { BottomNavigation } from './components/BottomNavigation'
import { RequestError } from './components/RequestError'
import { ObservationPointsPage } from './pages/ObservationPointsPage'
import { ObservationPointFeedPage } from './pages/ObservationPointFeedPage'
import { ObservationPointCreatePage } from './pages/ObservationPointCreatePage'
import { LoginPage } from './pages/LoginPage'
import { useAppSelector, useAppDispatch, selectBusy } from './store/store'
import { clearMutationError } from './store/observationPointsSlice'
import './App.css'

function App() {
  const { pathname } = useLocation()
  const isFeed = pathname === '/feed' || pathname.startsWith('/feed/')
  const busy = useAppSelector(selectBusy)
  const mutationError = useAppSelector(state => state.observationPoints.mutation.error)
  const authError = useAppSelector(state => state.auth.error)
  const dispatch = useAppDispatch()
  useEffect(() => { dispatch(clearMutationError()) }, [pathname, dispatch])
  return <div className="app-shell" aria-busy={busy}>
    <fieldset className="app-interaction" disabled={busy} inert={busy}>
      <Container as="main" className={isFeed ? 'app-content app-content--feed' : 'app-content'}>
        <Routes>
          <Route path="/" element={<Navigate to="/feed" replace />} />
          <Route path="/feed" element={<ObservationPointFeedPage />} />
          <Route path="/feed/:id" element={<ObservationPointFeedPage />} />
          <Route path="/observation_points" element={<ObservationPointsPage />} />
          <Route path="/observation_points/new" element={<ObservationPointCreatePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </Container>
      <BottomNavigation />
      {(mutationError || (authError && pathname !== '/login')) && <div className="global-message">
        <RequestError message={mutationError || authError} />
        {mutationError && <button type="button" onClick={() => dispatch(clearMutationError())}>Закрыть</button>}
      </div>}
    </fieldset>
    {busy && <div className="loading-overlay" role="status" aria-live="polite">
      <Spinner animation="border" aria-hidden="true" /><span>Загрузка…</span>
    </div>}
  </div>
}
export default App
