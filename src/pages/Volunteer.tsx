import React from 'react'
import ContentGrid from '../components/ContentGrid'
import SEO from '../components/SEO'

const Volunteer: React.FC = () => {
  return (
    <>
      <SEO 
        title="Volunteer Work"
        description="Learn about my volunteer activities and community service contributions. See how I give back to the community."
        keywords="volunteer, community service, social impact, volunteering, charity"
      />
      <ContentGrid
        type="volunteer"
        title="Volunteer Work"
        subtitle="Community service and volunteer activities"
        columns={2}
      />
    </>
  )
}

export default Volunteer
