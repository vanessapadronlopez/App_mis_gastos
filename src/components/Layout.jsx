import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useApp } from '../context/AppContext'
import ThemeSelector from './ThemeSelector'
import MonthEndReview from './MonthEndReview'

const navItems = [
  { to: '/',           label: 'Inicio',   Icon: HomeIcon  },
  { to: '/add',        label: 'Añadir',   Icon: PlusIcon  },
  { to: '/stats',      label: 'Stats',    Icon: ChartIcon },
  { to: '/history',    label: 'Historial',Icon: ListIcon  },
  { to: '/categories', label: 'Categ.',   Icon: TagIcon   },
  { to: '/funds',      label: 'Fondos',   Icon: FundsIcon },
]

function HomeIcon({ active, color }) {
  return <svg viewBox="0 0 24 24" fill={active?color:'none'} stroke={color} strokeWidth={active?0:2} className="w-[20px] h-[20px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
  </svg>
}
function PlusIcon({ color }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} className="w-[20px] h-[20px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
  </svg>
}
function ChartIcon({ active, color }) {
  return <svg viewBox="0 0 24 24" fill={active?color:'none'} stroke={color} strokeWidth={2} className="w-[20px] h-[20px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
  </svg>
}
function ListIcon({ color }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} className="w-[20px] h-[20px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
  </svg>
}
function TagIcon({ active, color }) {
  return <svg viewBox="0 0 24 24" fill={active?color:'none'} stroke={color} strokeWidth={2} className="w-[20px] h-[20px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/>
  </svg>
}
function FundsIcon({ active, color }) {
  return <svg viewBox="0 0 24 24" fill={active?color:'none'} stroke={color} strokeWidth={2} className="w-[20px] h-[20px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
  </svg>
}
function PaletteIcon({ color }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} className="w-[20px] h-[20px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10a1 1 0 001-1v-1.5a1.5 1.5 0 011.5-1.5h1.5A3.5 3.5 0 0019.5 14.5V14c0-3.866-3.358-7-7.5-7z"/>
    <circle cx="8.5" cy="11.5" r="1" fill={color}/>
    <circle cx="11" cy="8.5" r="1" fill={color}/>
    <circle cx="14.5" cy="8.5" r="1" fill={color}/>
    <circle cx="16.5" cy="11.5" r="1" fill={color}/>
  </svg>
}

export default function Layout({ children }) {
  const { T } = useTheme()
  const { pendingMonthReview } = useApp()
  const [showSelector, setShowSelector] = useState(false)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: T.pageBg }}>
      <main className="flex-1 pb-20 max-w-lg mx-auto w-full">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 flex items-center h-16 z-10 px-0.5"
        style={{
          backgroundColor: T.navBg,
          borderTop: `1px solid ${T.navBorder}`,
          boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
        }}>

        {/* Nav items */}
        <div className="flex flex-1 justify-around">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className="flex flex-col items-center gap-0.5 px-1 py-1 rounded-xl transition-all"
              style={({ isActive }) => ({
                backgroundColor: isActive ? T.navActiveBg : 'transparent',
              })}>
              {({ isActive }) => {
                const color = isActive ? T.navActive : T.navInactive
                return (
                  <>
                    <Icon active={isActive} color={color} />
                    <span className="text-[9px] font-semibold tracking-wide" style={{ color }}>
                      {label}
                    </span>
                  </>
                )
              }}
            </NavLink>
          ))}
        </div>

        {/* Tema button */}
        <button
          onClick={() => setShowSelector(true)}
          className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all mr-0.5"
          style={{ color: T.navInactive }}>
          <PaletteIcon color={T.navInactive} />
          <span className="text-[9px] font-semibold tracking-wide" style={{ color: T.navInactive }}>
            Tema
          </span>
        </button>
      </nav>

      {/* Selector de tema */}
      {showSelector && <ThemeSelector onClose={() => setShowSelector(false)} />}

      {/* Revisión de fin de mes — aparece automáticamente */}
      {pendingMonthReview && <MonthEndReview month={pendingMonthReview} />}
    </div>
  )
}
