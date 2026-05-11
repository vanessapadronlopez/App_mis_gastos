import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import AddExpense from './pages/AddExpense'
import Statistics from './pages/Statistics'
import History from './pages/History'
import Categories from './pages/Categories'
import SpecialFunds from './pages/SpecialFunds'

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/"           element={<Dashboard />}    />
              <Route path="/add"        element={<AddExpense />}   />
              <Route path="/stats"      element={<Statistics />}   />
              <Route path="/history"    element={<History />}      />
              <Route path="/categories" element={<Categories />}   />
              <Route path="/funds"      element={<SpecialFunds />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  )
}
