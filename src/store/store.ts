import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import auth from './authSlice'
import observationPoints from './observationPointsSlice'

export const store = configureStore({
  reducer: { auth, observationPoints },
  // configureStore includes redux-thunk in its default middleware.
  devTools: import.meta.env.DEV,
})
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
export const selectBusy = (state: RootState) => state.auth.loading ||
  state.observationPoints.catalog.loading || state.observationPoints.feed.loading ||
  state.observationPoints.draft.loading || state.observationPoints.mutation.loading
