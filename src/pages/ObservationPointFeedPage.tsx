import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ObservationPointVideo } from '../components/ObservationPointVideo'
import { useAppDispatch, useAppSelector } from '../store/store'
import { loadObservationPointFeed, setObservationPointLike } from '../store/observationPointsSlice'
import { RequestError } from '../components/RequestError'

export function ObservationPointFeedPage() {
  const { id } = useParams()
  const dispatch = useAppDispatch()
  const { point: observationPoint, nextId, loading, error } = useAppSelector(state => state.observationPoints.feed)
  const { token, isAuthenticated } = useAppSelector(state => state.auth)
  useEffect(() => {
    const request = dispatch(loadObservationPointFeed(id))
    return () => { request.abort() }
  }, [dispatch, id, token])

  if (!observationPoint) {
    return <section className="feed-empty">
      {!loading && <>
        <h1 className="title">{error === 'Точка наблюдения не найдена' ? error : 'Лента недоступна'}</h1>
        <RequestError message={error === 'Точка наблюдения не найдена' ? null : error} onRetry={() => dispatch(loadObservationPointFeed(id))} />
        <Link to="/observation_points">К плитке</Link>
      </>}
    </section>
  }

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
            {isAuthenticated
              ? <button type="button" className="action" aria-label="Нравится" aria-pressed={observationPoint.liked === 1}
                  onClick={() => dispatch(setObservationPointLike({ id: observationPoint.id, value: observationPoint.liked === 1 ? 0 : 1 }))}>
                  <span className="action__icon action__icon--like" aria-hidden="true" />
                  <span className="action__label">{observationPoint.likes}</span>
                </button>
              : <div className="action" aria-label={`Отметок «нравится»: ${observationPoint.likes}`}>
                  <span className="action__icon action__icon--like" aria-hidden="true" />
                  <span className="action__label">{observationPoint.likes}</span>
                </div>}
            <Link className="action" to={`/feed/${nextId}`}>
              <span className="action__icon action__icon--next" aria-hidden="true" />
              <span className="action__label">Далее</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
