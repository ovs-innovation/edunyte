import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router-dom'
import AppNavigation from './navigation/Navigation'
import { Provider } from 'react-redux'
import store from './redux/store'
import { CurrencyProvider } from './contexts/CurrencyContext'
import { AuthProvider } from './contexts/AuthContext'
import { WishlistProvider } from './contexts/WishlistContext'

function App() {

  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <WishlistProvider>
            <CurrencyProvider>
              <HelmetProvider>
                <div className="main-page-wrapper">
                  <AppNavigation />
                </div>
              </HelmetProvider>
            </CurrencyProvider>
          </WishlistProvider>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  )
}

export default App
