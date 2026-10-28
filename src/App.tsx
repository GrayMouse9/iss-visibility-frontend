import { Container } from 'react-bootstrap'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { BottomNavigation } from './components/BottomNavigation'
import { ObservationPointFeedPage } from './pages/ObservationPointFeedPage'
import { ObservationPointsPage } from './pages/ObservationPointsPage'
import './App.css'

function App() {
  const { pathname } = useLocation()
  const isFeed = pathname === '/feed' || pathname.startsWith('/feed/')
  return (
    <div className="app-shell">
      <Container as="main" className={isFeed ? 'app-content app-content--feed' : 'app-content'}>
        <Routes>
          <Route path="/" element={<Navigate to="/feed" replace />} />
          <Route path="/feed" element={<ObservationPointFeedPage />} />
          <Route path="/feed/:id" element={<ObservationPointFeedPage />} />
          <Route path="/observation_points" element={<ObservationPointsPage />} />
          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </Container>
      <BottomNavigation />
    </div>
  )
}

export default App
