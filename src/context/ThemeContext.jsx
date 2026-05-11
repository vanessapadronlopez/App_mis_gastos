import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const PALETTES = {
  teal: {
    name: 'Teal',
    emoji: '🩵',
    light: {
      pageBg: '#E4F4F8', card: '#FFFFFF', cardBorder: '#9FD3E3', barTrack: '#D0EEF7',
      text: '#0A2E3A', textSub: '#0F5068', textMuted: '#1E7A96', textFaint: '#3A9DB8',
      navBg: '#FFFFFF', navBorder: '#C8EAF5', navActive: '#0A2E3A', navInactive: '#0F5068', navActiveBg: '#E4F4F8',
      inputBg: '#FFFFFF', inputBorder: '#9FD3E3',
      heroGrad: 'linear-gradient(160deg, #2A7387 0%, #5EB0C8 100%)',
      heroGradAlt: 'linear-gradient(135deg, #0C3846, #2A7387)',
    },
    dark: {
      pageBg: '#09111A', card: '#14253A', cardBorder: '#1E3D5C', barTrack: '#1E3D5C',
      text: '#F0F8FF', textSub: '#7DC4E0', textMuted: '#4D9DB8', textFaint: '#2A6680',
      navBg: '#0D1E2E', navBorder: '#1E3D5C', navActive: '#F0F8FF', navInactive: '#4D9DB8', navActiveBg: '#14253A',
      inputBg: '#14253A', inputBorder: '#1E3D5C',
      heroGrad: 'linear-gradient(160deg, #0C4A6E 0%, #0E7490 100%)',
      heroGradAlt: 'linear-gradient(135deg, #062A42, #0C4A6E)',
    },
  },
  rose: {
    name: 'Rosa',
    emoji: '🌸',
    light: {
      pageBg: '#FFF0F5', card: '#FFFFFF', cardBorder: '#FBCFE8', barTrack: '#FCE7F3',
      text: '#4A0520', textSub: '#881337', textMuted: '#BE185D', textFaint: '#DB2777',
      navBg: '#FFFFFF', navBorder: '#FBCFE8', navActive: '#4A0520', navInactive: '#881337', navActiveBg: '#FFF0F5',
      inputBg: '#FFFFFF', inputBorder: '#FBCFE8',
      heroGrad: 'linear-gradient(160deg, #9D174D 0%, #EC4899 100%)',
      heroGradAlt: 'linear-gradient(135deg, #4A0520, #9D174D)',
    },
    dark: {
      pageBg: '#120009', card: '#250014', cardBorder: '#4D0A2A', barTrack: '#3D0820',
      text: '#FFF0F5', textSub: '#F9A8D4', textMuted: '#EC4899', textFaint: '#BE185D',
      navBg: '#0E0007', navBorder: '#4D0A2A', navActive: '#FFF0F5', navInactive: '#EC4899', navActiveBg: '#250014',
      inputBg: '#250014', inputBorder: '#4D0A2A',
      heroGrad: 'linear-gradient(160deg, #831843 0%, #BE185D 100%)',
      heroGradAlt: 'linear-gradient(135deg, #4A0520, #831843)',
    },
  },
  emerald: {
    name: 'Verde',
    emoji: '🌿',
    light: {
      pageBg: '#ECFDF5', card: '#FFFFFF', cardBorder: '#A7F3D0', barTrack: '#D1FAE5',
      text: '#052E16', textSub: '#065F46', textMuted: '#047857', textFaint: '#059669',
      navBg: '#FFFFFF', navBorder: '#A7F3D0', navActive: '#052E16', navInactive: '#065F46', navActiveBg: '#ECFDF5',
      inputBg: '#FFFFFF', inputBorder: '#A7F3D0',
      heroGrad: 'linear-gradient(160deg, #065F46 0%, #10B981 100%)',
      heroGradAlt: 'linear-gradient(135deg, #052E16, #065F46)',
    },
    dark: {
      pageBg: '#030F0A', card: '#0A2218', cardBorder: '#134E36', barTrack: '#0F3A28',
      text: '#ECFDF5', textSub: '#6EE7B7', textMuted: '#34D399', textFaint: '#059669',
      navBg: '#060F0A', navBorder: '#134E36', navActive: '#ECFDF5', navInactive: '#34D399', navActiveBg: '#0A2218',
      inputBg: '#0A2218', inputBorder: '#134E36',
      heroGrad: 'linear-gradient(160deg, #065F46 0%, #059669 100%)',
      heroGradAlt: 'linear-gradient(135deg, #052E16, #065F46)',
    },
  },
  purple: {
    name: 'Morado',
    emoji: '🔮',
    light: {
      pageBg: '#F5F3FF', card: '#FFFFFF', cardBorder: '#DDD6FE', barTrack: '#EDE9FE',
      text: '#2E1065', textSub: '#4C1D95', textMuted: '#6D28D9', textFaint: '#7C3AED',
      navBg: '#FFFFFF', navBorder: '#DDD6FE', navActive: '#2E1065', navInactive: '#4C1D95', navActiveBg: '#F5F3FF',
      inputBg: '#FFFFFF', inputBorder: '#DDD6FE',
      heroGrad: 'linear-gradient(160deg, #4C1D95 0%, #7C3AED 100%)',
      heroGradAlt: 'linear-gradient(135deg, #2E1065, #4C1D95)',
    },
    dark: {
      pageBg: '#07030F', card: '#130B2E', cardBorder: '#2A1660', barTrack: '#200F4A',
      text: '#F5F3FF', textSub: '#C4B5FD', textMuted: '#A78BFA', textFaint: '#7C3AED',
      navBg: '#050210', navBorder: '#2A1660', navActive: '#F5F3FF', navInactive: '#A78BFA', navActiveBg: '#130B2E',
      inputBg: '#130B2E', inputBorder: '#2A1660',
      heroGrad: 'linear-gradient(160deg, #3B1080 0%, #6D28D9 100%)',
      heroGradAlt: 'linear-gradient(135deg, #2E1065, #3B1080)',
    },
  },
  amber: {
    name: 'Ámbar',
    emoji: '🔥',
    light: {
      pageBg: '#FFFBEB', card: '#FFFFFF', cardBorder: '#FDE68A', barTrack: '#FEF3C7',
      text: '#451A03', textSub: '#78350F', textMuted: '#B45309', textFaint: '#D97706',
      navBg: '#FFFFFF', navBorder: '#FDE68A', navActive: '#451A03', navInactive: '#78350F', navActiveBg: '#FFFBEB',
      inputBg: '#FFFFFF', inputBorder: '#FDE68A',
      heroGrad: 'linear-gradient(160deg, #B45309 0%, #F59E0B 100%)',
      heroGradAlt: 'linear-gradient(135deg, #451A03, #B45309)',
    },
    dark: {
      pageBg: '#120A00', card: '#251500', cardBorder: '#4A2900', barTrack: '#3B2000',
      text: '#FFFBEB', textSub: '#FDE68A', textMuted: '#F59E0B', textFaint: '#D97706',
      navBg: '#0E0800', navBorder: '#4A2900', navActive: '#FFFBEB', navInactive: '#F59E0B', navActiveBg: '#251500',
      inputBg: '#251500', inputBorder: '#4A2900',
      heroGrad: 'linear-gradient(160deg, #92400E 0%, #D97706 100%)',
      heroGradAlt: 'linear-gradient(135deg, #451A03, #92400E)',
    },
  },
  slate: {
    name: 'Gris',
    emoji: '🌫️',
    light: {
      pageBg: '#F1F5F9', card: '#FFFFFF', cardBorder: '#CBD5E1', barTrack: '#E2E8F0',
      text: '#0F172A', textSub: '#1E293B', textMuted: '#475569', textFaint: '#64748B',
      navBg: '#FFFFFF', navBorder: '#CBD5E1', navActive: '#0F172A', navInactive: '#1E293B', navActiveBg: '#F1F5F9',
      inputBg: '#FFFFFF', inputBorder: '#CBD5E1',
      heroGrad: 'linear-gradient(160deg, #334155 0%, #64748B 100%)',
      heroGradAlt: 'linear-gradient(135deg, #0F172A, #334155)',
    },
    dark: {
      pageBg: '#020617', card: '#0F172A', cardBorder: '#1E293B', barTrack: '#1E293B',
      text: '#F8FAFC', textSub: '#CBD5E1', textMuted: '#94A3B8', textFaint: '#475569',
      navBg: '#010410', navBorder: '#1E293B', navActive: '#F8FAFC', navInactive: '#94A3B8', navActiveBg: '#0F172A',
      inputBg: '#0F172A', inputBorder: '#1E293B',
      heroGrad: 'linear-gradient(160deg, #1E293B 0%, #334155 100%)',
      heroGradAlt: 'linear-gradient(135deg, #0F172A, #1E293B)',
    },
  },
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('gasto-theme') === 'dark')
  const [paletteKey, setPaletteKeyState] = useState(() => localStorage.getItem('gasto-palette') || 'teal')

  const setPaletteKey = key => {
    setPaletteKeyState(key)
    localStorage.setItem('gasto-palette', key)
  }

  useEffect(() => {
    localStorage.setItem('gasto-theme', isDark ? 'dark' : 'light')
    const pal = PALETTES[paletteKey] || PALETTES.teal
    document.body.style.backgroundColor = pal[isDark ? 'dark' : 'light'].pageBg
  }, [isDark, paletteKey])

  const toggle = () => setIsDark(p => !p)
  const palette = PALETTES[paletteKey] || PALETTES.teal
  const T = palette[isDark ? 'dark' : 'light']

  return (
    <ThemeContext.Provider value={{ isDark, toggle, T, paletteKey, setPaletteKey, PALETTES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
