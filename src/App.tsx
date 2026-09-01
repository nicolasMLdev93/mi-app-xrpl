import { Route, Routes } from 'react-router-dom'
import Login from './pages/login'

function App() {


  return (
    <Routes>
        <Route path="/" element={<Login/>} />
        {/*<Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dex" element={<Dex />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />*/}
      </Routes>
  )
}

export default App
