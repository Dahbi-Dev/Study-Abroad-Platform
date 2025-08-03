import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'

// Import slice reducers
import authSlice from './slices/authSlice'
import themeSlice from './slices/themeSlice'
import notificationSlice from './slices/notificationSlice'

// Import API slices
import { authApi } from './api/authApi'
import { superAdminApi } from './api/superAdminApi'
import { clientApi } from './api/clientApi'
import { agencyApi } from './api/agencyApi'

export const store = configureStore({
  reducer: {
    // Feature slices
    auth: authSlice,
    theme: themeSlice,
    notifications: notificationSlice,

    // API slices
    [authApi.reducerPath]: authApi.reducer,
    [superAdminApi.reducerPath]: superAdminApi.reducer,
    [clientApi.reducerPath]: clientApi.reducer,
    [agencyApi.reducerPath]: agencyApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          // Ignore these action types from serializability checks
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/REGISTER',
        ],
        ignoredPaths: ['register'],
      },
    })
      .concat(authApi.middleware)
      .concat(superAdminApi.middleware)
      .concat(clientApi.middleware)
      .concat(agencyApi.middleware),
  devTools: import.meta.env.DEV,
})

// Optional: setup listeners for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Export typed hooks
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector