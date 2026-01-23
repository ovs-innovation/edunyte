import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router-dom'
import AppNavigation from './navigation/Navigation'
import { Provider } from 'react-redux'
import store from './redux/store'
import { CurrencyProvider } from './contexts/CurrencyContext'
import { AuthProvider } from './contexts/AuthContext'

function App() {

  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <CurrencyProvider>
            <HelmetProvider>
              <div className="main-page-wrapper">
                <AppNavigation />
              </div>
            </HelmetProvider>
          </CurrencyProvider>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  )
}

export default App
