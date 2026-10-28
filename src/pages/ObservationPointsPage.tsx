import { useState } from 'react'
import { ObservationPointCard } from '../components/ObservationPointCard'
import { ObservationPointLatitudeFilter } from '../components/ObservationPointLatitudeFilter'
import { observationPointsMock } from '../mocks/observationPoints'

export function ObservationPointsPage() {
  const [minLatitude, setMinLatitude] = useState(-90)
  const observationPoints = observationPointsMock.filter(
    (point) => point.latitude !== null && point.latitude >= minLatitude,
  )

  return (
    <section aria-labelledby="observation-points-heading">
      <h1 id="observation-points-heading" className="title">Точки наблюдения</h1>
      <ObservationPointLatitudeFilter onApply={setMinLatitude} />
      <div className="grid">
        {observationPoints.map((observationPoint) => (
          <ObservationPointCard key={observationPoint.id} observationPoint={observationPoint} />
        ))}
        {observationPoints.length === 0 && <p className="empty" role="status">Ничего не найдено</p>}
      </div>
    </section>
  )
}
