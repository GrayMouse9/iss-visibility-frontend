import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Form } from 'react-bootstrap'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/store'
import { loadObservationPointDraft, createObservationPointDraft, publishObservationPoint, deleteObservationPoint } from '../store/observationPointsSlice'
import { RequestError } from '../components/RequestError'
import { observationPointMediaUrl, defaultObservationPointImage, defaultObservationPointVideo } from '../utils/observationPointMedia'
import type { ObservationPoint } from '../types/observationPoint'

// The field layout and styling are carried over from the ЛР2 add.page.html template.
function PointMedia({ point }: { point?: ObservationPoint }) {
  const image = observationPointMediaUrl(point?.image_url ?? '') || defaultObservationPointImage
  const video = observationPointMediaUrl(point?.video_url ?? '') || defaultObservationPointVideo
  return <>
    <section className="field">
      <div className="field__label">Изображение</div>
      <img className="media" src={image} alt={point?.name ?? 'Изображение по умолчанию'} onError={event => {
        if (event.currentTarget.getAttribute('src') !== defaultObservationPointImage) event.currentTarget.src = defaultObservationPointImage
      }} />
    </section>
    <section className="field">
      <div className="field__label">Видео</div>
      <video className="media" src={video} poster={image} autoPlay muted loop playsInline onError={event => {
        if (event.currentTarget.getAttribute('src') !== defaultObservationPointVideo) event.currentTarget.src = defaultObservationPointVideo
      }} />
    </section>
  </>
}

function CreateDraftForm() {
  const [name, setName] = useState('')
  const [image, setImage] = useState<File>()
  const [video, setVideo] = useState<File>()
  const dispatch = useAppDispatch()
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await dispatch(createObservationPointDraft({ name: name.trim(), image, video }))
  }
  return <Form className="creation-form" onSubmit={submit}>
    <section className="field">
      <div className="field__label">Изображение</div>
      <img className="media" src={defaultObservationPointImage} alt="Изображение по умолчанию" />
      <label className="file">Выбрать изображение
        <input type="file" aria-label="Выбрать изображение" accept="image/jpeg,image/png,image/webp" onChange={e => setImage(e.target.files?.[0])} />
      </label>
    </section>
    <section className="field">
      <div className="field__label">Видео</div>
      <video className="media" src={defaultObservationPointVideo} poster={defaultObservationPointImage} autoPlay muted loop playsInline />
      <label className="file">Выбрать видео
        <input type="file" aria-label="Выбрать видео" accept="video/mp4" onChange={e => setVideo(e.target.files?.[0])} />
      </label>
    </section>
    <section className="field">
      <label className="field__label" htmlFor="point-name">Название</label>
      <input className="input" id="point-name" required maxLength={100} placeholder="Например, Байконур" value={name} onChange={e => setName(e.target.value)} />
    </section>
    <button className="button" type="submit">Далее</button>
  </Form>
}

function PublishDraftForm({ point }: { point: ObservationPoint }) {
  const [description, setDescription] = useState(point.description)
  const [latitude, setLatitude] = useState(point.latitude?.toString() ?? '')
  const [longitude, setLongitude] = useState(point.longitude?.toString() ?? '')
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = await dispatch(publishObservationPoint({ id: point.id, fields: { description: description.trim(), latitude: Number(latitude), longitude: Number(longitude) } }))
    if (publishObservationPoint.fulfilled.match(result)) navigate(`/feed/${result.payload.id}`)
  }
  return <Form className="creation-form" onSubmit={submit}>
    <PointMedia point={point} />
    <section className="field">
      <label className="field__label" htmlFor="point-name">Название</label>
      <input className="input" id="point-name" value={point.name} readOnly />
    </section>
    <section className="field">
      <label className="field__label" htmlFor="point-description">Краткое описание</label>
      <textarea className="input input--multiline" id="point-description" rows={2} required maxLength={500} placeholder="Чем примечательна площадка" value={description} onChange={e => setDescription(e.target.value)} />
    </section>
    <section className="field field--row">
      <div className="field__col">
        <label className="field__label" htmlFor="point-latitude">Широта, °</label>
        <input className="input input--number" id="point-latitude" type="number" required min={-90} max={90} step="any" value={latitude} onChange={e => setLatitude(e.target.value)} />
      </div>
      <div className="field__col">
        <label className="field__label" htmlFor="point-longitude">Долгота, °</label>
        <input className="input input--number" id="point-longitude" type="number" required min={-180} max={180} step="any" value={longitude} onChange={e => setLongitude(e.target.value)} />
      </div>
    </section>
    <button className="button" type="submit">Опубликовать</button>
    <button className="button button--delete" type="button" onClick={() => {
      if (window.confirm('Удалить черновик?')) void dispatch(deleteObservationPoint(point.id))
    }}>Удалить черновик</button>
  </Form>
}

export function ObservationPointCreatePage() {
  const { isAuthenticated, token } = useAppSelector(state => state.auth)
  const { draft } = useAppSelector(state => state.observationPoints)
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (!isAuthenticated) return
    const request = dispatch(loadObservationPointDraft())
    return () => { request.abort() }
  }, [dispatch, isAuthenticated, token])
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <section className="creation-page">
    <h1 className="title">Новая точка наблюдения</h1>
    <RequestError message={draft.error} onRetry={() => dispatch(loadObservationPointDraft())} />
    {draft.loaded && (draft.point ? <PublishDraftForm key={draft.point.id} point={draft.point} /> : <CreateDraftForm />)}
  </section>
}
