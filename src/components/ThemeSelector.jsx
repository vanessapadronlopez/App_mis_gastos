import { useTheme } from '../context/ThemeContext'

export default function ThemeSelector({ onClose }) {
  const { isDark, toggle, T, paletteKey, setPaletteKey, PALETTES } = useTheme()

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl p-6 pb-10 shadow-2xl"
        style={{ backgroundColor: T.card }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ backgroundColor: T.cardBorder }} />

        <h2 className="text-xl font-bold mb-6" style={{ color: T.text }}>Personalizar apariencia</h2>

        {/* Modo claro / oscuro */}
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: T.textMuted }}>Modo</p>
        <div className="flex rounded-2xl p-1 mb-7" style={{ backgroundColor: T.pageBg, border: `1px solid ${T.cardBorder}` }}>
          {[
            { val: false, icon: '☀️', label: 'Claro'  },
            { val: true,  icon: '🌙', label: 'Oscuro' },
          ].map(({ val, icon, label }) => (
            <button
              key={label}
              onClick={() => { if (isDark !== val) toggle() }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all"
              style={{
                backgroundColor: isDark === val ? T.text : 'transparent',
                color: isDark === val ? T.pageBg : T.textMuted,
              }}
            >
              <span className="text-base">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Paleta de color */}
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: T.textMuted }}>Color</p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {Object.entries(PALETTES).map(([key, pal]) => {
            const isActive = paletteKey === key
            return (
              <button
                key={key}
                onClick={() => setPaletteKey(key)}
                className="flex items-center gap-3 p-3 rounded-2xl border-2 transition-all"
                style={{
                  borderColor: isActive ? T.text : T.cardBorder,
                  backgroundColor: isActive ? T.pageBg : 'transparent',
                }}
              >
                {/* Preview del gradiente */}
                <div
                  className="w-9 h-9 rounded-xl flex-shrink-0 shadow-sm"
                  style={{ background: pal.light.heroGrad }}
                />
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold leading-tight" style={{ color: T.text }}>{pal.emoji} {pal.name}</p>
                </div>
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: T.text }} />
                )}
              </button>
            )
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl font-bold text-sm text-white"
          style={{ background: T.heroGrad }}
        >
          Listo
        </button>
      </div>
    </div>
  )
}
