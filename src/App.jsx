import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import AppRouter from './router'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppRouter />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
