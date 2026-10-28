import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { defaultObservationPointImage } from '../utils/observationPointMedia'
import type { ObservationPoint } from '../types/observationPoint'
import { formatLatitude } from '../utils/observationPointCoordinates'


interface ObservationPointCardProps {
  observationPoint: ObservationPoint
}

export function ObservationPointCard({ observationPoint }: ObservationPointCardProps) {
  return (
    <Card as={Link} to={`/feed/${observationPoint.id}`}>
      <Card.Img
        className="card__image"
        src={observationPoint.image_url || defaultObservationPointImage}
        alt={observationPoint.image_url ? observationPoint.name : 'Фото точки наблюдения отсутствует'}
        onError={(event) => {
          const image = event.currentTarget
          if (image.getAttribute('src') !== defaultObservationPointImage) {
            image.src = defaultObservationPointImage
            image.alt = 'Фото точки наблюдения отсутствует'
          }
        }}
        loading="lazy"
        width={640}
        height={400}
      />
      <div className="card__head">
        <Card.Title as="h2" className="card__title">{observationPoint.name}</Card.Title>
        <span className="round-arrow round-arrow--small" aria-hidden="true" />
      </div>
      <div className="card__foot">
        <span className="card__latitude">{formatLatitude(observationPoint.latitude, 2)}</span>
        <span className="card__likes" aria-label={`Отметок «нравится»: ${observationPoint.likes}`}>
          <span className="card__heart" aria-hidden="true" />{observationPoint.likes}
        </span>
      </div>
    </Card>
  )
}
