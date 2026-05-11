import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'

const EMOJIS = ['🎭','🧺','🪙','🌿','🚗','🏡','👗','💊','✈️','🎓','🐾','🍽️','⚡','🖥️','🎮','🏋️','🎨','🎀','🧋','☕','🌊','🦋','🌸','🎵','📚']
const COLORS = [
  '#EF4444','#F87171','#EC4899','#F472B6','#FB7185',
  '#F97316','#FB923C','#FDBA74','#F59E0B','#FCD34D',
  '#22C55E','#4ADE80','#16A34A','#059669','#34D399',
  '#0C3846','#2A7387','#5EB0C8','#9FD3E3','#0EA5E9',
  '#3B82F6','#60A5FA','#818CF8','#8B5CF6','#A78BFA',
  '#7C3AED','#C084FC','#E879F9','#DB2777','#F9A8D4',
  '#92400E','#B45309','#D97706','#78716C','#A8A29E',
]

function CatForm({ initial, onSave, onCancel }) {
  const { T } = useTheme()
  const [form, setForm] = useState(initial || { name: '', limit: '', emoji: '🎭', color: '#0C3846', alertThreshold: 80 })
  const [err, setErr] = useState('')
  const submit = e => {
    e.preventDefault()
    if (!form.name.trim()) return setErr('Introduce un nombre')
    if (!form.limit || Number(form.limit) <= 0) return setErr('El limite debe ser mayor que 0')
    onSave({ ...form, limit: Number(form.limit), alertThreshold: Number(form.alertThreshold) })
  }
  const thresholdColor = form.alertThreshold >= 90 ? '#F87171' : form.alertThreshold >= 75 ? '#FBBF24' : '#22C55E'
  const limitAmount = form.limit ? ((Number(form.limit) * form.alertThreshold) / 100).toFixed(0) : null
  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Icono</label>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map(em => (
            <button key={em} type="button" onClick={() => setForm(f => ({ ...f, emoji: em }))}
              className="w-9 h-9 rounded-xl text-lg transition-all"
              style={{ backgroundColor: form.emoji === em ? T.text : T.card, border: `2px solid ${form.emoji === em ? T.text : T.cardBorder}` }}>
              {em}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Color</label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(col => (
            <button key={col} type="button" onClick={() => setForm(f => ({ ...f, color: col }))}
              className="w-8 h-8 rounded-full transition-all"
              style={{ backgroundColor: col, outline: form.color === col ? `3px solid ${col}` : 'none', outlineOffset: 3, transform: form.color === col ? 'scale(1.2)' : 'scale(1)' }} />
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Nombre</label>
        <input type="text" value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErr('') }}
          placeholder="Ocio, Viajes, Coche..." maxLength={30}
          className="w-full rounded-2xl px-4 py-3 border-2 focus:outline-none transition"
          style={{ backgroundColor: T.inputBg, borderColor: T.inputBorder, color: T.text }} />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>Limite mensual (€)</label>
        <input type="number" value={form.limit} onChange={e => { setForm(f => ({ ...f, limit: e.target.value })); setErr('') }}
          placeholder="0" min="1" step="1"
          className="w-full rounded-2xl px-4 py-3 text-2xl font-bold border-2 focus:outline-none transition"
          style={{ backgroundColor: T.inputBg, borderColor: T.inputBorder, color: T.text }} />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: T.textMuted }}>Alerta de presupuesto</label>
          <span className="text-sm font-bold px-2.5 py-0.5 rounded-lg" style={{ backgroundColor: thresholdColor + '20', color: thresholdColor }}>
            {form.alertThreshold}%
          </span>
        </div>
        <input type="range" min="50" max="100" step="5" value={form.alertThreshold}
          onChange={e => setForm(f => ({ ...f, alertThreshold: Number(e.target.value) }))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${thresholdColor} 0%, ${thresholdColor} ${(form.alertThreshold - 50) / 50 * 100}%, ${T.barTrack} ${(form.alertThreshold - 50) / 50 * 100}%, ${T.barTrack} 100%)`,
            accentColor: thresholdColor,
          }} />
        <div className="flex justify-between mt-1">
          <span className="text-[10px]" style={{ color: T.textFaint }}>50% - Aviso temprano</span>
          <span className="text-[10px]" style={{ color: T.textFaint }}>100% - Solo al agotar</span>
        </div>
        <p className="text-xs mt-1.5" style={{ color: T.textMuted }}>
          Aviso al gastar el <strong style={{ color: thresholdColor }}>{form.alertThreshold}%</strong>
          {limitAmount ? ` (${limitAmount}€ de ${form.limit}€)` : ' del limite'}
        </p>
      </div>
      {err && <p className="text-sm font-medium px-3 py-2 rounded-xl" style={{ color: '#F87171', backgroundColor: '#FEF2F2' }}>Error: {err}</p>}
      <div className="rounded-2xl p-4 flex items-center gap-3" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBorder}` }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: form.color + '30' }}>{form.emoji}</div>
        <div>
          <p className="font-bold" style={{ color: T.text }}>{form.name || 'Nombre de categoria'}</p>
          <p className="text-sm" style={{ color: T.textMuted }}>Limite: {form.limit || 0}€/mes · Alerta al {form.alertThreshold}%</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 font-semibold py-3 rounded-2xl"
          style={{ backgroundColor: T.pageBg, color: T.textSub, border: `1px solid ${T.cardBorder}` }}>Cancelar</button>
        <button type="submit" className="flex-1 text-white font-semibold py-3 rounded-2xl" style={{ background: T.heroGrad }}>Guardar</button>
      </div>
    </form>
  )
}

export default function Categories() {
  const { categories, expenses, getSpent, addCategory, updateCategory, deleteCategory, currentMonth } = useApp()
  const { T } = useTheme()
  const [mode, setMode] = useState('list')
  const [editId, setEditId] = useState(null)
  const [delId, setDelId] = useState(null)
  const [showDist, setShowDist] = useState(false)
  const editCat = categories.find(c => c.id === editId)
  const totalLeftover = categories.reduce((s, c) => s + Math.max(0, c.limit - getSpent(c.id)), 0)
  return (
    <div style={{ minHeight: '100vh', backgroundColor: T.pageBg }}>
      {mode === 'list' && (
        <div className="px-5 pt-10 pb-6 flex items-end justify-between" style={{ background: T.heroGrad }}>
          <div>
            <h1 className="text-2xl font-bold text-white">Categorias</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>{categories.length} categorias activas</p>
          </div>
          <button onClick={() => setMode('add')} className="text-white font-bold px-4 py-2 rounded-2xl text-sm mb-0.5"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}>+ Nueva</button>
        </div>
      )}
      {mode !== 'list' && (
        <div className="px-5 pt-10 pb-6" style={{ background: T.heroGrad }}>
          <button onClick={() => { setMode('list'); setEditId(null) }} className="text-sm font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>Volver</button>
          <h1 className="text-2xl font-bold text-white">{mode === 'add' ? 'Nueva categoria' : 'Editar categoria'}</h1>
        </div>
      )}
      <div className="px-4 -mt-3 pb-6">
        {mode === 'add' && (
          <div className="pt-4">
            <CatForm onSave={d => { addCategory(d); setMode('list') }} onCancel={() => setMode('list')} />
          </div>
        )}
        {mode === 'edit' && editCat && (
          <div className="pt-4">
            <CatForm
              initial={{ name: editCat.name, limit: editCat.limit, emoji: editCat.emoji, color: editCat.color, alertThreshold: editCat.alertThreshold ?? 80 }}
              onSave={d => { updateCategory(editId, d); setMode('list'); setEditId(null) }}
              onCancel={() => { setMode('list'); setEditId(null) }} />
          </div>
        )}
        {mode === 'list' && (
          <div className="pt-4 space-y-3">
            {totalLeftover > 0.5 && (
              <button onClick={() => setShowDist(!showDist)} className="w-full rounded-2xl p-4 text-left" style={{ backgroundColor: '#ECFDF5', border: '1px solid #BBF7D0' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm" style={{ color: '#065F46' }}>Sobrante: {totalLeftover.toFixed(2)}€</p>
                    <p className="text-xs mt-0.5" style={{ color: '#059669' }}>Redirigir a otra categoria</p>
                  </div>
                  <span style={{ color: '#059669' }}>{showDist ? 'v' : '>'}</span>
                </div>
                {showDist && (
                  <div className="mt-3 space-y-2" onClick={e => e.stopPropagation()}>
                    {categories.map(cat => (
                      <button key={cat.id} type="button" onClick={() => { updateCategory(cat.id, { limit: cat.limit + Math.floor(totalLeftover) }); setShowDist(false) }}
                        className="flex items-center gap-2 w-full rounded-xl px-3 py-2 text-sm font-semibold text-left"
                        style={{ backgroundColor: 'white', border: '1px solid #BBF7D0', color: '#065F46' }}>
                        <span>{cat.emoji}</span><span>{cat.name}</span>
                        <span className="ml-auto text-xs" style={{ color: '#059669' }}>{cat.limit + Math.floor(totalLeftover)}€</span>
                      </button>
                    ))}
                  </div>
                )}
              </button>
            )}
            {categories.length === 0 && (
              <div className="text-center py-14 rounded-3xl shadow-sm mt-2" style={{ backgroundColor: T.card, border: `1px solid ${T.cardBorder}` }}>
                <p className="text-4xl mb-3">🏷️</p>
                <p className="font-semibold mb-1" style={{ color: T.text }}>Sin categorias</p>
                <p className="text-sm mb-4" style={{ color: T.textMuted }}>Crea la primera para empezar</p>
                <button onClick={() => setMode('add')} className="text-white px-5 py-2.5 rounded-2xl text-sm font-bold" style={{ background: T.heroGrad }}>Crear categoria</button>
              </div>
            )}
            {categories.map(cat => {
              const spent = getSpent(cat.id)
              const rem = cat.limit - spent
              const pct = cat.limit > 0 ? Math.min((spent / cat.limit) * 100, 100) : 0
              const threshold = cat.alertThreshold ?? 80
              const n = expenses.filter(e => e.categoryId === cat.id && e.month === currentMonth).length
              const alertOn = pct >= threshold && pct < 100
              const exceeded = pct >= 100
              return (
                <div key={cat.id} className="rounded-2xl overflow-hidden shadow-sm"
                  style={{ backgroundColor: T.card, border: `1px solid ${exceeded ? '#F87171' : alertOn ? '#FBBF24' : T.cardBorder}` }}>
                  <div className="h-1" style={{ backgroundColor: cat.color }} />
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ backgroundColor: cat.color + '25' }}>{cat.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold" style={{ color: T.text }}>{cat.name}</p>
                        <p className="text-xs" style={{ color: T.textMuted }}>Limite {cat.limit}€/mes · {n} gastos · Alerta {threshold}%</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => { setEditId(cat.id); setMode('edit') }}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                          style={{ backgroundColor: T.pageBg, color: T.textSub }}>
                          ✏️
                        </button>
                        <button onClick={() => setDelId(cat.id)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                          style={{ backgroundColor: '#FEF2F2', color: '#F87171' }}>
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs mb-1.5" style={{ color: T.textMuted }}>
                      <span>{spent.toFixed(2)}€ gastado</span>
                      <span style={{ color: rem >= 0 ? T.textSub : '#F87171', fontWeight: 700 }}>
                        {rem >= 0 ? `${rem.toFixed(2)}€ libre` : `${Math.abs(rem).toFixed(2)}€ excedido`}
                      </span>
                    </div>
                    <div className="relative w-full rounded-full overflow-hidden" style={{ height: 8, backgroundColor: T.barTrack }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: exceeded ? '#F87171' : alertOn ? '#FBBF24' : cat.color }} />
                      {threshold < 100 && (
                        <div className="absolute top-0 bottom-0 w-0.5 opacity-60" style={{ left: `${threshold}%`, backgroundColor: T.text }} />
                      )}
                    </div>
                    <div className="flex justify-between mt-1">
                      {exceeded && <p className="text-xs font-medium" style={{ color: '#F87171' }}>Limite superado</p>}
                      {alertOn && <p className="text-xs font-medium" style={{ color: '#FBBF24' }}>Alerta: {pct.toFixed(0)}% del limite</p>}
                      {!alertOn && !exceeded && <span />}
                      <p className="text-xs" style={{ color: T.textFaint }}>{pct.toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      {delId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4" style={{ backgroundColor: 'rgba(7,30,42,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-sm rounded-3xl p-6 shadow-2xl" style={{ backgroundColor: T.card }}>
            <p className="font-bold text-lg mb-1" style={{ color: T.text }}>Eliminar categoria?</p>
            <p className="text-sm mb-5" style={{ color: T.textMuted }}>Se eliminaran todos los gastos asociados. Esta accion no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setDelId(null)} className="flex-1 font-semibold py-3 rounded-2xl"
                style={{ backgroundColor: T.pageBg, color: T.textSub, border: `1px solid ${T.cardBorder}` }}>Cancelar</button>
              <button onClick={() => { deleteCategory(delId); setDelId(null) }} className="flex-1 font-semibold py-3 rounded-2xl text-white" style={{ backgroundColor: '#F87171' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
