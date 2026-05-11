import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'

const EMOJIS = ['✈️','🏖️','🛡️','🐷','🎓','🏠','🚗','💊','🎮','🎨','🎭','💍','🌎','📱','🎁','🍾','🏋️','🌟','💼','🎵','🐶','🌸','🎪','🎯','🏆']
const COLORS = [
  '#EF4444','#F97316','#F59E0B','#22C55E','#10B981',
  '#0C3846','#2A7387','#5EB0C8','#3B82F6','#8B5CF6',
  '#EC4899','#DB2777','#6D28D9','#065F46','#92400E',
]

/* ── Formulario de fondo especial ── */
function FundForm({ initial, onSave, onCancel }) {
  const { T } = useTheme()
  const [form, setForm] = useState(initial || { name:'', goal:'', emoji:'✈️', color:'#F59E0B' })
  const [err, setErr] = useState('')

  const submit = e => {
    e.preventDefault()
    if (!form.name.trim()) return setErr('Introduce un nombre')
    onSave({ ...form, goal: form.goal ? Number(form.goal) : null })
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Emoji */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Icono</label>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map(em => (
            <button key={em} type="button" onClick={() => setForm(f=>({...f,emoji:em}))}
              className="w-9 h-9 rounded-xl text-lg transition-all"
              style={{
                backgroundColor: form.emoji===em ? T.text : T.card,
                border: `2px solid ${form.emoji===em ? T.text : T.cardBorder}`,
              }}>
              {em}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Color</label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(col => (
            <button key={col} type="button" onClick={() => setForm(f=>({...f,color:col}))}
              className="w-8 h-8 rounded-full transition-all"
              style={{
                backgroundColor: col,
                outline: form.color===col ? `3px solid ${col}` : 'none',
                outlineOffset: 3,
                transform: form.color===col ? 'scale(1.2)' : 'scale(1)',
              }} />
          ))}
        </div>
      </div>

      {/* Nombre */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Nombre</label>
        <input type="text" value={form.name}
          onChange={e=>{setForm(f=>({...f,name:e.target.value}));setErr('')}}
          placeholder="Ej: Viajes, Vacaciones, Imprevistos..." maxLength={30}
          className="w-full rounded-2xl px-4 py-3 border-2 focus:outline-none transition"
          style={{ backgroundColor: T.inputBg, borderColor: T.inputBorder, color: T.text }} />
      </div>

      {/* Objetivo */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>
          Objetivo (€){' '}
          <span style={{ color: T.textFaint, textTransform:'none', letterSpacing:0, fontWeight:400 }}>(opcional)</span>
        </label>
        <input type="number" value={form.goal}
          onChange={e=>setForm(f=>({...f,goal:e.target.value}))}
          placeholder="Sin objetivo" min="1" step="1"
          className="w-full rounded-2xl px-4 py-3 text-2xl font-bold border-2 focus:outline-none transition"
          style={{ backgroundColor: T.inputBg, borderColor: T.inputBorder, color: T.text }} />
      </div>

      {err && <p className="text-sm font-medium px-3 py-2 rounded-xl" style={{ color:'#F87171', backgroundColor:'#FEF2F2' }}>⚠️ {err}</p>}

      {/* Preview */}
      <div className="rounded-2xl p-4 flex items-center gap-3"
        style={{ backgroundColor: T.card, border:`1px solid ${T.cardBorder}` }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: form.color+'30' }}>
          {form.emoji}
        </div>
        <div>
          <p className="font-bold" style={{ color: T.text }}>{form.name || 'Nombre del fondo'}</p>
          <p className="text-sm" style={{ color: T.textMuted }}>
            {form.goal ? `Objetivo: ${form.goal}€` : 'Sin objetivo'}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onCancel}
          className="flex-1 font-semibold py-3 rounded-2xl"
          style={{ backgroundColor: T.pageBg, color: T.textSub, border:`1px solid ${T.cardBorder}` }}>
          Cancelar
        </button>
        <button type="submit"
          className="flex-1 text-white font-semibold py-3 rounded-2xl"
          style={{ background: T.heroGrad }}>
          Guardar
        </button>
      </div>
    </form>
  )
}

/* ── Modal para gestionar un fondo (añadir/retirar) ── */
function FundModal({ cat, balance, onClose, onAdd, onWithdraw }) {
  const { T } = useTheme()
  const [mode, setMode] = useState('menu') // 'menu' | 'add' | 'withdraw'
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)

  const confirm = () => {
    if (!amount || Number(amount) <= 0) return setErr('Introduce un importe válido')
    if (mode === 'withdraw' && Number(amount) > balance) return setErr('No puedes retirar más de lo disponible')
    mode === 'add' ? onAdd(Number(amount), note) : onWithdraw(Number(amount), note)
    setDone(true)
    setTimeout(onClose, 1200)
  }

  if (done) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor:'rgba(0,0,0,0.55)', backdropFilter:'blur(6px)' }}>
      <div className="rounded-3xl p-8 text-center shadow-2xl" style={{ backgroundColor: T.card }}>
        <p className="text-4xl mb-2">{mode==='add'?'✅':'💸'}</p>
        <p className="font-bold text-lg" style={{ color: T.text }}>
          {mode==='add' ? '¡Añadido!' : '¡Retirado!'}
        </p>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4"
      style={{ backgroundColor:'rgba(0,0,0,0.55)', backdropFilter:'blur(6px)' }}
      onClick={onClose}>
      <div className="w-full max-w-lg rounded-3xl p-6 shadow-2xl"
        style={{ backgroundColor: T.card }}
        onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: cat.color+'25' }}>
            {cat.emoji}
          </div>
          <div>
            <p className="font-bold text-lg" style={{ color: T.text }}>{cat.name}</p>
            <p className="text-base font-bold" style={{ color:'#22C55E' }}>{balance.toFixed(2)}€ ahorrados</p>
          </div>
        </div>

        {mode === 'menu' ? (
          <div className="space-y-3">
            <button onClick={() => setMode('add')}
              className="w-full py-3.5 rounded-2xl font-bold text-white text-sm"
              style={{ background: T.heroGrad }}>
              + Añadir dinero
            </button>
            <button onClick={() => setMode('withdraw')}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm"
              style={{ backgroundColor:'#FEF2F2', color:'#EF4444', border:'1px solid #FECACA' }}>
              − Retirar dinero (lo usé)
            </button>
            <button onClick={onClose}
              className="w-full py-3 rounded-2xl font-semibold text-sm"
              style={{ backgroundColor: T.pageBg, color: T.textMuted, border:`1px solid ${T.cardBorder}` }}>
              Cerrar
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="font-semibold" style={{ color: T.text }}>
              {mode === 'add' ? '+ Añadir dinero al fondo' : '− Retirar dinero del fondo'}
            </p>
            <input type="number" value={amount}
              onChange={e=>{setAmount(e.target.value);setErr('')}}
              placeholder="0.00" step="0.01" min="0.01" autoFocus
              className="w-full rounded-2xl px-4 py-3 text-2xl font-bold border-2 focus:outline-none"
              style={{ backgroundColor: T.inputBg, borderColor: T.inputBorder, color: T.text }} />
            <input type="text" value={note}
              onChange={e=>setNote(e.target.value)}
              placeholder="Nota (opcional)" maxLength={50}
              className="w-full rounded-2xl px-4 py-3 border-2 focus:outline-none"
              style={{ backgroundColor: T.inputBg, borderColor: T.inputBorder, color: T.text }} />
            {err && <p className="text-sm font-medium px-3 py-2 rounded-xl" style={{ color:'#F87171', backgroundColor:'#FEF2F2' }}>⚠️ {err}</p>}
            <div className="flex gap-3">
              <button onClick={() => { setMode('menu'); setErr(''); setAmount(''); setNote('') }}
                className="flex-1 py-3 rounded-2xl font-semibold text-sm"
                style={{ backgroundColor: T.pageBg, color: T.textMuted, border:`1px solid ${T.cardBorder}` }}>
                Cancelar
              </button>
              <button onClick={confirm}
                className="flex-1 py-3 rounded-2xl font-bold text-sm text-white"
                style={{ backgroundColor: mode==='add' ? '#22C55E' : '#EF4444' }}>
                Confirmar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Página principal ── */
export default function SpecialFunds() {
  const {
    specialCategories, getSpecialBalance,
    addSpecialCategory, updateSpecialCategory, deleteSpecialCategory,
    addToSpecialFund, withdrawFromSpecialFund,
  } = useApp()
  const { T } = useTheme()
  const [mode, setMode]           = useState('list') // 'list' | 'add' | 'edit'
  const [editId, setEditId]       = useState(null)
  const [selectedCat, setSelectedCat] = useState(null)
  const [delId, setDelId]         = useState(null)

  const editCat    = specialCategories.find(c => c.id === editId)
  const totalSaved = specialCategories.reduce((s, c) => s + getSpecialBalance(c.id), 0)

  return (
    <div style={{ minHeight:'100vh', backgroundColor: T.pageBg }}>

      {/* Header lista */}
      {mode === 'list' && (
        <div className="px-5 pt-10 pb-6 flex items-end justify-between" style={{ background: T.heroGrad }}>
          <div>
            <h1 className="text-2xl font-bold text-white">Fondos especiales</h1>
            <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.8)' }}>
              Total ahorrado: <strong>{totalSaved.toFixed(2)}€</strong>
            </p>
          </div>
          <button onClick={() => setMode('add')}
            className="text-white font-bold px-4 py-2 rounded-2xl text-sm"
            style={{ backgroundColor:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)' }}>
            + Nuevo
          </button>
        </div>
      )}

      {/* Header formulario */}
      {mode !== 'list' && (
        <div className="px-5 pt-10 pb-6" style={{ background: T.heroGrad }}>
          <button onClick={() => { setMode('list'); setEditId(null) }}
            className="text-sm font-semibold mb-3 flex items-center gap-1"
            style={{ color:'rgba(255,255,255,0.7)' }}>
            ← Volver
          </button>
          <h1 className="text-2xl font-bold text-white">
            {mode === 'add' ? 'Nuevo fondo especial' : 'Editar fondo'}
          </h1>
        </div>
      )}

      <div className="px-4 -mt-3 pb-6">

        {/* Formulario añadir */}
        {mode === 'add' && (
          <div className="pt-4">
            <FundForm
              onSave={d => { addSpecialCategory(d); setMode('list') }}
              onCancel={() => setMode('list')} />
          </div>
        )}

        {/* Formulario editar */}
        {mode === 'edit' && editCat && (
          <div className="pt-4">
            <FundForm
              initial={{ name:editCat.name, goal:editCat.goal||'', emoji:editCat.emoji, color:editCat.color }}
              onSave={d => { updateSpecialCategory(editId, d); setMode('list'); setEditId(null) }}
              onCancel={() => { setMode('list'); setEditId(null) }} />
          </div>
        )}

        {/* Lista */}
        {mode === 'list' && (
          <div className="pt-4 space-y-3">

            {/* Info */}
            <div className="rounded-2xl p-4" style={{ backgroundColor: T.card, border:`1px solid ${T.cardBorder}` }}>
              <p className="text-xs leading-relaxed" style={{ color: T.textMuted }}>
                💡 Los fondos especiales <strong style={{ color: T.textSub }}>no se reinician cada mes</strong>.
                Acumulan el dinero que vayas añadiendo o el sobrante mensual. Úsalos para metas a largo plazo como viajes, imprevistos o ahorros.
              </p>
            </div>

            {/* Vacío */}
            {specialCategories.length === 0 && (
              <div className="text-center py-14 rounded-3xl"
                style={{ backgroundColor: T.card, border:`1px solid ${T.cardBorder}` }}>
                <p className="text-4xl mb-3">🐷</p>
                <p className="font-semibold mb-1" style={{ color: T.text }}>Sin fondos especiales</p>
                <p className="text-sm mb-4" style={{ color: T.textMuted }}>Crea uno para empezar a ahorrar</p>
                <button onClick={() => setMode('add')} className="text-white px-5 py-2.5 rounded-2xl text-sm font-bold"
                  style={{ background: T.heroGrad }}>
                  Crear fondo
                </button>
              </div>
            )}

            {/* Tarjetas */}
            {specialCategories.map(cat => {
              const balance = getSpecialBalance(cat.id)
              const goal    = cat.goal || 0
              const pct     = goal > 0 ? Math.min((balance / goal) * 100, 100) : 0
              const reached = goal > 0 && balance >= goal

              return (
                <div key={cat.id} className="rounded-2xl overflow-hidden shadow-sm"
                  style={{ backgroundColor: T.card, border:`1px solid ${T.cardBorder}` }}>
                  <div className="h-1" style={{ backgroundColor: cat.color }} />
                  <div className="p-4">
                    {/* Top row */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ backgroundColor: cat.color+'25' }}>
                        {cat.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold" style={{ color: T.text }}>{cat.name}</p>
                        <p className="text-xs" style={{ color: T.textMuted }}>
                          {goal > 0 ? `Objetivo: ${goal}€` : 'Sin objetivo definido'}
                          {reached && ' ✅'}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => { setEditId(cat.id); setMode('edit') }}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                          style={{ backgroundColor: T.pageBg, color: T.textSub }}>
                          ✏️
                        </button>
                        <button onClick={() => setDelId(cat.id)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                          style={{ backgroundColor:'#FEF2F2', color:'#F87171' }}>
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Balance */}
                    <div className="flex items-end justify-between mb-2">
                      <p className="text-2xl font-bold" style={{ color: T.text }}>{balance.toFixed(2)}€</p>
                      {goal > 0 && (
                        <p className="text-xs font-semibold" style={{ color: reached ? '#22C55E' : T.textMuted }}>
                          {reached ? '¡Meta alcanzada! 🎉' : `${pct.toFixed(0)}% del objetivo`}
                        </p>
                      )}
                    </div>

                    {/* Barra de progreso */}
                    {goal > 0 && (
                      <div className="w-full rounded-full overflow-hidden mb-3"
                        style={{ height:8, backgroundColor: T.barTrack }}>
                        <div className="h-full rounded-full transition-all"
                          style={{ width:`${pct}%`, backgroundColor: reached ? '#22C55E' : cat.color }} />
                      </div>
                    )}

                    {/* Botón gestionar */}
                    <button onClick={() => setSelectedCat(cat)}
                      className="w-full py-2.5 rounded-xl text-sm font-bold text-white"
                      style={{ backgroundColor: cat.color }}>
                      Gestionar fondo
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal gestión */}
      {selectedCat && (
        <FundModal
          cat={selectedCat}
          balance={getSpecialBalance(selectedCat.id)}
          onClose={() => setSelectedCat(null)}
          onAdd={(amount, note) => addToSpecialFund(selectedCat.id, amount, note)}
          onWithdraw={(amount, note) => withdrawFromSpecialFund(selectedCat.id, amount, note)} />
      )}

      {/* Modal eliminar */}
      {delId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4"
          style={{ backgroundColor:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)' }}>
          <div className="w-full max-w-sm rounded-3xl p-6 shadow-2xl" style={{ backgroundColor: T.card }}>
            <p className="font-bold text-lg mb-1" style={{ color: T.text }}>¿Eliminar fondo?</p>
            <p className="text-sm mb-5" style={{ color: T.textMuted }}>
              Se eliminará el fondo y todo su historial. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDelId(null)}
                className="flex-1 font-semibold py-3 rounded-2xl"
                style={{ backgroundColor: T.pageBg, color: T.textSub, border:`1px solid ${T.cardBorder}` }}>
                Cancelar
              </button>
              <button onClick={() => { deleteSpecialCategory(delId); setDelId(null) }}
                className="flex-1 font-semibold py-3 rounded-2xl text-white"
                style={{ backgroundColor:'#F87171' }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
