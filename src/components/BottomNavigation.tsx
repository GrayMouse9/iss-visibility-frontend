import { Nav, Navbar } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'

export function BottomNavigation() {
  return (
    <Navbar as="nav" className="tabs" aria-label="Основная навигация">
      <Nav>
        <Nav.Link as={NavLink} className="tab" to="/feed">
          <span className="tab__icon tab__icon--feed" aria-hidden="true" />
          <span className="tab__label">Лента</span>
        </Nav.Link>
        <Nav.Link as="button" className="tab" type="button" disabled>
          <span className="tab__icon tab__icon--add" aria-hidden="true" />
          <span className="tab__label">Добавление</span>
        </Nav.Link>
        <Nav.Link as={NavLink} className="tab" to="/observation_points">
          <span className="tab__icon tab__icon--points" aria-hidden="true" />
          <span className="tab__label">Плитка</span>
        </Nav.Link>
        <Nav.Link as="button" className="tab" type="button" disabled>
          <span className="tab__icon tab__icon--login" aria-hidden="true" />
          <span className="tab__label">Войти</span>
        </Nav.Link>
      </Nav>
    </Navbar>
  )
}
