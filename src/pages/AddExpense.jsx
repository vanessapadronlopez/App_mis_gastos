import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate, useSearchParams } from 'react-router-dom'

function GastoForm({ categories, addExpense, getSpent }) {
  const { T } = useTheme()
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({ categoryId: categories[0]?.id || '', amount: '', description: '', date: today })
  const [ok, setOk] = useState(false)
  const [err, setErr] = useState('')
  const navigate = useNavigate()
  const inp = { backgroundColor: T.inputBg, borderColor: T.inputBorder, color: T.text }
  const selCat = categories.find(c => c.id === form.categoryId)
  const spent = selCat ? getSpent(selCat.id, form.date.slice(0, 7)) : 0
  const avail = selCat ? selCat.limit - spent : 0
  const set = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setErr('') }
  const submit = e => {
    e.preventDefault()
    if (!form.categoryId) return setErr('Selecciona una categoria')
    if (!form.amount || Number(form.amount) <= 0) return setErr('Introduce un importe valido')
    addExpense({ categoryId: form.categoryId, amount: Number(form.amount), description: form.description.trim(), date: form.date })
    setOk(true)
    setTimeout(() => { setOk(false); setForm({ categoryId: categories[0]?.id || '', amount: '', description: '', date: today }) }, 1500)
  }
  if (!categories.length) return (
    <div className="text-center py-12 rounded-3xl shadow-sm" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBorder}` }}>
      <p className="text-4xl mb-3">🏷️</p>
      <p className="font-semibold mb-1" style={{ color: T.text }}>Necesitas una categoria primero</p>
      <p className="text-sm mb-4" style={{ color: T.textMuted }}>Crea al menos una antes de registrar gastos</p>
      <button onClick={() => navigate('/categories')} className="text-white px-5 py-2.5 rounded-2xl text-sm font-semibold" style={{ background: T.heroGrad }}>Crear categoria</button>
    </div>
  )
  return (
    <>
      {ok && <div className="rounded-2xl p-4 mb-4 text-sm font-semibold" style={{ backgroundColor: '#ECFDF5', color: '#065F46' }}>Gasto guardado!</div>}
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Categoria</label>
          <div className="space-y-2">
            {categories.map(cat => {
              const s = getSpent(cat.id)
              const sel = form.categoryId === cat.id
              return (
                <button key={cat.id} type="button" onClick={() => setForm(p => ({ ...p, categoryId: cat.id }))}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left"
                  style={{ borderColor: sel ? cat.color : T.inputBorder, backgroundColor: sel ? cat.color + '15' : T.inputBg }}>
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: cat.color + '25' }}>{cat.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm" style={{ color: T.text }}>{cat.name}</p>
                    <p className="text-xs" style={{ color: T.textMuted }}>{s.toFixed(2)}€ usado · {(cat.limit - s).toFixed(2)}€ libre</p>
                  </div>
                  {sel && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />}
                </button>
              )
            })}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Importe (€)</label>
          {selCat && <p className="text-xs mb-2" style={{ color: T.textMuted }}>Disponible: <strong style={{ color: avail >= 0 ? T.textSub : '#F87171' }}>{avail.toFixed(2)}€</strong></p>}
          <input type="number" name="amount" value={form.amount} onChange={set} placeholder="0.00" step="0.01" min="0.01"
            className="w-full rounded-2xl px-4 py-3 text-2xl font-bold border-2 focus:outline-none transition" style={inp} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Descripcion</label>
          <input type="text" name="description" value={form.description} onChange={set} placeholder="En que lo gastaste?" maxLength={60}
            className="w-full rounded-2xl px-4 py-3 border-2 focus:outline-none transition" style={inp} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Fecha</label>
          <input type="date" name="date" value={form.date} onChange={set} className="w-full rounded-2xl px-4 py-3 border-2 focus:outline-none transition" style={inp} />
        </div>
        {err && <p className="text-sm font-medium px-3 py-2 rounded-xl" style={{ color:'#F87171', backgroundColor:'#FEF2F2' }}>Error: {err}</p>}
        <button type="submit" className="w-full text-white font-bold py-4 rounded-2xl text-base transition shadow-sm" style={{ background: T.heroGrad }}>Guardar gasto</button>
      </form>
    </>
  )
}

const INCOME_TYPES = [
  { id: 'salario', emoji: '💼', label: 'Salario' },
  { id: 'freelance', emoji: '🖥️', label: 'Freelance' },
  { id: 'regalo', emoji: '🎀', label: 'Regalo' },
  { id: 'venta', emoji: '🛍️', label: 'Venta' },
  { id: 'otro', emoji: '🪙', label: 'Otro' },
]

function IngresoForm({ addIncome }) {
  const { T } = useTheme()
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({ type: 'salario', amount: '', description: '', date: today })
  const [ok, setOk] = useState(false)
  const [err, setErr] = useState('')
  const inp = { backgroundColor: T.inputBg, borderColor: T.inputBorder, color: T.text }
  const set = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setErr('') }
  const submit = e => {
    e.preventDefault()
    if (!form.amount || Number(form.amount) <= 0) return setErr('Introduce un importe valido')
    const t = INCOME_TYPES.find(x => x.id === form.type)
    addIncome({ type: form.type, emoji: t?.emoji || '🪙', label: t?.label || 'Ingreso', amount: Number(form.amount), description: form.description.trim(), date: form.date })
    setOk(true)
    setTimeout(() => { setOk(false); setForm({ type: 'salario', amount: '', description: '', date: today }) }, 1500)
  }
  return (
    <>
      {ok && <div className="rounded-2xl p-4 mb-4 text-sm font-semibold" style={{ backgroundColor: '#ECFDF5', color: '#065F46' }}>Ingreso guardado!</div>}
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Tipo de ingreso</label>
          <div className="grid grid-cols-5 gap-2">
            {INCOME_TYPES.map(t => (
              <button key={t.id} type="button" onClick={() => setForm(p => ({ ...p, type: t.id }))}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl border-2 transition-all"
                style={{ borderColor: form.type === t.id ? T.textSub : T.inputBorder, backgroundColor: form.type === t.id ? T.cardBorder : T.inputBg }}>
                <span className="text-2xl">{t.emoji}</span>
                <span className="text-[10px] font-semibold text-center leading-tight" style={{ color: T.text }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Importe (€)</label>
          <input type="number" name="amount" value={form.amount} onChange={set} placeholder="0.00" step="0.01" min="0.01"
            className="w-full rounded-2xl px-4 py-3 text-2xl font-bold border-2 focus:outline-none transition" style={inp} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Descripcion</label>
          <input type="text" name="description" value={form.description} onChange={set} placeholder="Nomina mayo, Proyecto web..." maxLength={60}
            className="w-full rounded-2xl px-4 py-3 border-2 focus:outline-none transition" style={inp} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Fecha</label>
          <input type="date" name="date" value={form.date} onChange={set} className="w-full rounded-2xl px-4 py-3 border-2 focus:outline-none transition" style={inp} />
        </div>
        {err && <p className="text-sm font-medium px-3 py-2 rounded-xl" style={{ color:'#F87171', backgroundColor:'#FEF2F2' }}>Error: {err}</p>}
        <button type="submit" className="w-full font-bold py-4 rounded-2xl text-base transition shadow-sm text-white" style={{ background: T.heroGrad }}>Guardar ingreso</button>
      </form>
    </>
  )
}

function RecurrenteTab({ categories }) {
  const { T } = useTheme()
  const { recurringExpenses, addRecurring, updateRecurring, deleteRecurring, toggleRecurring, isRecurringApplied, currentMonth } = useApp()
  const navigate = useNavigate()
  const emptyForm = { categoryId: categories[0]?.id || '', description: '', amount: '', dayOfMonth: '1', frequency: 'monthly', frequencyMonths: '3' }
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [err, setErr] = useState('')
  const [ok, setOk] = useState(false)
  const inp = { backgroundColor: T.inputBg, borderColor: T.inputBorder, color: T.text }
  const set = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setErr('') }
  const resetForm = () => { setForm(emptyForm); setEditId(null); setShowForm(false); setErr('') }

  const freqLabel = rec => {
    if (rec.frequency === 'annual') return 'Anual'
    if (rec.frequency === 'every_n') return `Cada ${rec.frequencyMonths} meses`
    return 'Mensual'
  }

  const isDueThisMonth = rec => {
    const freq = rec.frequency || 'monthly'
    if (freq === 'monthly') return true
    const start = rec.startMonth || currentMonth
    const [sy, sm] = start.split('-').map(Number)
    const [ty, tm] = currentMonth.split('-').map(Number)
    const diff = (ty - sy) * 12 + (tm - sm)
    if (freq === 'annual') return diff % 12 === 0
    if (freq === 'every_n') return diff % (Number(rec.frequencyMonths) || 1) === 0
    return true
  }

  const submit = e => {
    e.preventDefault()
    if (!form.categoryId) return setErr('Selecciona una categoria')
    if (!form.amount || Number(form.amount) <= 0) return setErr('Introduce un importe valido')
    const day = Number(form.dayOfMonth)
    if (!day || day < 1 || day > 31) return setErr('El dia debe estar entre 1 y 31')
    if (form.frequency === 'every_n') {
      const n = Number(form.frequencyMonths)
      if (!n || n < 2 || n > 24) return setErr('Los meses deben estar entre 2 y 24')
    }
    const data = {
      categoryId: form.categoryId,
      description: form.description.trim() || 'Gasto recurrente',
      amount: Number(form.amount),
      dayOfMonth: day,
      frequency: form.frequency,
      frequencyMonths: form.frequency === 'every_n' ? Number(form.frequencyMonths) : undefined,
      startMonth: currentMonth,
    }
    editId ? updateRecurring(editId, data) : addRecurring(data)
    setOk(true)
    setTimeout(() => { setOk(false); resetForm() }, 1200)
  }
  const startEdit = rec => {
    setForm({
      categoryId: rec.categoryId,
      description: rec.description,
      amount: String(rec.amount),
      dayOfMonth: String(rec.dayOfMonth),
      frequency: rec.frequency || 'monthly',
      frequencyMonths: String(rec.frequencyMonths || '3'),
    })
    setEditId(rec.id)
    setShowForm(true)
  }
  if (!categories.length) return (
    <div className="text-center py-12 rounded-3xl shadow-sm" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBorder}` }}>
      <p className="text-4xl mb-3">🏷️</p>
      <p className="font-semibold mb-1" style={{ color: T.text }}>Necesitas una categoria primero</p>
      <button onClick={() => navigate('/categories')} className="text-white px-5 py-2.5 rounded-2xl text-sm font-semibold mt-3" style={{ background: T.heroGrad }}>Crear categoria</button>
    </div>
  )
  return (
    <div className="space-y-4">
      {!showForm && (
        <button onClick={() => setShowForm(true)} className="w-full py-3.5 rounded-2xl font-bold text-white text-sm" style={{ background: T.heroGrad }}>
          + Anadir gasto recurrente
        </button>
      )}
      {showForm && (
        <div className="rounded-3xl p-5 shadow-sm" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBorder}` }}>
          <p className="font-bold text-sm mb-4" style={{ color: T.text }}>{editId ? 'Editar recurrente' : 'Nuevo gasto recurrente'}</p>
          {ok && <div className="rounded-2xl p-3 mb-4 text-sm font-semibold" style={{ backgroundColor: '#ECFDF5', color: '#065F46' }}>Guardado correctamente</div>}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Categoria</label>
              <select name="categoryId" value={form.categoryId} onChange={set} className="w-full rounded-2xl px-4 py-3 border-2 focus:outline-none" style={inp}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Descripcion</label>
              <input type="text" name="description" value={form.description} onChange={set} placeholder="Netflix, Gimnasio, Alquiler..." maxLength={60}
                className="w-full rounded-2xl px-4 py-3 border-2 focus:outline-none" style={inp} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Importe (€)</label>
              <input type="number" name="amount" value={form.amount} onChange={set} placeholder="0.00" step="0.01" min="0.01"
                className="w-full rounded-2xl px-4 py-3 text-2xl font-bold border-2 focus:outline-none" style={inp} />
            </div>
            {/* Frecuencia */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Frecuencia</label>
              <div className="grid grid-cols-3 gap-2">
                {[['monthly','🔁 Mensual'],['every_n','📅 Cada X meses'],['annual','📆 Anual']].map(([v,l]) => (
                  <button key={v} type="button" onClick={() => setForm(p => ({ ...p, frequency: v }))}
                    className="py-2 px-1 rounded-2xl text-xs font-bold border-2 transition-all"
                    style={{
                      borderColor: form.frequency === v ? T.textSub : T.inputBorder,
                      backgroundColor: form.frequency === v ? T.textSub + '20' : T.inputBg,
                      color: form.frequency === v ? T.textSub : T.textMuted,
                    }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Cada cuantos meses */}
            {form.frequency === 'every_n' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Cada cuantos meses</label>
                <div className="flex gap-2 flex-wrap">
                  {[2,3,4,6].map(n => (
                    <button key={n} type="button" onClick={() => setForm(p => ({ ...p, frequencyMonths: String(n) }))}
                      className="px-4 py-2 rounded-2xl text-sm font-bold border-2 transition-all"
                      style={{
                        borderColor: form.frequencyMonths === String(n) ? T.textSub : T.inputBorder,
                        backgroundColor: form.frequencyMonths === String(n) ? T.textSub + '20' : T.inputBg,
                        color: form.frequencyMonths === String(n) ? T.textSub : T.text,
                      }}>
                      {n}m
                    </button>
                  ))}
                  <input type="number" name="frequencyMonths" value={form.frequencyMonths} onChange={set} min="2" max="24"
                    className="w-16 rounded-2xl px-3 py-2 text-center text-sm font-bold border-2 focus:outline-none"
                    style={inp} placeholder="?" />
                </div>
                <p className="text-xs mt-1.5" style={{ color: T.textFaint }}>
                  Se aplicara cada {form.frequencyMonths || 'N'} meses a partir de este mes
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Dia del mes del cargo</label>
              <div className="flex items-center gap-3">
                <input type="number" name="dayOfMonth" value={form.dayOfMonth} onChange={set} min="1" max="31"
                  className="w-24 rounded-2xl px-4 py-3 text-xl font-bold border-2 focus:outline-none text-center" style={inp} />
                <p className="text-sm flex-1" style={{ color: T.textMuted }}>
                  {form.frequency === 'monthly' && <>Dia <strong style={{ color: T.textSub }}>{form.dayOfMonth || '-'}</strong> de cada mes</>}
                  {form.frequency === 'annual' && <>Dia <strong style={{ color: T.textSub }}>{form.dayOfMonth || '-'}</strong> una vez al año</>}
                  {form.frequency === 'every_n' && <>Dia <strong style={{ color: T.textSub }}>{form.dayOfMonth || '-'}</strong> cada {form.frequencyMonths} meses</>}
                </p>
              </div>
            </div>
            {err && <p className="text-sm font-medium px-3 py-2 rounded-xl" style={{ color:'#F87171', backgroundColor:'#FEF2F2' }}>Error: {err}</p>}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={resetForm} className="flex-1 py-3 rounded-2xl font-semibold text-sm"
                style={{ backgroundColor: T.pageBg, color: T.textSub, border: `1px solid ${T.cardBorder}` }}>Cancelar</button>
              <button type="submit" className="flex-1 py-3 rounded-2xl font-bold text-sm text-white" style={{ background: T.heroGrad }}>Guardar</button>
            </div>
          </form>
        </div>
      )}
      {recurringExpenses.length === 0 && !showForm && (
        <div className="text-center py-12 rounded-3xl shadow-sm" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBorder}` }}>
          <p className="text-4xl mb-3">🔄</p>
          <p className="font-semibold mb-1" style={{ color: T.text }}>Sin gastos recurrentes</p>
          <p className="text-sm" style={{ color: T.textMuted }}>Anade suscripciones o pagos fijos mensuales</p>
        </div>
      )}
      {recurringExpenses.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: T.textMuted }}>
            {recurringExpenses.length} cargo{recurringExpenses.length !== 1 ? 's' : ''} recurrente{recurringExpenses.length !== 1 ? 's' : ''}
          </p>
          {recurringExpenses.map(rec => {
            const cat = categories.find(c => c.id === rec.categoryId)
            const applied = isRecurringApplied(rec.id)
            return (
              <div key={rec.id} className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBorder}`, opacity: rec.active ? 1 : 0.55 }}>
                {cat && <div className="h-1" style={{ backgroundColor: cat.color }} />}
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: (cat?.color || '#5EB0C8') + '25' }}>
                      {cat?.emoji || '💳'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm" style={{ color: T.text }}>{rec.description}</p>
                      <p className="text-xs" style={{ color: T.textMuted }}>{cat?.name || '-'} · {Number(rec.amount).toFixed(2)}€ · dia {rec.dayOfMonth}</p>
                      <p className="text-xs" style={{ color: T.textFaint }}>{freqLabel(rec)}</p>
                      {rec.active
                        ? applied
                          ? <p className="text-xs mt-0.5 font-medium" style={{ color: '#22C55E' }}>Aplicado este mes</p>
                          : isDueThisMonth(rec)
                            ? <p className="text-xs mt-0.5" style={{ color: '#FBBF24' }}>Pendiente este mes</p>
                            : <p className="text-xs mt-0.5" style={{ color: T.textFaint }}>No toca este mes</p>
                        : <p className="text-xs mt-0.5 font-medium" style={{ color: T.textFaint }}>Pausado</p>
                      }
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button onClick={() => toggleRecurring(rec.id)} title={rec.active ? 'Pausar' : 'Activar'}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                        style={{ backgroundColor: rec.active ? '#ECFDF5' : T.pageBg, color: rec.active ? '#22C55E' : T.textFaint, border: `1px solid ${T.cardBorder}` }}>
                        {rec.active ? '||' : '>'}
                      </button>
                      <button onClick={() => startEdit(rec)} title="Editar"
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-xs"
                        style={{ backgroundColor: T.pageBg, color: T.textSub, border: `1px solid ${T.cardBorder}` }}>
                        edit
                      </button>
                      <button onClick={() => deleteRecurring(rec.id)} title="Eliminar"
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-xs"
                        style={{ backgroundColor: '#FEF2F2', color: '#F87171', border: '1px solid #FECACA' }}>
                        del
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function AddExpense() {
  const { categories, addExpense, addIncome, getSpent } = useApp()
  const { T } = useTheme()
  const [params] = useSearchParams()
  const initTab = params.get('tab') === 'recurring' ? 'recurrente' : params.get('type') === 'income' ? 'ingreso' : 'gasto'
  const [tab, setTab] = useState(initTab)
  const TABS = [
    { id: 'gasto', label: 'Gasto' },
    { id: 'ingreso', label: 'Ingreso' },
    { id: 'recurrente', label: 'Recurrente' },
  ]
  const titles = {
    gasto: { h: 'Anadir gasto', sub: 'Registra un gasto en tu presupuesto' },
    ingreso: { h: 'Anadir ingreso', sub: 'Registra un ingreso recibido' },
    recurrente: { h: 'Gastos recurrentes', sub: 'Cargos fijos que se repiten cada mes' },
  }
  return (
    <div style={{ minHeight: '100vh', backgroundColor: T.pageBg }}>
      <div className="px-5 pt-10 pb-6" style={{ background: T.heroGrad }}>
        <h1 className="text-2xl font-bold text-white">{titles[tab].h}</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>{titles[tab].sub}</p>
      </div>
      <div className="px-4 -mt-3 pb-8">
        <div className="flex rounded-2xl p-1 mb-6 shadow-sm" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBorder}` }}>
          {TABS.map(({ id, label }) => (
            <button key={id} onClick={() => setTab(id)} className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
              style={{ backgroundColor: tab === id ? T.text : 'transparent', color: tab === id ? T.pageBg : T.textMuted }}>
              {label}
            </button>
          ))}
        </div>
        {tab === 'gasto' ? <GastoForm categories={categories} addExpense={addExpense} getSpent={getSpent} />
          : tab === 'ingreso' ? <IngresoForm addIncome={addIncome} />
          : <RecurrenteTab categories={categories} />}
      </div>
    </div>
  )
}
