import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import { observationPointsApi, authorizationHeaders, apiUnavailable, requestError } from '../api/client'
import type { DtoObservationPointFeed, DtoObservationPointList, HandlerPublishRequest } from '../api/generated/ObservationPointsApi'
import { observationPointsMock } from '../mocks/observationPoints'
import type { ObservationPoint } from '../types/observationPoint'
import { loggedIn, loggedOut } from './authSlice'
import type { RootState } from './store'

type Source = 'api' | 'mock'
interface RequestState { loading: boolean; error: string | null; requestId: string | null }
export interface ObservationPointsState {
  minLatitude: number
  latitudeInput: number
  catalog: RequestState & { items: ObservationPoint[]; source: Source }
  feed: RequestState & { point: ObservationPoint | null; nextId: number | null; source: Source }
  draft: RequestState & { point: ObservationPoint | null; loaded: boolean }
  mutation: RequestState
}
const requestState: RequestState = { loading: false, error: null, requestId: null }
const initialState: ObservationPointsState = {
  minLatitude: -90, latitudeInput: -90,
  catalog: { ...requestState, items: [], source: 'api' },
  feed: { ...requestState, point: null, nextId: null, source: 'api' },
  draft: { ...requestState, point: null, loaded: false },
  mutation: { ...requestState },
}
type ThunkConfig = { state: RootState; rejectValue: string }
const createPointsThunk = createAsyncThunk.withTypes<ThunkConfig>()

function pointFromResponse(point: DtoObservationPointFeed & DtoObservationPointList): ObservationPoint {
  if (!Number.isSafeInteger(point.id) || !point.name) throw new Error('Некорректный ответ API')
  return {
    id: point.id!, name: point.name, description: point.description ?? '',
    image_url: point.image_url ?? '', video_url: point.video_url ?? '',
    latitude: point.latitude ?? null, longitude: point.longitude ?? null,
    likes: point.likes ?? 0, is_mine: point.is_mine ?? 0, liked: point.liked ?? 0,
  }
}

export const loadObservationPoints = createPointsThunk(
  'observationPoints/loadCatalog',
  async (_, { getState, rejectWithValue, signal }) => {
    const { auth, observationPoints: { minLatitude } } = getState()
    try {
      const response = await observationPointsApi.observationPoints.observationPointsList(
        { min_latitude: minLatitude }, { headers: authorizationHeaders(auth.token), signal },
      )
      return { items: response.data.map(pointFromResponse), source: 'api' as Source }
    } catch (error) {
      if (!auth.isAuthenticated && apiUnavailable(error)) {
        return { items: observationPointsMock.filter(p => p.latitude !== null && p.latitude >= minLatitude), source: 'mock' as Source }
      }
      return rejectWithValue(requestError(error))
    }
  },
)

export const loadObservationPointFeed = createPointsThunk(
  'observationPoints/loadFeed',
  async (id: string | undefined, { getState, rejectWithValue, signal }) => {
    if (id !== undefined && !/^[1-9]\d*$/.test(id)) return rejectWithValue('Точка наблюдения не найдена')
    const { auth } = getState()
    const params = { headers: authorizationHeaders(auth.token), signal }
    try {
      // The API selects the next point through `after`, not GET /:id.
      const response = await observationPointsApi.observationPoints.observationPointsList(undefined, params)
      const items = response.data.map(pointFromResponse)
      const index = id === undefined ? 0 : items.findIndex(point => String(point.id) === id)
      if (index < 0 || !items.length) return rejectWithValue('Точка наблюдения не найдена')
      const previous = index === 0 ? undefined : items[index - 1].id
      const feed = await observationPointsApi.observationPoints.feedList({ after: previous }, params)
      const point = pointFromResponse(feed.data)
      if (id !== undefined && String(point.id) !== id) return rejectWithValue('Точка наблюдения не найдена')
      return { point, nextId: items[(index + 1) % items.length].id, source: 'api' as Source }
    } catch (error) {
      if (!auth.isAuthenticated && apiUnavailable(error)) {
        const index = id === undefined ? 0 : observationPointsMock.findIndex(point => String(point.id) === id)
        if (index < 0) return rejectWithValue('Точка наблюдения не найдена')
        return { point: observationPointsMock[index], nextId: observationPointsMock[(index + 1) % observationPointsMock.length].id, source: 'mock' as Source }
      }
      return rejectWithValue(requestError(error))
    }
  },
)

export const loadObservationPointDraft = createPointsThunk(
  'observationPoints/loadDraft',
  async (_, { getState, rejectWithValue, signal }) => {
    try {
      const response = await observationPointsApi.observationPoints.draftList({ headers: authorizationHeaders(getState().auth.token), signal })
      return pointFromResponse(response.data)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return null
      return rejectWithValue(requestError(error))
    }
  },
)

export const createObservationPointDraft = createPointsThunk(
  'observationPoints/createDraft',
  async (data: { name: string; image?: File; video?: File }, { getState, rejectWithValue, dispatch }) => {
    try {
      const response = await observationPointsApi.observationPoints.observationPointsCreate(data, { headers: authorizationHeaders(getState().auth.token) })
      return pointFromResponse(response.data)
    } catch (error) {
      // A partial upload failure may still leave a draft on the server.
      await dispatch(loadObservationPointDraft())
      return rejectWithValue(requestError(error))
    }
  },
)

export const publishObservationPoint = createPointsThunk(
  'observationPoints/publish',
  async (data: { id: number; fields: HandlerPublishRequest }, { getState, rejectWithValue }) => {
    try {
      const response = await observationPointsApi.observationPoints.publishUpdate(data.id, data.fields, { headers: authorizationHeaders(getState().auth.token) })
      return pointFromResponse(response.data)
    } catch (error) { return rejectWithValue(requestError(error)) }
  },
)

export const deleteObservationPoint = createPointsThunk(
  'observationPoints/delete',
  async (id: number, { getState, rejectWithValue }) => {
    try {
      await observationPointsApi.observationPoints.observationPointsDelete(id, { headers: authorizationHeaders(getState().auth.token) })
      return id
    } catch (error) { return rejectWithValue(requestError(error)) }
  },
)

export const setObservationPointLike = createPointsThunk(
  'observationPoints/setLike',
  async (data: { id: number; value: number }, { getState, rejectWithValue }) => {
    try {
      const response = await observationPointsApi.observationPoints.likeCreate(data.id, { value: data.value }, { headers: authorizationHeaders(getState().auth.token) })
      return { ...pointFromResponse(response.data), liked: data.value }
    } catch (error) { return rejectWithValue(requestError(error)) }
  },
)

const observationPointsSlice = createSlice({
  name: 'observationPoints', initialState,
  reducers: {
    setLatitudeInput(state, action: PayloadAction<number>) { state.latitudeInput = action.payload },
    applyLatitudeFilter(state) { state.minLatitude = state.latitudeInput },
    clearMutationError(state) { state.mutation.error = null },
  },
  extraReducers: builder => {
    builder.addCase(loggedIn, state => ({ ...initialState, minLatitude: state.minLatitude, latitudeInput: state.latitudeInput })).addCase(loggedOut, () => initialState)
    builder.addCase(loadObservationPoints.pending, (state, action) => {
      state.catalog = { ...state.catalog, loading: true, error: null, requestId: action.meta.requestId }
    }).addCase(loadObservationPoints.fulfilled, (state, action) => {
      if (state.catalog.requestId !== action.meta.requestId) return
      Object.assign(state.catalog, action.payload, { loading: false })
    }).addCase(loadObservationPoints.rejected, (state, action) => {
      if (state.catalog.requestId !== action.meta.requestId) return
      Object.assign(state.catalog, { loading: false, items: [], error: action.meta.aborted ? null : action.payload ?? 'Ошибка загрузки каталога' })
    })
    builder.addCase(loadObservationPointFeed.pending, (state, action) => {
      state.feed = { ...state.feed, loading: true, error: null, point: null, requestId: action.meta.requestId }
    }).addCase(loadObservationPointFeed.fulfilled, (state, action) => {
      if (state.feed.requestId !== action.meta.requestId) return
      Object.assign(state.feed, action.payload, { loading: false })
    }).addCase(loadObservationPointFeed.rejected, (state, action) => {
      if (state.feed.requestId !== action.meta.requestId) return
      Object.assign(state.feed, { loading: false, error: action.meta.aborted ? null : action.payload ?? 'Ошибка загрузки ленты' })
    })
    builder.addCase(loadObservationPointDraft.pending, (state, action) => {
      Object.assign(state.draft, { loading: true, loaded: false, error: null, requestId: action.meta.requestId })
    }).addCase(loadObservationPointDraft.fulfilled, (state, action) => {
      if (state.draft.requestId !== action.meta.requestId) return
      Object.assign(state.draft, { point: action.payload, loading: false, loaded: true })
    }).addCase(loadObservationPointDraft.rejected, (state, action) => {
      if (state.draft.requestId !== action.meta.requestId) return
      Object.assign(state.draft, { loading: false, error: action.meta.aborted ? null : action.payload ?? 'Ошибка загрузки черновика' })
    })
    builder.addCase(createObservationPointDraft.fulfilled, (state, action) => {
      if (state.mutation.requestId === action.meta.requestId) state.draft.point = action.payload
    }).addCase(publishObservationPoint.fulfilled, (state, action) => {
      if (state.mutation.requestId === action.meta.requestId) state.draft.point = null
    }).addCase(deleteObservationPoint.fulfilled, (state, action) => {
      if (state.mutation.requestId !== action.meta.requestId) return
      state.catalog.items = state.catalog.items.filter(point => point.id !== action.payload)
      if (state.draft.point?.id === action.payload) state.draft.point = null
    }).addCase(setObservationPointLike.fulfilled, (state, action) => {
      if (state.mutation.requestId !== action.meta.requestId) return
      if (state.feed.point?.id === action.payload.id) Object.assign(state.feed.point, { likes: action.payload.likes, liked: action.payload.liked })
    })
    // Matchers run after the specific fulfilled handlers above.
    builder.addMatcher(isAnyOf(createObservationPointDraft.pending, publishObservationPoint.pending, deleteObservationPoint.pending, setObservationPointLike.pending), (state, action) => {
      state.mutation = { loading: true, error: null, requestId: action.meta.requestId }
    }).addMatcher(isAnyOf(createObservationPointDraft.fulfilled, createObservationPointDraft.rejected, publishObservationPoint.fulfilled, publishObservationPoint.rejected, deleteObservationPoint.fulfilled, deleteObservationPoint.rejected, setObservationPointLike.fulfilled, setObservationPointLike.rejected), (state, action) => {
      if (state.mutation.requestId !== action.meta.requestId) return
      state.mutation.loading = false
      state.mutation.error = action.meta.requestStatus === 'rejected' ? (typeof action.payload === 'string' ? action.payload : 'Ошибка выполнения операции') : null
    })
  },
})
export const { setLatitudeInput, applyLatitudeFilter, clearMutationError } = observationPointsSlice.actions
export default observationPointsSlice.reducer
