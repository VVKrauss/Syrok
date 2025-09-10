import React from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import styles from './Home.module.css'

const Home: React.FC = () => {
  return (
    <>
      <SEO 
        title="Home"
        description="Welcome to my personal CV website. Discover my professional journey, projects, and achievements."
        keywords="CV, resume, portfolio, professional experience, projects"
      />
      
      {/* Full-width banner */}
      <div className={styles.banner}>
        <div className={styles.bannerContent}>
          <h1 className={styles.bannerTitle}>Welcome to My Professional Portfolio</h1>
          <p className={styles.bannerSubtitle}>
            Discover my journey, explore my projects, and connect with my professional story
          </p>
          <div className={styles.bannerButtons}>
            <Link to="/cv" className={styles.bannerPrimaryButton}>
              View CV
            </Link>
            <Link to="/projects" className={styles.bannerSecondaryButton}>
              Explore Projects
            </Link>
          </div>
        </div>
        <div className={styles.bannerOverlay}></div>
      </div>

      <div className={styles.home}>
        <div className={styles.container}>
          <div className={styles.quickNav}>
            <h2>Quick Navigation</h2>
            <p className={styles.navDescription}>
              Navigate through different sections of my professional profile
            </p>
            <div className={styles.navGrid}>
              <Link to="/cv" className={styles.navCard}>
                <div className={styles.navIcon}>📄</div>
                <h3>CV</h3>
                <p>Download my resume and view my professional experience</p>
              </Link>
              <Link to="/projects" className={styles.navCard}>
                <div className={styles.navIcon}>💻</div>
                <h3>Projects</h3>
                <p>Explore my technical projects and achievements</p>
              </Link>
              <Link to="/research" className={styles.navCard}>
                <div className={styles.navIcon}>🔬</div>
                <h3>Research</h3>
                <p>Browse my academic papers and research work</p>
              </Link>
              <Link to="/training" className={styles.navCard}>
                <div className={styles.navIcon}>🎓</div>
                <h3>Training</h3>
                <p>Professional development and certifications</p>
              </Link>
              <Link to="/volunteer" className={styles.navCard}>
                <div className={styles.navIcon}>🤝</div>
                <h3>Volunteer</h3>
                <p>Community work and social impact projects</p>
              </Link>
              <Link to="/hobbies" className={styles.navCard}>
                <div className={styles.navIcon}>🎨</div>
                <h3>Hobbies</h3>
                <p>Personal interests and creative pursuits</p>
              </Link>
              <Link to="/contact" className={styles.navCard}>
                <div className={styles.navIcon}>📧</div>
                <h3>Contact</h3>
                <p>Get in touch and start a conversation</p>
              </Link>
              <Link to="/about" className={styles.navCard}>
                <div className={styles.navIcon}>👤</div>
                <h3>About</h3>
                <p>Learn more about my background and values</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
