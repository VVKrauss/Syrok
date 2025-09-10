import React from 'react'
import ContentGrid from '../components/ContentGrid'
import SEO from '../components/SEO'

const Training: React.FC = () => {
  return (
    <>
      <SEO 
        title="Professional Training"
        description="View my professional development journey including courses, certifications, and training programs."
        keywords="training, professional development, courses, certifications, skills"
      />
      <ContentGrid
        type="training"
        title="Professional Training"
        subtitle="Courses, certifications, and professional development"
        columns={2}
      />
    </>
  )
}

export default Training
