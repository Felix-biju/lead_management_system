import React, { useState } from 'react'
import axios from 'axios'

const QuickAddForm = ({ fetchData }) => {
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', phone: '' })
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault() 
    setSubmitStatus("Saving...")
    try {
      await axios.post('http://127.0.0.1:8000/api/leads', formData)
      setSubmitStatus("✅ Lead captured successfully!")
      setFormData({ first_name: '', last_name: '', email: '', phone: '' })
      fetchData() // Refresh the global data
      setTimeout(() => setSubmitStatus(null), 3000)
    } catch (error) { setSubmitStatus("🚨 Error capturing lead.") }
  }

  return (
    <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <h3 style={{ margin: '0 0 24px 0', color: '#0f172a', fontSize: '1.2em' }}>⚡️ Quick Add Lead</h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <input name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#f8fafc' }}/>
        <input name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#f8fafc' }}/>
        <input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#f8fafc' }}/>
        <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#f8fafc' }}/>
        <button type="submit" style={{ gridColumn: 'span 2', padding: '14px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', marginTop: '8px', fontSize: '1em' }}>Add to Pipeline</button>
      </form>
      {submitStatus && <p style={{ marginTop: '16px', fontSize: '0.95em', color: submitStatus.includes('✅') ? '#059669' : '#dc2626', fontWeight: '500', textAlign: 'center' }}>{submitStatus}</p>}
    </div>
  )
}

export default QuickAddForm