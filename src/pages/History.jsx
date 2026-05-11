import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'

const MO = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const last12 = () => {
  const out = []; const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    out.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`)
  }
  return out
}

const fmtDate = s => new Date(s + 'T12:00:00').toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' })
const fmtChip = m => { const [y,mo]=m.split('-'); return `${MO[+mo-1].slice(0,3)} ${y.slice(2)}` }

export default function History() {
  const { categories, expenses, incomes, deleteExpense, deleteIncome, currentMonth } = useApp()
  const { T } = useTheme()
  const [selMonth, setSelMonth] = useState(currentMonth)
  const [selCat,   setSelCat]   = useState('all')
  const [view,     setView]     = useState('all')
  const [del,      setDel]      = useState(null)

  const months = last12()

  const items = [
    ...expenses.map(e => ({ ...e, kind:'gasto' })),
    ...incomes.map(i  => ({ ...i, kind:'ingreso' })),
  ].sort((a,b) => b.date.localeCompare(a.date))

  const filtered = items.filter(x =>
    x.month === selMonth &&
    (view === 'all' || (view==='gastos' && x.kind==='gasto') || (view==='ingresos' && x.kind==='ingreso')) &&
    (view === 'ingresos' || selCat === 'all' || x.categoryId === selCat)
  )

  const sumGastos   = filtered.filter(x=>x.kind==='gasto').reduce((s,x)=>s+Number(x.amount),0)
  const sumIngresos = filtered.filter(x=>x.kind==='ingreso').reduce((s,x)=>s+Number(x.amount),0)
  const bal         = sumIngresos - sumGastos

  const getCat = id => categories.find(c=>c.id===id)

  const confirm = () => {
    if (!del) return
    del.type === 'gasto' ? deleteExpense(del.id) : deleteIncome(del.id)
    setDel(null)
  }

  return (
    <div style={{ minHeight:'100vh', backgroundColor: T.pageBg }}>
      {/* header */}
      <div className="px-5 pt-10 pb-6" style={{ background: T.heroGrad }}>
        <h1 className="text-2xl font-bold text-white">Historial</h1>
        <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.7)' }}>Todos tus movimientos registrados</p>
      </div>

      <div className="px-4 -mt-3 pb-6 space-y-3">
        {/* Mes */}
        <div className="pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Mes</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {months.map(m => (
              <button key={m} onClick={() => setSelMonth(m)}
                className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition"
                style={{
                  backgroundColor: selMonth===m ? T.textSub : T.card,
                  color: selMonth===m ? 'white' : T.textSub,
                  border: `1px solid ${selMonth===m ? T.textSub : T.cardBorder}`
                }}>
                {fmtChip(m)}
              </button>
            ))}
          </div>
        </div>

        {/* Vista toggle */}
        <div className="flex rounded-2xl p-1" style={{ backgroundColor: T.card, border:`1px solid ${T.cardBorder}` }}>
          {[['all','Todo'],['gastos','💸 Gastos'],['ingresos','🌿 Ingresos']].map(([v,l]) => (
            <button key={v} onClick={() => setView(v)}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition"
              style={{
                backgroundColor: view===v ? T.text : 'transparent',
                color: view===v ? T.pageBg : T.textMuted
              }}>
              {l}
            </button>
          ))}
        </div>

        {/* Filtro categoría */}
        {view !== 'ingresos' && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => setSelCat('all')}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition"
              style={{
                backgroundColor: selCat==='all' ? T.textSub : T.card,
                color: selCat==='all' ? 'white' : T.textSub,
                border: `1px solid ${selCat==='all' ? T.textSub : T.cardBorder}`
              }}>
              Todas
            </button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setSelCat(cat.id)}
                className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition"
                style={{
                  backgroundColor: selCat===cat.id ? cat.color : T.card,
                  color: selCat===cat.id ? 'white' : T.textSub,
                  border: `1px solid ${selCat===cat.id ? cat.color : T.cardBorder}`
                }}>
                {cat.emoji} {cat.name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}

        {/* Resumen */}
        {filtered.length > 0 && (
          <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: T.card, border:`1px solid ${T.cardBorder}` }}>
            <div className="flex justify-around">
              {[
                { label:'Gastos',   val:`-${sumGastos.toFixed(2)}€`,   col:'#DC2626' },
                { label:'Ingresos', val:`+${sumIngresos.toFixed(2)}€`, col: T.textSub },
                { label:'Balance',  val:`${bal>=0?'+':''}${bal.toFixed(2)}€`, col: bal>=0 ? T.text : '#DC2626' },
              ].map(({ label, val, col }) => (
                <div key={label} className="text-center">
                  <p className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: T.textFaint }}>{label}</p>
                  <p className="text-sm font-bold" style={{ color: col }}>{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista */}
        {filtered.length === 0 ? (
          <div className="text-center py-14 rounded-3xl shadow-sm" style={{ backgroundColor: T.card, border:`1px solid ${T.cardBorder}` }}>
            <p className="text-4xl mb-3">🌊</p>
            <p className="font-semibold" style={{ color: T.text }}>Sin movimientos</p>
            <p className="text-sm mt-1" style={{ color: T.textMuted }}>No hay registros para este periodo</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(item => {
              const isGasto = item.kind === 'gasto'
              const cat     = isGasto ? getCat(item.categoryId) : null
              const emoji   = isGasto ? (cat?.emoji||'💸') : (item.emoji||'🪙')
              const color   = isGasto ? (cat?.color||T.textMuted) : T.textSub
              const title   = item.description || (isGasto ? cat?.name : item.label) || (isGasto?'Gasto':'Ingreso')

              return (
                <div key={`${item.kind}-${item.id}`}
                  className="rounded-2xl overflow-hidden shadow-sm"
                  style={{ backgroundColor: T.card, border:`1px solid ${T.cardBorder}` }}>
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ backgroundColor: color + '20' }}>
                      {emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate" style={{ color: T.text }}>{title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {isGasto && cat && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: color+'20', color }}>
                            {cat.name}
                          </span>
                        )}
                        {!isGasto && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: T.pageBg, color: T.textSub }}>
                            Ingreso
                          </span>
                        )}
                        <span className="text-[10px]" style={{ color: T.textFaint }}>{fmtDate(item.date)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <p className="font-bold text-sm" style={{ color: isGasto ? T.text : T.textSub }}>
                        {isGasto ? '-' : '+'}{Number(item.amount).toFixed(2)}€
                      </p>
                      <button onClick={() => setDel({ id: item.id, type: item.kind })}
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                        style={{ backgroundColor: '#FEF2F2', color: '#F87171', border: '1px solid #FECACA' }}>
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal eliminar */}
      {del && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4"
          style={{ backgroundColor:'rgba(7,30,42,0.7)', backdropFilter:'blur(4px)' }}>
          <div className="w-full max-w-sm rounded-3xl p-6 shadow-2xl" style={{ backgroundColor: T.card }}>
            <p className="font-bold text-lg mb-1" style={{ color: T.text }}>¿Eliminar {del.type}?</p>
            <p className="text-sm mb-5" style={{ color: T.textMuted }}>Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setDel(null)}
                className="flex-1 font-semibold py-3 rounded-2xl"
                style={{ backgroundColor: T.pageBg, color: T.textSub, border:`1px solid ${T.cardBorder}` }}>
                Cancelar
              </button>
              <button onClick={confirm}
                className="flex-1 font-semibold py-3 rounded-2xl text-white" style={{ backgroundColor: '#F87171' }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
