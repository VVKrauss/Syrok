import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import styles from './AdminLogin.module.css'

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signIn(email, password)
      navigate('/admin')
    } catch (error: any) {
      setError(error.message || 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.login}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1>Admin Login</h1>
            <p>Sign in to manage your CV website</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="Enter your email"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className={styles.footer}>
            <a href="/" className={styles.backLink}>
              ← Back to Website
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
