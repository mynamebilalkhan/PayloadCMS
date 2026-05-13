'use client'

import React, { createContext, useContext } from 'react'
import type { ThemeTokens } from './tokens'
import { defaultTheme } from './tokens'

const ThemeContext = createContext<ThemeTokens>(defaultTheme)

export function ThemeProvider({
  theme,
  children,
}: {
  theme: ThemeTokens
  children: React.ReactNode
}) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export function useThemeContext(): ThemeTokens {
  return useContext(ThemeContext)
}
