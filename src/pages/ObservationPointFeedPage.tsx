import { Link, useParams } from 'react-router-dom'
import { ObservationPointVideo } from '../components/ObservationPointVideo'
import { observationPointsMock } from '../mocks/observationPoints'

export function ObservationPointFeedPage() {
  const { id } = useParams()
  const index = id === undefined ? 0 : observationPointsMock.findIndex((point) => String(point.id) === id)
  const observationPoint = observationPointsMock[index]

  if (!observationPoint) {
    return (
      <section className="feed-empty">
        <h1 className="title">Точка наблюдения не найдена</h1>
        <Link to="/observation_points">К плитке</Link>
      </section>
    )
  }

  const nextPoint = observationPointsMock[(index + 1) % observationPointsMock.length]
  const { latitude, longitude } = observationPoint

  return (
    <section className="feed" aria-labelledby="feed-heading">
      <ObservationPointVideo key={observationPoint.id} observationPoint={observationPoint} />
      <div className="feed__shade" aria-hidden="true" />
      <div className="feed__content">
        <div className="feed__info">
          <h1 id="feed-heading" className="feed__title">{observationPoint.name}</h1>
          <details className="more" key={observationPoint.id}>
            <summary className="more__summary">
              <span className="more__text">{observationPoint.description}</span>
              <span className="more__toggle more__toggle--closed">Ещё ↓</span>
              <span className="more__toggle more__toggle--open">Меньше ↑</span>
            </summary>
          </details>
        </div>
        <div className="feed__side">
          <div className="stats">
            <div>
              <div className="stat__value">{latitude === null ? 'Не указана' : `${Math.abs(latitude).toFixed(4)}°`}</div>
              <div className="stat__label">{latitude === null ? 'Широта' : latitude < 0 ? 'Южная широта' : 'Северная широта'}</div>
            </div>
            <div>
              <div className="stat__value">{longitude === null ? 'Не указана' : `${Math.abs(longitude).toFixed(4)}°`}</div>
              <div className="stat__label">{longitude === null ? 'Долгота' : longitude < 0 ? 'Западная долгота' : 'Восточная долгота'}</div>
            </div>
          </div>
          <div className="feed__actions">
            <div className="action" aria-label={`Отметок «нравится»: ${observationPoint.likes}`}>
              <span className="action__icon action__icon--like" aria-hidden="true" />
              <span className="action__label">{observationPoint.likes}</span>
            </div>
            <Link className="action" to={`/feed/${nextPoint.id}`}>
              <span className="action__icon action__icon--next" aria-hidden="true" />
              <span className="action__label">Далее</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
