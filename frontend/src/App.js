import Header from './components/Header'
import { getRoutes } from './router'

function App() {

  return (
      <>
        <Header />
        {getRoutes()}
      </>
  )
}

export default App
