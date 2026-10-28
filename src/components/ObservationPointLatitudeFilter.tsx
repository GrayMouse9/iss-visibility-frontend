import { useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { Button, Form } from 'react-bootstrap'

interface ObservationPointLatitudeFilterProps {
  onApply: (minLatitude: number) => void
}

export function ObservationPointLatitudeFilter({ onApply }: ObservationPointLatitudeFilterProps) {
  const [minLatitude, setMinLatitude] = useState(-90)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onApply(minLatitude)
  }

  return (
    <Form className="filter" onSubmit={handleSubmit}>
      <div className="filter__field">
        <Form.Label className="field__label" htmlFor="min_latitude">Широта, от</Form.Label>
        <div className="slider-wrap" style={{ '--fill': (minLatitude + 90) / 180 * 100 } as CSSProperties}>
          <output className="slider__bubble" htmlFor="min_latitude">{minLatitude}°</output>
          <input
            className="slider"
            type="range"
            id="min_latitude"
            name="min_latitude"
            min={-90}
            max={90}
            step={1}
            value={minLatitude}
            onChange={(event) => setMinLatitude(Number(event.target.value))}
          />
          <div className="filter__scale">
            <span>−90° ю. ш.</span>
            <span>90° с. ш.</span>
          </div>
        </div>
      </div>
      <Button className="action-row action-row--button" type="submit" aria-label="Найти">
        <span className="round-arrow round-arrow--search" aria-hidden="true" />
      </Button>
    </Form>
  )
}
