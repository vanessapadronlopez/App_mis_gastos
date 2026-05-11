import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

function BalanceModal({ currentBalance, onClose, onSave }) {
  const { T } = useTheme()
  const today = new Date().toISOString().slice(0, 10)
  const [amount, setAmount] = useState(currentBalance !== null ? currentBalance.toFixed(2) : '')
  const [date, setDate] = useState(today)
  const [err, setErr] = useState('')
  const submit = e => {
    e.preventDefault()
    if (!amount || isNaN(Number(amount))) return setErr('Introduce un saldo valido')
    onSave(Number(amount), date); onClose()
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4" style={{ backgroundColor: 'rgba(7,30,42,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-sm rounded-3xl p-6 shadow-2xl" style={{ backgroundColor: T.card }}>
        <p className="font-bold text-lg mb-1" style={{ color: T.text }}>Ajustar saldo actual</p>
        <p className="text-sm mb-5" style={{ color: T.textMuted }}>Introduce tu saldo a principios de mes. Se descontaran todos los gastos del mes automaticamente.</p>
        <form onSubmit={submit} className="space-y-3">
          <input type="number" value={amount} onChange={e => { setAmount(e.target.value); setErr('') }} placeholder="0.00" step="0.01" autoFocus
            className="w-full rounded-2xl px-4 py-3 text-2xl font-bold border-2 focus:outline-none"
            style={{ backgroundColor: T.inputBg, borderColor: T.inputBorder, color: T.text }} />
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full rounded-2xl px-4 py-3 border-2 focus:outline-none"
            style={{ backgroundColor: T.inputBg, borderColor: T.inputBorder, color: T.textSub }} />
          {err && <p className="text-sm px-3 py-2 rounded-xl" style={{ color: '#F87171', backgroundColor: '#FEF2F2' }}>{err}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 font-semibold py-3 rounded-2xl"
              style={{ backgroundColor: T.pageBg, color: T.textSub, border: `1px solid ${T.cardBorder}` }}>Cancelar</button>
            <button type="submit" className="flex-1 text-white font-semibold py-3 rounded-2xl" style={{ background: T.heroGrad }}>Guardar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { categories, getSpent, currentMonth, getCurrentBalance, setManualBalance, incomes, recurringExpenses, expenses } = useApp()
  const { T } = useTheme()
  const navigate = useNavigate()
  const [modal, setModal] = useState(false)

  const today = new Date()
  const todayDay = today.getDate()
  const label = new Date(currentMonth + '-02').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  const totalLimit = categories.reduce((s, c) => s + Number(c.limit), 0)
  const totalSpent = categories.reduce((s, c) => s + getSpent(c.id), 0)
  const totalRemaining = totalLimit - totalSpent
  const globalPct = totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0
  const currentBalance = getCurrentBalance()
  const monthIncomes = incomes.filter(i => i.month === currentMonth).reduce((s, i) => s + Number(i.amount), 0)

  const alerts = categories.filter(cat => {
    const threshold = cat.alertThreshold ?? 80
    const pct = cat.limit > 0 ? (getSpent(cat.id) / cat.limit) * 100 : 0
    return pct >= threshold
  }).map(cat => {
    const spent = getSpent(cat.id)
    const pct = cat.limit > 0 ? (spent / cat.limit) * 100 : 0
    return { ...cat, spent, pct }
  })

  const upcoming = recurringExpenses.filter(rec => {
    if (!rec.active) return false
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    const effectiveDay = Math.min(rec.dayOfMonth, daysInMonth)
    const applied = expenses.some(e => e.recurringId === rec.id && e.month === currentMonth)
    if (applied) return false
    return effectiveDay >= todayDay && effectiveDay <= todayDay + 7
  }).map(rec => {
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    const effectiveDay = Math.min(rec.dayOfMonth, daysInMonth)
    return { ...rec, daysLeft: effectiveDay - todayDay, effectiveDay }
  }).sort((a, b) => a.daysLeft - b.daysLeft)

  return (
    <div style={{ backgroundColor: T.pageBg, minHeight: '100vh' }}>
      <div className="px-5 pt-10 pb-5" style={{ background: T.heroGrad }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1 capitalize" style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</p>
        <h1 className="text-2xl font-bold text-white">Resumen del mes</h1>
      </div>

      <div className="px-4 mt-4 mb-4">
        <div className="rounded-3xl p-5 shadow-xl" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBorder}` }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: T.textMuted }}>Saldo actual</p>
              {currentBalance !== null
                ? <p className="text-4xl font-bold" style={{ color: T.text }}>{currentBalance.toFixed(2)}€</p>
                : <p className="text-xl font-semibold" style={{ color: T.textFaint }}>Sin configurar</p>}
            </div>
            <button onClick={() => setModal(true)} className="flex-shrink-0 text-xs font-bold px-4 py-2 rounded-xl border-2"
              style={{ backgroundColor: T.pageBg, borderColor: T.cardBorder, color: T.textSub }}>
              Ajustar saldo
            </button>
          </div>
          <div className="flex gap-6">
            <div>
              <p className="text-xs mb-0.5" style={{ color: T.textMuted }}>Ingresos este mes</p>
              <p className="text-sm font-bold" style={{ color: T.textSub }}>+{monthIncomes.toFixed(2)}€</p>
            </div>
            <div>
              <p className="text-xs mb-0.5" style={{ color: T.textMuted }}>Gastos este mes</p>
              <p className="text-sm font-bold" style={{ color: T.text }}>-{totalSpent.toFixed(2)}€</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4 pb-6">
        {alerts.length > 0 && (
          <div className="rounded-3xl overflow-hidden shadow-sm"
            style={{ border: `1px solid ${alerts.some(a => a.pct >= 100) ? '#FECACA' : '#FDE68A'}` }}>
            <div className="px-4 py-3 flex items-center gap-2"
              style={{ backgroundColor: alerts.some(a => a.pct >= 100) ? '#FEF2F2' : '#FFFBEB' }}>
              <span className="text-lg">{alerts.some(a => a.pct >= 100) ? '🚨' : '🔔'}</span>
              <p className="text-sm font-bold" style={{ color: alerts.some(a => a.pct >= 100) ? '#DC2626' : '#B45309' }}>
                {alerts.filter(a => a.pct >= 100).length > 0
                  ? `${alerts.filter(a => a.pct >= 100).length} categoria${alerts.filter(a => a.pct >= 100).length > 1 ? 's' : ''} ha superado el limite`
                  : `${alerts.length} alerta${alerts.length > 1 ? 's' : ''} de presupuesto`}
              </p>
            </div>
            <div style={{ backgroundColor: alerts.some(a => a.pct >= 100) ? '#FFF5F5' : '#FEFCE8' }}>
              {alerts.map((cat, i) => {
                const exceeded = cat.pct >= 100
                return (
                  <div key={cat.id} className="px-4 py-2.5 flex items-center gap-3"
                    style={{ borderTop: i > 0 ? `1px solid ${exceeded ? '#FECACA' : '#FDE68A'}` : 'none' }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ backgroundColor: cat.color + '25' }}>
                      {cat.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: exceeded ? '#DC2626' : '#92400E' }}>{cat.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 rounded-full overflow-hidden" style={{ height: 4, backgroundColor: exceeded ? '#FECACA' : '#FDE68A' }}>
                          <div className="h-full rounded-full" style={{ width: `${Math.min(cat.pct, 100)}%`, backgroundColor: exceeded ? '#F87171' : '#FBBF24' }} />
                        </div>
                        <span className="text-xs font-bold flex-shrink-0" style={{ color: exceeded ? '#DC2626' : '#B45309' }}>{cat.pct.toFixed(0)}%</span>
                      </div>
                    </div>
                    <button onClick={() => navigate('/add')} className="text-xs font-semibold px-2 py-1 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: exceeded ? '#FECACA' : '#FDE68A', color: exceeded ? '#DC2626' : '#92400E' }}>Ver</button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {upcoming.length > 0 && (
          <div className="rounded-3xl overflow-hidden shadow-sm" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBorder}` }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.cardBorder}` }}>
              <div className="flex items-center gap-2">
                <span className="text-base">🔄</span>
                <p className="text-sm font-bold" style={{ color: T.text }}>Proximos cargos</p>
              </div>
              <button onClick={() => navigate('/add?tab=recurring')} className="text-xs font-semibold px-3 py-1 rounded-lg"
                style={{ backgroundColor: T.pageBg, color: T.textSub, border: `1px solid ${T.cardBorder}` }}>Ver todos</button>
            </div>
            {upcoming.map((rec, i) => {
              const cat = categories.find(c => c.id === rec.categoryId)
              return (
                <div key={rec.id} className="px-4 py-3 flex items-center gap-3"
                  style={{ borderTop: i > 0 ? `1px solid ${T.cardBorder}` : 'none' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: (cat?.color || '#5EB0C8') + '25' }}>
                    {cat?.emoji || '💳'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: T.text }}>{rec.description}</p>
                    <p className="text-xs" style={{ color: T.textMuted }}>{cat?.name || '-'} · {rec.amount.toFixed(2)}€</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold" style={{ color: rec.daysLeft === 0 ? '#F87171' : rec.daysLeft <= 2 ? '#FBBF24' : T.textSub }}>
                      {rec.daysLeft === 0 ? 'Hoy!' : rec.daysLeft === 1 ? 'Manana' : `En ${rec.daysLeft} dias`}
                    </p>
                    <p className="text-[10px]" style={{ color: T.textFaint }}>Dia {rec.effectiveDay}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="rounded-3xl p-5 shadow-sm" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBorder}` }}>
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: T.textMuted }}>Presupuesto mensual</p>
              <p className="text-3xl font-bold" style={{ color: T.text }}>
                {totalSpent.toFixed(2)}
                <span className="text-base font-normal ml-1" style={{ color: T.textMuted }}>/ {totalLimit.toFixed(0)}€</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs mb-1" style={{ color: T.textMuted }}>Disponible</p>
              <p className="text-xl font-bold" style={{ color: totalRemaining >= 0 ? T.textSub : '#F87171' }}>{totalRemaining.toFixed(2)}€</p>
            </div>
          </div>
          <div className="w-full rounded-full overflow-hidden mb-1" style={{ height: 10, backgroundColor: T.barTrack }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${globalPct}%`, backgroundColor: globalPct >= 90 ? '#F87171' : globalPct >= 70 ? '#FBBF24' : '#5EB0C8' }} />
          </div>
          <p className="text-xs" style={{ color: T.textFaint }}>{globalPct.toFixed(0)}% utilizado</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate('/add')} className="rounded-3xl p-4 text-left text-white shadow-sm" style={{ background: T.heroGrad }}>
            <span className="text-2xl block mb-2">💸</span>
            <span className="font-bold text-sm">Anadir gasto</span>
          </button>
          <button onClick={() => navigate('/add?type=income')} className="rounded-3xl p-4 text-left shadow-sm text-white" style={{ background: T.heroGradAlt }}>
            <span className="text-2xl block mb-2">💰</span>
            <span className="font-bold text-sm">Anadir ingreso</span>
          </button>
        </div>

        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: T.textMuted }}>Por categoria</p>

        {categories.length === 0 ? (
          <div className="text-center py-12 rounded-3xl shadow-sm" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBorder}` }}>
            <p className="text-4xl mb-3">🏷️</p>
            <p className="font-semibold mb-1" style={{ color: T.text }}>Sin categorias aun</p>
            <p className="text-sm mb-4" style={{ color: T.textMuted }}>Crea una para empezar a registrar gastos</p>
            <button onClick={() => navigate('/categories')} className="text-white px-5 py-2.5 rounded-2xl text-sm font-semibold" style={{ background: T.heroGrad }}>Crear categoria</button>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map(cat => {
              const spent = getSpent(cat.id)
              const remaining = cat.limit - spent
              const pct = cat.limit > 0 ? Math.min((spent / cat.limit) * 100, 100) : 0
              const threshold = cat.alertThreshold ?? 80
              const warn = pct >= threshold && pct < 100
              const danger = pct >= 100
              return (
                <div key={cat.id} className="rounded-2xl overflow-hidden shadow-sm"
                  style={{ backgroundColor: T.card, border: `1px solid ${danger ? '#FECACA' : warn ? '#FDE68A' : T.cardBorder}` }}>
                  <div className="h-1 w-full" style={{ backgroundColor: cat.color }} />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl" style={{ backgroundColor: cat.color + '20' }}>{cat.emoji}</div>
                        <div>
                          <p className="font-bold text-sm" style={{ color: T.text }}>{cat.name}</p>
                          <p className="text-xs" style={{ color: T.textMuted }}>{spent.toFixed(2)}€ de {cat.limit}€</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold" style={{ color: danger ? '#F87171' : warn ? '#FBBF24' : T.textSub }}>
                          {remaining >= 0 ? remaining.toFixed(2) : `-${Math.abs(remaining).toFixed(2)}`}€
                        </p>
                        <p className="text-[10px] uppercase tracking-wide" style={{ color: T.textFaint }}>
                          {danger && remaining < 0 ? 'excedido' : 'restante'}
                        </p>
                      </div>
                    </div>
                    <div className="relative w-full rounded-full overflow-hidden" style={{ height: 8, backgroundColor: T.barTrack }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: danger ? '#F87171' : warn ? '#FBBF24' : cat.color }} />
                      {threshold < 100 && (
                        <div className="absolute top-0 bottom-0 w-0.5 opacity-50" style={{ left: `${threshold}%`, backgroundColor: T.text }} />
                      )}
                    </div>
                    {danger && <p className="text-xs mt-1.5 font-medium" style={{ color: '#F87171' }}>Limite superado</p>}
                    {warn && <p className="text-xs mt-1.5 font-medium" style={{ color: '#FBBF24' }}>Alerta: {pct.toFixed(0)}% del limite ({threshold}%)</p>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {modal && <BalanceModal currentBalance={currentBalance} onClose={() => setModal(false)} onSave={setManualBalance} />}
    </div>
  )
}
