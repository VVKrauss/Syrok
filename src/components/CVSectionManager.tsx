import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import styles from './CVSectionManager.module.css'

// Временно определяем тип локально для решения проблемы с кэшем
interface CVSection {
  id: string
  section_type: 'header' | 'experience' | 'education' | 'skills' | 'projects' | 'languages' | 'certifications' | 'achievements'
  title?: string
  subtitle?: string
  content?: string
  start_date?: string
  end_date?: string
  current: boolean
  order_index: number
  created_at: string
  updated_at: string
}

interface CVSectionFormProps {
  section?: CVSection
  onSave: (section: CVSection) => void
  onCancel: () => void
}

const CVSectionForm: React.FC<CVSectionFormProps> = ({ section, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    section_type: section?.section_type || 'experience',
    title: section?.title || '',
    subtitle: section?.subtitle || '',
    content: section?.content || '',
    start_date: section?.start_date || '',
    end_date: section?.end_date || '',
    current: section?.current || false,
    order_index: section?.order_index || 0
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData as CVSection)
  }

  const sectionTypeLabels = {
    header: 'Заголовок',
    experience: 'Опыт работы',
    education: 'Образование',
    skills: 'Навыки',
    projects: 'Проекты',
    languages: 'Языки',
    certifications: 'Сертификации',
    achievements: 'Достижения'
  }

  return (
    <div className={styles.form}>
      <form onSubmit={handleSubmit}>
        <div className={styles.header}>
          <h3>{section ? 'Редактировать секцию' : 'Добавить секцию'}</h3>
          <div className={styles.actions}>
            <button type="button" onClick={onCancel} className={styles.cancelButton}>
              Отмена
            </button>
            <button type="submit" className={styles.saveButton}>
              Сохранить
            </button>
          </div>
        </div>

        <div className={styles.fields}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="section_type">Тип секции</label>
              <select
                id="section_type"
                name="section_type"
                value={formData.section_type}
                onChange={handleInputChange}
              >
                {Object.entries(sectionTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="order_index">Порядок</label>
              <input
                type="number"
                id="order_index"
                name="order_index"
                value={formData.order_index}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="title">Заголовок</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Например: Senior Developer"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="subtitle">Подзаголовок</label>
              <input
                type="text"
                id="subtitle"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                placeholder="Например: Google Inc."
              />
            </div>
          </div>

          {(formData.section_type === 'experience' || formData.section_type === 'education') && (
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="start_date">Дата начала</label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="end_date">Дата окончания</label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  disabled={formData.current}
                />
              </div>
            </div>
          )}

          {(formData.section_type === 'experience' || formData.section_type === 'education') && (
            <div className={styles.field}>
              <label>
                <input
                  type="checkbox"
                  name="current"
                  checked={formData.current}
                  onChange={handleInputChange}
                />
                Текущая позиция
              </label>
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="content">Описание</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={4}
              placeholder="Описание работы, достижений, навыков..."
            />
          </div>
        </div>
      </form>
    </div>
  )
}

const CVSectionManager: React.FC = () => {
  const [sections, setSections] = useState<CVSection[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSection, setEditingSection] = useState<CVSection | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchSections()
  }, [])

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('syrok_cv_sections')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) {
        console.error('Error fetching CV sections:', error)
      } else {
        setSections(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (sectionData: CVSection) => {
    try {
      if (editingSection) {
        // Update existing section
        const { error } = await supabase
          .from('syrok_cv_sections')
          .update(sectionData)
          .eq('id', editingSection.id)

        if (error) throw error
      } else {
        // Create new section
        const { error } = await supabase
          .from('syrok_cv_sections')
          .insert(sectionData)

        if (error) throw error
      }

      fetchSections()
      setEditingSection(null)
      setShowForm(false)
    } catch (error) {
      console.error('Error saving CV section:', error)
      alert('Error saving CV section')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return

    try {
      const { error } = await supabase
        .from('syrok_cv_sections')
        .delete()
        .eq('id', id)

      if (error) throw error

      fetchSections()
    } catch (error) {
      console.error('Error deleting CV section:', error)
      alert('Error deleting CV section')
    }
  }

  const startEdit = (section: CVSection) => {
    setEditingSection(section)
    setShowForm(true)
  }

  const cancelEdit = () => {
    setEditingSection(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading CV sections...</p>
      </div>
    )
  }

  return (
    <div className={styles.manager}>
      <div className={styles.header}>
        <h2>CV Sections Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className={styles.addButton}
        >
          Add Section
        </button>
      </div>

      {showForm && (
        <CVSectionForm
          section={editingSection || undefined}
          onSave={handleSave}
          onCancel={cancelEdit}
        />
      )}

      <div className={styles.sections}>
        {sections.length === 0 ? (
          <p className={styles.empty}>No CV sections found. Add your first section!</p>
        ) : (
          sections.map((section) => (
            <div key={section.id} className={styles.section}>
              <div className={styles.sectionContent}>
                <div className={styles.sectionHeader}>
                  <h4>{section.title || 'Untitled'}</h4>
                  <span className={styles.sectionType}>{section.section_type}</span>
                </div>
                {section.subtitle && <p className={styles.subtitle}>{section.subtitle}</p>}
                {section.content && (
                  <p className={styles.content}>
                    {section.content.substring(0, 100)}
                    {section.content.length > 100 ? '...' : ''}
                  </p>
                )}
                <div className={styles.meta}>
                  <span>Order: {section.order_index}</span>
                  {section.start_date && <span>Start: {section.start_date}</span>}
                  {section.end_date && <span>End: {section.end_date}</span>}
                  {section.current && <span>Current</span>}
                </div>
              </div>
              <div className={styles.sectionActions}>
                <button
                  onClick={() => startEdit(section)}
                  className={styles.editButton}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(section.id)}
                  className={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CVSectionManager
