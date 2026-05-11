import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const MO = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

const last6 = () => {
  const out = []; const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    out.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`)
  }
  return out
}

const yearMonths = () => {
  const now = new Date()
  const year = now.getFullYear()
  const cur = now.getMonth()
  const out = []
  for (let m = 0; m <= cur; m++) {
    out.push(`${year}-${String(m+1).padStart(2,'0')}`)
  }
  return out
}

const fmt = ym => { const [y,m] = ym.split('-'); return `${MO[+m-1]} ${y.slice(2)}` }

export default function Statistics() {
  const { categories, expenses, incomes, currentMonth } = useApp()
  const { T } = useTheme()
  const [month, setMonth] = useState(currentMonth)
  const [view, setView] = useState('mensual')
  const months = last6()
  const annualMonths = yearMonths()
  const currentYear = new Date().getFullYear()

  const Tip = ({ active, payload }) => active && payload?.length ? (
    <div className="rounded-xl px-3 py-2 shadow-lg" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBorder}` }}>
      <p className="text-xs font-bold" style={{ color: T.text }}>{payload[0].name}</p>
      <p className="text-xs" style={{ color: T.textMuted }}>{Number(payload[0].value).toFixed(2)}€</p>
    </div>
  ) : null

  const TipMulti = ({ active, payload, label }) => active && payload?.length ? (
    <div className="rounded-xl px-3 py-2 shadow-lg" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBorder}` }}>
      <p className="text-xs font-bold mb-1" style={{ color: T.text }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs" style={{ color: p.fill }}>{p.name}: {Number(p.value).toFixed(2)}€</p>
      ))}
    </div>
  ) : null

  const pieData = categories.map(cat => ({
    name: cat.name, emoji: cat.emoji, color: cat.color,
    value: expenses.filter(e => e.categoryId === cat.id && e.month === month).reduce((s,e) => s+Number(e.amount), 0)
  })).filter(d => d.value > 0)

  const totalSpent = pieData.reduce((s,d) => s+d.value, 0)
  const totalIncomes = incomes.filter(i => i.month === month).reduce((s,i) => s+Number(i.amount), 0)
  const balance = totalIncomes - totalSpent

  const barData = months.map(m => ({
    month: fmt(m),
    Ingresos: incomes.filter(i => i.month === m).reduce((s,i) => s+Number(i.amount), 0),
    Gastos: expenses.filter(e => e.month === m).reduce((s,e) => s+Number(e.amount), 0),
  }))

  const exps = expenses.filter(e => e.month === month)
  const avg = exps.length ? exps.reduce((s,e) => s+Number(e.amount),0) / exps.length : 0
  const max = exps.length ? Math.max(...exps.map(e => Number(e.amount))) : 0

  const prev3 = months.filter(m => m < month).slice(-3)
  const comparison = categories.map(cat => {
    const thisMonthSpent = expenses.filter(e => e.categoryId === cat.id && e.month === month).reduce((s,e) => s+Number(e.amount), 0)
    const avgPrev = prev3.length > 0
      ? prev3.map(m => expenses.filter(e => e.categoryId === cat.id && e.month === m).reduce((s,e) => s+Number(e.amount), 0)).reduce((s,v) => s+v, 0) / prev3.length
      : 0
    const diff = thisMonthSpent - avgPrev
    const diffPct = avgPrev > 0 ? (diff / avgPrev) * 100 : null
    return { ...cat, thisMonthSpent, avgPrev, diff, diffPct }
  }).filter(c => c.thisMonthSpent > 0 || c.avgPrev > 0)

  const annualBarData = annualMonths.map(m => ({
    month: MO[+m.split('-')[1]-1],
    Ingresos: incomes.filter(i => i.month === m).reduce((s,i) => s+Number(i.amount), 0),
    Gastos: expenses.filter(e => e.month === m).reduce((s,e) => s+Number(e.amount), 0),
  }))

  const annualTotalGastos = annualBarData.reduce((s,d) => s+d.Gastos, 0)
  const annualTotalIngresos = annualBarData.reduce((s,d) => s+d.Ingresos, 0)
  const annualBalance = annualTotalIngresos - annualTotalGastos
  const monthsWithData = annualBarData.filter(d => d.Gastos > 0)
  const bestMonth = monthsWithData.length > 0 ? monthsWithData.reduce((b,d) => d.Gastos < b.Gastos ? d : b) : null
  const worstMonth = monthsWithData.length > 0 ? monthsWithData.reduce((w,d) => d.Gastos > w.Gastos ? d : w) : null

  const annualByCat = categories.map(cat => ({
    ...cat,
    total: expenses.filter(e => e.categoryId === cat.id && annualMonths.includes(e.month)).reduce((s,e) => s+Number(e.amount), 0)
  })).filter(c => c.total > 0).sort((a,b) => b.total - a.total)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: T.pageBg }}>
      <div className="px-5 pt-10 pb-5" style={{ background: T.heroGrad }}>
        <h1 className="text-2xl font-bold text-white">Estadisticas</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Analiza tus patrones de gasto</p>
      </div>

      <div className="px-4 -mt-3 pb-6 space-y-4">
        <div className="flex rounded-2xl p-1 mt-3 shadow-sm" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBorder}` }}>
          {[['mensual','Mensual'],['anual','Anual']].map(([v,l]) => (
            <button key={v} onClick={() => setView(v)} className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ backgroundColor: view === v ? T.text : 'transparent', color: view === v ? T.pageBg : T.textMuted }}>
              {l}
            </button>
          ))}
        </div>

        {view === 'mensual' && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {months.map(m => (
                <button key={m} onClick={() => setMonth(m)} className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={{ backgroundColor: month === m ? T.text : T.card, color: month === m ? T.pageBg : T.textSub, border: `1px solid ${month === m ? T.text : T.cardBorder}` }}>
                  {fmt(m)}
                </button>
              ))}
            </div>

            <div className="rounded-3xl p-5 shadow-sm" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBorder}` }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: T.textMuted }}>Balance - {fmt(month)}</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Ingresos', value: `+${totalIncomes.toFixed(2)}€`, bg: '#ECFDF5', col: '#065F46' },
                  { label: 'Gastos', value: `-${totalSpent.toFixed(2)}€`, bg: '#FEF2F2', col: '#DC2626' },
                  { label: 'Balance', value: `${balance>=0?'+':''}${balance.toFixed(2)}€`, bg: balance>=0?'#ECFDF5':'#FFF7ED', col: balance>=0?'#065F46':'#EA580C' },
                ].map(item => (
                  <div key={item.label} className="rounded-2xl p-3 text-center" style={{ backgroundColor: item.bg }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: item.col }}>{item.label}</p>
                    <p className="text-base font-bold" style={{ color: item.col }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Movimientos', val: exps.length, suf: '' },
                { label: 'Media gasto', val: avg.toFixed(0), suf: '€' },
                { label: 'Mayor gasto', val: max.toFixed(0), suf: '€' },
              ].map(({ label, val, suf }) => (
                <div key={label} className="rounded-2xl p-3 text-center shadow-sm" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBorder}` }}>
                  <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: T.textMuted }}>{label}</p>
                  <p className="text-xl font-bold" style={{ color: T.text }}>{val}{suf}</p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl p-5 shadow-sm" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBorder}` }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: T.textMuted }}>Distribucion de gastos</p>
              {pieData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-4xl mb-2">🔮</p>
                  <p className="text-sm" style={{ color: T.textFaint }}>Sin gastos este mes</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={190}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={4} dataKey="value">
                        {pieData.map((e,i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip content={<Tip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {pieData.map((d,i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                          <span className="text-sm" style={{ color: T.text }}>{d.emoji} {d.name}</span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: T.textSub }}>
                          {d.value.toFixed(2)}€ <span className="font-normal text-xs" style={{ color: T.textFaint }}>({totalSpent > 0 ? ((d.value/totalSpent)*100).toFixed(0) : 0}%)</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {comparison.length > 0 && (
              <div className="rounded-3xl p-5 shadow-sm" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBorder}` }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: T.textMuted }}>Comparativa mensual</p>
                <p className="text-xs mb-4" style={{ color: T.textFaint }}>
                  {fmt(month)} vs media de {prev3.length > 0 ? `${prev3.length} mes${prev3.length > 1 ? 'es' : ''} anterior${prev3.length > 1 ? 'es' : ''}` : 'meses anteriores'}
                </p>
                {prev3.length === 0 ? (
                  <p className="text-sm text-center py-4" style={{ color: T.textFaint }}>Sin datos previos para comparar</p>
                ) : (
                  <div className="space-y-4">
                    {comparison.map(cat => {
                      const up = cat.diff > 0
                      return (
                        <div key={cat.id}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-base">{cat.emoji}</span>
                            <span className="text-sm font-semibold flex-1" style={{ color: T.text }}>{cat.name}</span>
                            {cat.diffPct !== null && cat.diff !== 0 && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                                style={{ backgroundColor: up ? '#FEF2F2' : '#ECFDF5', color: up ? '#DC2626' : '#065F46' }}>
                                {up ? '+' : ''}{cat.diffPct.toFixed(0)}%
                              </span>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] w-16 flex-shrink-0" style={{ color: T.textFaint }}>Este mes</span>
                              <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, backgroundColor: T.barTrack }}>
                                <div className="h-full rounded-full" style={{ width: `${cat.limit > 0 ? Math.min((cat.thisMonthSpent/cat.limit)*100, 100) : 0}%`, backgroundColor: cat.color }} />
                              </div>
                              <span className="text-xs font-bold w-14 text-right flex-shrink-0" style={{ color: T.text }}>{cat.thisMonthSpent.toFixed(0)}€</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] w-16 flex-shrink-0" style={{ color: T.textFaint }}>Media</span>
                              <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, backgroundColor: T.barTrack }}>
                                <div className="h-full rounded-full opacity-50" style={{ width: `${cat.limit > 0 ? Math.min((cat.avgPrev/cat.limit)*100, 100) : 0}%`, backgroundColor: cat.color }} />
                              </div>
                              <span className="text-xs w-14 text-right flex-shrink-0" style={{ color: T.textMuted }}>{cat.avgPrev.toFixed(0)}€</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="rounded-3xl p-5 shadow-sm" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBorder}` }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: T.textMuted }}>Ingresos vs Gastos</p>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={barData} margin={{ top:0, right:0, left:-22, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.barTrack} />
                  <XAxis dataKey="month" tick={{ fontSize:11, fill: T.textFaint }} />
                  <YAxis tick={{ fontSize:11, fill: T.textFaint }} />
                  <Tooltip content={<TipMulti />} />
                  <Bar dataKey="Ingresos" fill="#2A7387" radius={[4,4,0,0]} />
                  <Bar dataKey="Gastos" fill="#5EB0C8" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-3">
                {[['Ingresos','#2A7387'],['Gastos','#5EB0C8']].map(([l,col]) => (
                  <div key={l} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: col }} />
                    <span className="text-xs font-medium" style={{ color: T.textMuted }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl p-5 shadow-sm" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBorder}` }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: T.textMuted }}>Presupuesto vs Gasto</p>
              {categories.length === 0
                ? <p className="text-sm text-center py-4" style={{ color: T.textFaint }}>Sin categorias</p>
                : <div className="space-y-4">
                    {categories.map(cat => {
                      const sp = expenses.filter(e => e.categoryId === cat.id && e.month === month).reduce((s,e) => s+Number(e.amount), 0)
                      const pct = cat.limit > 0 ? Math.min((sp/cat.limit)*100, 100) : 0
                      return (
                        <div key={cat.id}>
                          <div className="flex justify-between mb-1.5">
                            <span className="text-sm font-semibold" style={{ color: T.text }}>{cat.emoji} {cat.name}</span>
                            <span className="text-xs" style={{ color: T.textMuted }}>{sp.toFixed(2)} / {cat.limit}€</span>
                          </div>
                          <div className="w-full rounded-full overflow-hidden" style={{ height:8, backgroundColor: T.barTrack }}>
                            <div className="h-full rounded-full transition-all"
                              style={{ width:`${pct}%`, backgroundColor: pct>=100?'#F87171':pct>=(cat.alertThreshold??80)?'#FBBF24':cat.color }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
              }
            </div>
          </>
        )}

        {view === 'anual' && (
          <>
            <div className="rounded-3xl p-5 shadow-sm" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBorder}` }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: T.textMuted }}>Resumen anual</p>
              <p className="text-3xl font-bold mb-4" style={{ color: T.text }}>{currentYear}</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Ingresos', value: `+${annualTotalIngresos.toFixed(0)}€`, bg: '#ECFDF5', col: '#065F46' },
                  { label: 'Gastos', value: `${annualTotalGastos.toFixed(0)}€`, bg: '#FEF2F2', col: '#DC2626' },
                  { label: 'Balance', value: `${annualBalance>=0?'+':''}${annualBalance.toFixed(0)}€`, bg: annualBalance>=0?'#ECFDF5':'#FFF7ED', col: annualBalance>=0?'#065F46':'#EA580C' },
                ].map(item => (
                  <div key={item.label} className="rounded-2xl p-3 text-center" style={{ backgroundColor: item.bg }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: item.col }}>{item.label}</p>
                    <p className="text-sm font-bold" style={{ color: item.col }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {(bestMonth || worstMonth) && (
              <div className="grid grid-cols-2 gap-3">
                {bestMonth && (
                  <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: '#ECFDF5', border: '1px solid #BBF7D0' }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: '#065F46' }}>Mejor mes</p>
                    <p className="text-base font-bold" style={{ color: '#065F46' }}>{bestMonth.month}</p>
                    <p className="text-xs" style={{ color: '#059669' }}>{bestMonth.Gastos.toFixed(0)}€ gastado</p>
                  </div>
                )}
                {worstMonth && (
                  <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: '#DC2626' }}>Mes mas caro</p>
                    <p className="text-base font-bold" style={{ color: '#DC2626' }}>{worstMonth.month}</p>
                    <p className="text-xs" style={{ color: '#EF4444' }}>{worstMonth.Gastos.toFixed(0)}€ gastado</p>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-3xl p-5 shadow-sm" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBorder}` }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: T.textMuted }}>Ingresos vs Gastos - {currentYear}</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={annualBarData} margin={{ top:0, right:0, left:-22, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.barTrack} />
                  <XAxis dataKey="month" tick={{ fontSize:10, fill: T.textFaint }} />
                  <YAxis tick={{ fontSize:10, fill: T.textFaint }} />
                  <Tooltip content={<TipMulti />} />
                  <Bar dataKey="Ingresos" fill="#2A7387" radius={[3,3,0,0]} />
                  <Bar dataKey="Gastos" fill="#5EB0C8" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-3">
                {[['Ingresos','#2A7387'],['Gastos','#5EB0C8']].map(([l,col]) => (
                  <div key={l} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: col }} />
                    <span className="text-xs font-medium" style={{ color: T.textMuted }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {annualByCat.length > 0 && (
              <div className="rounded-3xl p-5 shadow-sm" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBorder}` }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: T.textMuted }}>Gasto por categoria - {currentYear}</p>
                <div className="space-y-4">
                  {annualByCat.map((cat, i) => {
                    const pct = annualTotalGastos > 0 ? (cat.total / annualTotalGastos) * 100 : 0
                    return (
                      <div key={cat.id}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-bold w-4 text-center flex-shrink-0" style={{ color: i === 0 ? '#F59E0B' : T.textFaint }}>{i+1}</span>
                          <span className="text-base">{cat.emoji}</span>
                          <span className="text-sm font-semibold flex-1" style={{ color: T.text }}>{cat.name}</span>
                          <span className="text-sm font-bold flex-shrink-0" style={{ color: T.textSub }}>{cat.total.toFixed(0)}€</span>
                          <span className="text-xs flex-shrink-0 w-9 text-right" style={{ color: T.textFaint }}>{pct.toFixed(0)}%</span>
                        </div>
                        <div className="ml-10 rounded-full overflow-hidden" style={{ height: 6, backgroundColor: T.barTrack }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="rounded-3xl p-5 shadow-sm" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBorder}` }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: T.textMuted }}>Desglose mensual</p>
              <div className="space-y-2">
                {[...annualMonths].reverse().map(m => {
                  const g = expenses.filter(e => e.month === m).reduce((s,e) => s+Number(e.amount), 0)
                  const inc = incomes.filter(i => i.month === m).reduce((s,i) => s+Number(i.amount), 0)
                  const b = inc - g
                  const isCurrent = m === currentMonth
                  return (
                    <div key={m} className="flex items-center gap-3 py-2 rounded-xl px-2"
                      style={{ backgroundColor: isCurrent ? T.cardBorder : 'transparent' }}>
                      <div className="w-8 flex-shrink-0">
                        <p className="text-xs font-bold" style={{ color: T.textSub }}>{fmt(m).split(' ')[0]}</p>
                        {isCurrent && <p className="text-[9px]" style={{ color: T.textFaint }}>Actual</p>}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-0.5">
                          <span style={{ color: '#22C55E' }}>+{inc.toFixed(0)}€</span>
                          <span style={{ color: '#F87171' }}>-{g.toFixed(0)}€</span>
                        </div>
                        <div className="w-full rounded-full overflow-hidden" style={{ height: 4, backgroundColor: T.barTrack }}>
                          <div className="h-full rounded-full" style={{ width: `${annualTotalGastos > 0 ? Math.min((g/annualTotalGastos)*100, 100) : 0}%`, backgroundColor: '#5EB0C8' }} />
                        </div>
                      </div>
                      <span className="text-xs font-bold w-16 text-right flex-shrink-0" style={{ color: b >= 0 ? '#22C55E' : '#F87171' }}>
                        {b >= 0 ? '+' : ''}{b.toFixed(0)}€
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
