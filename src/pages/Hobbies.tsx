import React from 'react'
import ContentGrid from '../components/ContentGrid'
import SEO from '../components/SEO'

const Hobbies: React.FC = () => {
  return (
    <>
      <SEO 
        title="Hobbies"
        description="Discover my personal interests and hobbies outside of work. Learn about my passions and recreational activities."
        keywords="hobbies, interests, personal life, recreational activities, passions"
      />
      <ContentGrid
        type="hobby"
        title="Hobbies"
        subtitle="Personal interests and recreational activities"
        columns={3}
      />
    </>
  )
}

export default Hobbies
