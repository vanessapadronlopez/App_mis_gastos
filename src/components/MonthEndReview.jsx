import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'

const MO = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const fmtMonth = m => { const [y,mo] = m.split('-'); return `${MO[+mo-1]} ${y}` }

export default function MonthEndReview({ month }) {
  const { categories, specialCategories, getSpent, closeMonth } = useApp()
  const { T } = useTheme()

  // Leftovers: categories with unspent budget last month
  const leftovers = categories.map(cat => ({
    ...cat,
    spent:    getSpent(cat.id, month),
    leftover: Math.max(0, cat.limit - getSpent(cat.id, month)),
  })).filter(cat => cat.leftover > 0.01)

  // destinations[categoryId] = specialCategoryId | null (skip)
  const [destinations, setDestinations] = useState(
    () => Object.fromEntries(leftovers.map(c => [c.id, null]))
  )

  const totalToMove = leftovers
    .filter(c => destinations[c.id] !== null)
    .reduce((s, c) => s + c.leftover, 0)

  const confirm = () => {
    const distributions = leftovers
      .filter(c => destinations[c.id] !== null)
      .map(c => ({
        specialCategoryId: destinations[c.id],
        amount:            c.leftover,
        categoryName:      c.name,
      }))
    closeMonth(month, distributions)
  }

  const skip = () => closeMonth(month, [])

  // ── No leftover ───────────────────────────────────────────────────
  if (leftovers.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4"
        style={{ backgroundColor:'rgba(0,0,0,0.6)', backdropFilter:'blur(6px)' }}>
        <div className="w-full max-w-lg rounded-3xl p-6 shadow-2xl text-center"
          style={{ backgroundColor: T.card }}>
          <p className="text-5xl mb-3">🎯</p>
          <p className="font-bold text-lg mb-2" style={{ color: T.text }}>Cierre de {fmtMonth(month)}</p>
          <p className="text-sm mb-6" style={{ color: T.textMuted }}>
            No hubo sobrante este mes. ¡Cumpliste el presupuesto al completo!
          </p>
          <button onClick={skip}
            className="w-full py-3.5 rounded-2xl font-bold text-white"
            style={{ background: T.heroGrad }}>
            Continuar →
          </button>
        </div>
      </div>
    )
  }

  // ── With leftover ─────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)' }}>
      <div className="w-full max-w-lg rounded-t-3xl shadow-2xl flex flex-col"
        style={{ backgroundColor: T.card, maxHeight:'92vh' }}>

        {/* Handle */}
        <div className="pt-4 pb-2 flex-shrink-0">
          <div className="w-10 h-1 rounded-full mx-auto" style={{ backgroundColor: T.cardBorder }} />
        </div>

        {/* Header */}
        <div className="px-5 pb-4 flex-shrink-0">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <p className="font-bold text-lg leading-tight" style={{ color: T.text }}>
                Cierre de {fmtMonth(month)}
              </p>
              <p className="text-sm mt-1" style={{ color: T.textMuted }}>
                Te sobraron{' '}
                <strong style={{ color:'#22C55E' }}>
                  {leftovers.reduce((s,c) => s+c.leftover, 0).toFixed(2)}€
                </strong>{' '}
                en total. ¿Dónde los ponemos?
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable list */}
        <div className="overflow-y-auto flex-1 px-5 space-y-3 pb-3">
          {leftovers.map(cat => (
            <div key={cat.id} className="rounded-2xl p-4"
              style={{ backgroundColor: T.pageBg, border:`1px solid ${T.cardBorder}` }}>

              {/* Category row */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: cat.color+'25' }}>
                  {cat.emoji}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm" style={{ color: T.text }}>{cat.name}</p>
                  <p className="text-xs" style={{ color: T.textMuted }}>
                    Sobran <strong style={{ color:'#22C55E' }}>{cat.leftover.toFixed(2)}€</strong>
                    <span style={{ color: T.textFaint }}> ({cat.spent.toFixed(2)} / {cat.limit}€ usado)</span>
                  </p>
                </div>
              </div>

              {/* Destination picker */}
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-2"
                style={{ color: T.textFaint }}>Destino</p>
              <div className="flex flex-wrap gap-2">
                {/* Skip option */}
                <button
                  onClick={() => setDestinations(d => ({ ...d, [cat.id]: null }))}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: destinations[cat.id] === null ? T.text : T.card,
                    color:           destinations[cat.id] === null ? T.pageBg : T.textMuted,
                    border: `1px solid ${T.cardBorder}`,
                  }}>
                  Dejar pasar
                </button>

                {/* Special category chips */}
                {specialCategories.map(sp => (
                  <button key={sp.id}
                    onClick={() => setDestinations(d => ({ ...d, [cat.id]: sp.id }))}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1"
                    style={{
                      backgroundColor: destinations[cat.id] === sp.id ? sp.color : T.card,
                      color:           destinations[cat.id] === sp.id ? 'white'  : T.textSub,
                      border: `1px solid ${destinations[cat.id] === sp.id ? sp.color : T.cardBorder}`,
                    }}>
                    {sp.emoji} {sp.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 pt-3 pb-8 flex-shrink-0"
          style={{ borderTop:`1px solid ${T.cardBorder}` }}>

          {/* Summary */}
          {totalToMove > 0 ? (
            <div className="rounded-2xl p-3 mb-3 text-center"
              style={{ backgroundColor:'#ECFDF5', border:'1px solid #BBF7D0' }}>
              <p className="text-sm font-bold" style={{ color:'#065F46' }}>
                🌱 {totalToMove.toFixed(2)}€ irán a tus fondos especiales
              </p>
            </div>
          ) : (
            <div className="rounded-2xl p-3 mb-3 text-center"
              style={{ backgroundColor: T.pageBg, border:`1px solid ${T.cardBorder}` }}>
              <p className="text-sm" style={{ color: T.textMuted }}>
                Ningún importe asignado — el dinero permanece en tu saldo
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={skip}
              className="px-5 py-3 rounded-2xl font-semibold text-sm flex-shrink-0"
              style={{ backgroundColor: T.pageBg, color: T.textMuted, border:`1px solid ${T.cardBorder}` }}>
              Saltar
            </button>
            <button onClick={confirm}
              className="flex-1 py-3 rounded-2xl font-bold text-sm text-white"
              style={{ background: T.heroGrad }}>
              Confirmar cierre de mes ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
