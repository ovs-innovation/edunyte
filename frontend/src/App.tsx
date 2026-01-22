
import { HelmetProvider } from 'react-helmet-async'
import AppNavigation from './navigation/Navigation'
import { Provider } from 'react-redux'
import store from './redux/store'
import { CurrencyProvider } from './contexts/CurrencyContext'

function App() {

  return (
    <Provider store={store}>
      <CurrencyProvider>
        <HelmetProvider>
          <div className="main-page-wrapper">
            <AppNavigation />
          </div>
        </HelmetProvider>
      </CurrencyProvider>
    </Provider>
  )
}

export default App
