import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: ''
  })
  const [submitStatus, setSubmitStatus] = useState(null)
  const [leads, setLeads] = useState([])

  const fetchLeads = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/leads')
      setLeads(response.data)
    } catch (error) {
      console.error("Error fetching leads:", error)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault() 
    setSubmitStatus("Saving...")
    
    try {
      await axios.post('http://127.0.0.1:8000/api/leads', formData)
      setSubmitStatus("✅ Lead captured successfully!")
      setFormData({ first_name: '', last_name: '', email: '', phone: '' })
      fetchLeads()
    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        setSubmitStatus(`🚨 ${error.response.data.detail}`)
      } else {
        setSubmitStatus("🚨 Error capturing lead. Check the console.")
      }
    }
  }

  // NEW: Function to handle stage changes from the dropdown
  const handleStageChange = async (leadId, newStage) => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/leads/${leadId}/stage`, { stage: newStage })
      fetchLeads() // Instantly refresh the table to show the new stage
    } catch (error) {
      console.error("Error updating stage:", error)
      alert("Failed to update stage.")
    }
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Lead Management System</h1>
      
      <div style={{ display: 'flex', gap: '50px', marginTop: '30px' }}>
        
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h3>Enter New Lead</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required style={{ padding: '8px' }}/>
            <input name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required style={{ padding: '8px' }}/>
            <input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required style={{ padding: '8px' }}/>
            <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required style={{ padding: '8px' }}/>
            <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Submit Lead
            </button>
          </form>
          {submitStatus && <p style={{ marginTop: '15px', fontWeight: 'bold' }}>{submitStatus}</p>}
        </div>

        <div style={{ flex: '2' }}>
          <h3>Live Leads Database</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ccc' }}>
                <th style={{ padding: '10px' }}>Name</th>
                <th style={{ padding: '10px' }}>Email</th>
                <th style={{ padding: '10px' }}>Phone</th>
                <th style={{ padding: '10px' }}>Stage</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: '10px' }}>No leads found.</td></tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>{lead.first_name} {lead.last_name}</td>
                    <td style={{ padding: '10px' }}>{lead.email}</td>
                    <td style={{ padding: '10px' }}>{lead.phone}</td>
                    <td style={{ padding: '10px' }}>
                      
                      {/* NEW: Interactive Dropdown Menu */}
                      <select 
                        value={lead.stage} 
                        onChange={(e) => handleStageChange(lead.id, e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Interested">Interested</option>
                        <option value="Negotiating">Negotiating</option>
                        <option value="Closed">Closed</option>
                      </select>

                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}

export default App