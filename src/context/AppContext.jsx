import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

const defaultCategories = [
  { id: '1', name: 'Ocio y entretenimiento', limit: 100, color: '#5EB0C8', emoji: '🎭', alertThreshold: 80 },
  { id: '2', name: 'Comida y supermercado',  limit: 300, color: '#2A7387', emoji: '🧺', alertThreshold: 80 },
  { id: '3', name: 'Ahorro',                  limit: 200, color: '#0C3846', emoji: '🪙', alertThreshold: 80 },
]

const defaultSpecialCategories = [
  { id: 'sp1', name: 'Viajes',      emoji: '✈️', color: '#F59E0B', goal: 1000 },
  { id: 'sp2', name: 'Vacaciones',  emoji: '🏖️', color: '#10B981', goal: 500  },
  { id: 'sp3', name: 'Imprevistos', emoji: '🛡️', color: '#EF4444', goal: 300  },
  { id: 'sp4', name: 'Ahorros',     emoji: '🐷', color: '#8B5CF6', goal: 2000 },
]

const getPrevMonth = month => {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
}

export function AppProvider({ children }) {
  const currentMonth = new Date().toISOString().slice(0, 7)

  const [categories, setCategories] = useState(() => {
    const s = localStorage.getItem('gasto-categories')
    return s ? JSON.parse(s) : defaultCategories
  })
  const [expenses, setExpenses] = useState(() => {
    const s = localStorage.getItem('gasto-expenses')
    return s ? JSON.parse(s) : []
  })
  const [incomes, setIncomes] = useState(() => {
    const s = localStorage.getItem('gasto-incomes')
    return s ? JSON.parse(s) : []
  })
  const [referenceBalance, setReferenceBalanceState] = useState(() => {
    const s = localStorage.getItem('gasto-reference-balance')
    return s ? JSON.parse(s) : null
  })
  const [specialCategories, setSpecialCategories] = useState(() => {
    const s = localStorage.getItem('gasto-special-categories')
    return s ? JSON.parse(s) : defaultSpecialCategories
  })
  const [specialFunds, setSpecialFunds] = useState(() => {
    const s = localStorage.getItem('gasto-special-funds')
    return s ? JSON.parse(s) : []
  })
  const [closedMonths, setClosedMonths] = useState(() => {
    const s = localStorage.getItem('gasto-closed-months')
    return s ? JSON.parse(s) : []
  })
  const [recurringExpenses, setRecurringExpenses] = useState(() => {
    const s = localStorage.getItem('gasto-recurring')
    return s ? JSON.parse(s) : []
  })
  const [appStartMonth] = useState(() => {
    const s = localStorage.getItem('gasto-start-month')
    if (s) return s
    localStorage.setItem('gasto-start-month', currentMonth)
    return currentMonth
  })

  // ── Auto-apply recurring expenses on mount ────────────────────────
  useEffect(() => {
    const today    = new Date()
    const todayDay = today.getDate()
    const thisMonth = today.toISOString().slice(0, 7)
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()

    // Read directly from storage to avoid stale closures
    const storedRecurring = JSON.parse(localStorage.getItem('gasto-recurring') || '[]')
    const storedExpenses  = JSON.parse(localStorage.getItem('gasto-expenses')  || '[]')

    const shouldApplyThisMonth = (rec) => {
      const freq = rec.frequency || 'monthly'
      if (freq === 'monthly') return true
      const start = rec.startMonth || thisMonth
      const [sy, sm] = start.split('-').map(Number)
      const [ty, tm] = thisMonth.split('-').map(Number)
      const diff = (ty - sy) * 12 + (tm - sm)
      if (freq === 'annual') return diff % 12 === 0
      if (freq === 'every_n') return diff % (Number(rec.frequencyMonths) || 1) === 0
      return true
    }

    const toApply = storedRecurring.filter(rec => {
      if (!rec.active) return false
      if (rec.dayOfMonth > todayDay) return false
      if (!shouldApplyThisMonth(rec)) return false
      return !storedExpenses.some(e => e.recurringId === rec.id && e.month === thisMonth)
    })

    if (toApply.length === 0) return

    const newExp = toApply.map(rec => ({
      id:          `rec-${rec.id}-${thisMonth}`,
      categoryId:  rec.categoryId,
      amount:      Number(rec.amount),
      description: rec.description,
      date:        `${thisMonth}-${String(Math.min(rec.dayOfMonth, daysInMonth)).padStart(2,'0')}`,
      month:       thisMonth,
      recurringId: rec.id,
      auto:        true,
    }))

    setExpenses(p => {
      const toAdd = newExp.filter(ne =>
        !p.some(e => e.recurringId === ne.recurringId && e.month === ne.month)
      )
      return toAdd.length > 0 ? [...toAdd, ...p] : p
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persist to localStorage ───────────────────────────────────────
  useEffect(() => { localStorage.setItem('gasto-categories',         JSON.stringify(categories))         }, [categories])
  useEffect(() => { localStorage.setItem('gasto-expenses',           JSON.stringify(expenses))           }, [expenses])
  useEffect(() => { localStorage.setItem('gasto-incomes',            JSON.stringify(incomes))            }, [incomes])
  useEffect(() => { localStorage.setItem('gasto-special-categories', JSON.stringify(specialCategories)) }, [specialCategories])
  useEffect(() => { localStorage.setItem('gasto-special-funds',      JSON.stringify(specialFunds))      }, [specialFunds])
  useEffect(() => { localStorage.setItem('gasto-closed-months',      JSON.stringify(closedMonths))      }, [closedMonths])
  useEffect(() => { localStorage.setItem('gasto-recurring',          JSON.stringify(recurringExpenses)) }, [recurringExpenses])
  useEffect(() => {
    if (referenceBalance) localStorage.setItem('gasto-reference-balance', JSON.stringify(referenceBalance))
  }, [referenceBalance])

  // ── Pending month review ──────────────────────────────────────────
  const prevMonth = getPrevMonth(currentMonth)
  const pendingMonthReview =
    prevMonth >= appStartMonth && !closedMonths.includes(prevMonth) ? prevMonth : null

  // ── Helpers ───────────────────────────────────────────────────────
  const getSpent = (categoryId, month = currentMonth) =>
    expenses.filter(e => e.categoryId === categoryId && e.month === month)
            .reduce((s, e) => s + Number(e.amount), 0)

  const getCurrentBalance = () => {
    if (!referenceBalance) return null
    const { date, amount } = referenceBalance
    // Use first day of reference month so all same-month transactions are counted
    const fromDate = date.slice(0, 7) + '-01'
    const inc = incomes.filter(i => i.date >= fromDate).reduce((s, i) => s + Number(i.amount), 0)
    const exp = expenses.filter(e => e.date >= fromDate).reduce((s, e) => s + Number(e.amount), 0)
    return amount + inc - exp
  }

  const setManualBalance = (amount, date) => setReferenceBalanceState({ amount: Number(amount), date })

  // ── Expense / Income CRUD ─────────────────────────────────────────
  const addExpense    = e  => setExpenses(p => [{ ...e, id: Date.now().toString(), month: e.date.slice(0,7) }, ...p])
  const deleteExpense = id => setExpenses(p => p.filter(e => e.id !== id))
  const addIncome     = i  => setIncomes(p  => [{ ...i, id: Date.now().toString(), month: i.date.slice(0,7) }, ...p])
  const deleteIncome  = id => setIncomes(p  => p.filter(i => i.id !== id))

  // ── Regular Category CRUD ─────────────────────────────────────────
  const addCategory    = c  => setCategories(p => [...p, { ...c, id: Date.now().toString() }])
  const updateCategory = (id, u) => setCategories(p => p.map(c => c.id === id ? { ...c, ...u } : c))
  const deleteCategory = id => {
    setCategories(p => p.filter(c => c.id !== id))
    setExpenses(p => p.filter(e => e.categoryId !== id))
  }

  // ── Special Category CRUD ─────────────────────────────────────────
  const addSpecialCategory    = c  => setSpecialCategories(p => [...p, { ...c, id: Date.now().toString() }])
  const updateSpecialCategory = (id, u) => setSpecialCategories(p => p.map(c => c.id === id ? { ...c, ...u } : c))
  const deleteSpecialCategory = id => {
    setSpecialCategories(p => p.filter(c => c.id !== id))
    setSpecialFunds(p => p.filter(f => f.specialCategoryId !== id))
  }

  const getSpecialBalance = id =>
    specialFunds.filter(f => f.specialCategoryId === id).reduce((s, f) => s + Number(f.amount), 0)

  const addToSpecialFund = (specialCategoryId, amount, note = '', fromMonth = null) =>
    setSpecialFunds(p => [...p, {
      id: Date.now().toString(), specialCategoryId,
      amount: Number(amount), note, fromMonth,
      date: new Date().toISOString().slice(0, 10),
    }])

  const withdrawFromSpecialFund = (specialCategoryId, amount, note = '') =>
    setSpecialFunds(p => [...p, {
      id: Date.now().toString(), specialCategoryId,
      amount: -Number(amount), note, fromMonth: null,
      date: new Date().toISOString().slice(0, 10),
    }])

  const closeMonth = (month, distributions) => {
    distributions.forEach(d => {
      if (d.specialCategoryId && d.amount > 0)
        addToSpecialFund(d.specialCategoryId, d.amount, `Sobrante de "${d.categoryName}"`, month)
    })
    setClosedMonths(p => [...new Set([...p, month])])
  }

  // ── Recurring expenses CRUD ───────────────────────────────────────
  const addRecurring    = r  => setRecurringExpenses(p => [...p, { ...r, id: Date.now().toString(), active: true }])
  const updateRecurring = (id, u) => setRecurringExpenses(p => p.map(r => r.id === id ? { ...r, ...u } : r))
  const deleteRecurring = id => setRecurringExpenses(p => p.filter(r => r.id !== id))
  const toggleRecurring = id => setRecurringExpenses(p => p.map(r => r.id === id ? { ...r, active: !r.active } : r))

  // Check if a recurring was applied this month
  const isRecurringApplied = (recurringId) =>
    expenses.some(e => e.recurringId === recurringId && e.month === currentMonth)

  return (
    <AppContext.Provider value={{
      categories, expenses, incomes, referenceBalance, currentMonth,
      specialCategories, specialFunds, closedMonths, pendingMonthReview,
      recurringExpenses,
      getSpent, getCurrentBalance, setManualBalance,
      addExpense, deleteExpense, addIncome, deleteIncome,
      addCategory, updateCategory, deleteCategory,
      addSpecialCategory, updateSpecialCategory, deleteSpecialCategory,
      getSpecialBalance, addToSpecialFund, withdrawFromSpecialFund, closeMonth,
      addRecurring, updateRecurring, deleteRecurring, toggleRecurring, isRecurringApplied,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
