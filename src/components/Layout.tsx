import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import styles from './Layout.module.css'

const Layout: React.FC = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/cv', label: 'CV' },
    { path: '/projects', label: 'Projects' },
    { path: '/research', label: 'Research' },
    { path: '/training', label: 'Training' },
    { path: '/volunteer', label: 'Volunteer' },
    { path: '/hobbies', label: 'Hobbies' },
    { path: '/contact', label: 'Contact' },
    { path: '/about', label: 'About' },
  ]

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <div className={styles.navContainer}>
            <Link to="/" className={styles.logo}>
              CV Website
            </Link>
            <ul className={styles.navList}>
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`${styles.navLink} ${
                      location.pathname === item.path ? styles.active : ''
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/admin" className={styles.adminLink}>
              Admin
            </Link>
          </div>
        </nav>
      </header>
      
      <main className={styles.main}>
        <Outlet />
      </main>
      
      <footer className={styles.footer}>
        <p>&copy; 2024 CV Website. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Layout
