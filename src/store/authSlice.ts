import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface AuthState {
  isAuthenticated: boolean
  login: string
  token: string | null
  loading: boolean
  error: string | null
}

// Deliberately do not restore the interface from the cookie after F5 (ЛР6).
const initialState: AuthState = {
  isAuthenticated: false, login: '', token: null, loading: false, error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authenticationStarted(state) { state.loading = true; state.error = null },
    loggedIn(_state, action: PayloadAction<{ login: string; token: string }>) {
      return { ...initialState, ...action.payload, isAuthenticated: true }
    },
    loggedOut() { return initialState },
    authenticationFailed(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
    },
    clearAuthenticationError(state) { state.error = null },
  },
})

export const { authenticationStarted, loggedIn, loggedOut, authenticationFailed, clearAuthenticationError } = authSlice.actions
export default authSlice.reducer
