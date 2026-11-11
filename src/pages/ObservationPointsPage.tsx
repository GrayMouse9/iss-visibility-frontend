import { useEffect } from 'react'
import { ObservationPointCard } from '../components/ObservationPointCard'
import { ObservationPointLatitudeFilter } from '../components/ObservationPointLatitudeFilter'
import { RequestError } from '../components/RequestError'
import { useAppDispatch, useAppSelector } from '../store/store'
import { applyLatitudeFilter, deleteObservationPoint, loadObservationPoints } from '../store/observationPointsSlice'

export function ObservationPointsPage() {
  const dispatch = useAppDispatch()
  const { minLatitude, catalog } = useAppSelector(state => state.observationPoints)
  const { token, isAuthenticated } = useAppSelector(state => state.auth)
  useEffect(() => {
    const request = dispatch(loadObservationPoints())
    return () => { request.abort() }
  }, [dispatch, minLatitude, token])

  async function remove(id: number, name: string) {
    if (!window.confirm(`Удалить точку «${name}»?`)) return
    const result = await dispatch(deleteObservationPoint(id))
    if (deleteObservationPoint.fulfilled.match(result)) dispatch(loadObservationPoints())
  }

  return <section aria-labelledby="observation-points-heading">
    <h1 id="observation-points-heading" className="title">Точки наблюдения</h1>
    <ObservationPointLatitudeFilter onApply={(value) => {
      if (value === minLatitude) dispatch(loadObservationPoints())
      else dispatch(applyLatitudeFilter())
    }} />
    <RequestError message={catalog.error} onRetry={() => dispatch(loadObservationPoints())} />
    <div className="grid">
      {catalog.items.map(point => <ObservationPointCard key={point.id} observationPoint={point}
        onDelete={isAuthenticated && point.is_mine === 1 ? () => { void remove(point.id, point.name) } : undefined} />)}
      {!catalog.loading && !catalog.error && catalog.items.length === 0 && <p className="empty" role="status">Ничего не найдено</p>}
    </div>
  </section>
}
