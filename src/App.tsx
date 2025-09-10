import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import CV from './pages/CV'
import Projects from './pages/Projects'
import Research from './pages/Research'
import Training from './pages/Training'
import Volunteer from './pages/Volunteer'
import Hobbies from './pages/Hobbies'
import Contact from './pages/Contact'
import About from './pages/About'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="cv" element={<CV />} />
            <Route path="projects" element={<Projects />} />
            <Route path="research" element={<Research />} />
            <Route path="training" element={<Training />} />
            <Route path="volunteer" element={<Volunteer />} />
            <Route path="hobbies" element={<Hobbies />} />
            <Route path="contact" element={<Contact />} />
            <Route path="about" element={<About />} />
            <Route 
              path="admin" 
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } 
            />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
