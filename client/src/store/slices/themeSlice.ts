import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  systemTheme: 'light' | 'dark'
  resolvedTheme: 'light' | 'dark'
}

// Get initial theme from localStorage or default to system
const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme') as Theme
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored
    }
  }
  return 'system'
}

// Get system theme preference
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

// Resolve theme based on preference and system theme
const resolveTheme = (theme: Theme, systemTheme: 'light' | 'dark'): 'light' | 'dark' => {
  return theme === 'system' ? systemTheme : theme
}

const initialSystemTheme = getSystemTheme()
const initialTheme = getInitialTheme()

const initialState: ThemeState = {
  theme: initialTheme,
  systemTheme: initialSystemTheme,
  resolvedTheme: resolveTheme(initialTheme, initialSystemTheme),
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload
      state.resolvedTheme = resolveTheme(action.payload, state.systemTheme)
      
      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload)
        
        // Apply theme to document
        const root = document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(state.resolvedTheme)
      }
    },
    setSystemTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.systemTheme = action.payload
      state.resolvedTheme = resolveTheme(state.theme, action.payload)
      
      // Apply theme to document if using system theme
      if (typeof window !== 'undefined' && state.theme === 'system') {
        const root = document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(state.resolvedTheme)
      }
    },
    toggleTheme: (state) => {
      if (state.theme === 'light') {
        state.theme = 'dark'
      } else if (state.theme === 'dark') {
        state.theme = 'system'
      } else {
        state.theme = 'light'
      }
      
      state.resolvedTheme = resolveTheme(state.theme, state.systemTheme)
      
      // Store in localStorage and apply to document
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', state.theme)
        
        const root = document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(state.resolvedTheme)
      }
    },
    initializeTheme: (state) => {
      // Apply current resolved theme to document
      if (typeof window !== 'undefined') {
        const root = document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(state.resolvedTheme)
      }
    },
  },
})

export const { setTheme, setSystemTheme, toggleTheme, initializeTheme } = themeSlice.actions

// Selectors
export const selectTheme = (state: { theme: ThemeState }) => state.theme.theme
export const selectSystemTheme = (state: { theme: ThemeState }) => state.theme.systemTheme
export const selectResolvedTheme = (state: { theme: ThemeState }) => state.theme.resolvedTheme
export const selectIsDarkMode = (state: { theme: ThemeState }) => state.theme.resolvedTheme === 'dark'

export default themeSlice.reducer