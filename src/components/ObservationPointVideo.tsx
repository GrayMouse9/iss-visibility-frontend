import { useEffect, useState } from 'react'
import type { ObservationPoint } from '../types/observationPoint'
import { defaultObservationPointImage, defaultObservationPointVideo, observationPointMediaUrl } from '../utils/observationPointMedia'

interface ObservationPointVideoProps {
  observationPoint: ObservationPoint
}

export function ObservationPointVideo({ observationPoint }: ObservationPointVideoProps) {
  const [videoSrc, setVideoSrc] = useState(observationPointMediaUrl(observationPoint.video_url) || defaultObservationPointVideo)
  const [poster, setPoster] = useState(observationPointMediaUrl(observationPoint.image_url) || defaultObservationPointImage)
  const [videoUnavailable, setVideoUnavailable] = useState(false)

  useEffect(() => {
    if (!observationPoint.image_url) return
    const image = new Image()
    image.onerror = () => setPoster(defaultObservationPointImage)
    image.src = observationPointMediaUrl(observationPoint.image_url)
    return () => { image.onerror = null }
  }, [observationPoint.image_url])

  function handleVideoError() {
    if (videoSrc !== defaultObservationPointVideo) {
      setVideoSrc(defaultObservationPointVideo)
    } else {
      setVideoUnavailable(true)
    }
  }

  return videoUnavailable ? (
    <img className="feed__video" src={poster} alt={observationPoint.name} />
  ) : (
    <video
      className="feed__video"
      src={videoSrc}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      onError={handleVideoError}
      aria-label={`Видео точки наблюдения: ${observationPoint.name}`}
    />
  )
}
