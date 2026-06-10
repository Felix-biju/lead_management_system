import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: ''
  })
  const [submitStatus, setSubmitStatus] = useState(null)
  
  const [leads, setLeads] = useState([])
  const [users, setUsers] = useState([]) 
  const [searchTerm, setSearchTerm] = useState('')
  const [agentFilter, setAgentFilter] = useState('')

  // --- NEW: Notes States ---
  const [activeLead, setActiveLead] = useState(null)
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')

  const fetchData = async () => {
    try {
      const [leadsRes, usersRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/leads'),
        axios.get('http://127.0.0.1:8000/api/users')
      ])
      setLeads(leadsRes.data)
      setUsers(usersRes.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // NEW: Fetch notes for a specific lead
  const handleSelectLeadNotes = async (lead) => {
    setActiveLead(lead)
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/leads/${lead.id}/notes`)
      setNotes(response.data)
    } catch (error) {
      console.error("Error fetching notes:", error)
    }
  }

  // NEW: Submit a fresh note to the database
  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!newNote.trim()) return

    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/leads/${activeLead.id}/notes`, {
        content: newNote,
        author: "Agent"
      })
      setNotes([response.data, ...notes]) // Instantly push new note to top of list
      setNewNote('')
    } catch (error) {
      alert("Failed to save note.")
    }
  }

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
      fetchData()
    } catch (error) {
      if (error.response?.data?.detail) {
        setSubmitStatus(`🚨 ${error.response.data.detail}`)
      } else {
        setSubmitStatus("🚨 Error capturing lead.")
      }
    }
  }

  const handleStageChange = async (leadId, newStage) => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/leads/${leadId}/stage`, { stage: newStage })
      fetchData() 
      if (activeLead && activeLead.id === leadId) {
        setActiveLead({ ...activeLead, stage: newStage })
      }
    } catch (error) {
      alert("Failed to update stage.")
    }
  }

  const handleOwnerChange = async (leadId, newOwnerId) => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/leads/${leadId}/owner`, { owner_id: newOwnerId })
      fetchData()
    } catch (error) {
      alert("Failed to assign agent.")
    }
  }

  const kpis = {
    new: leads.filter(l => l.stage === 'New').length,
    active: leads.filter(l => ['Contacted', 'Interested', 'Negotiating'].includes(l.stage)).length,
    won: leads.filter(l => l.stage === 'Closed Won').length,
    lost: leads.filter(l => l.stage === 'Closed Lost').length
  }

  const filteredLeads = leads.filter(lead => {
    const fullName = `${lead.first_name} ${lead.last_name}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAgent = agentFilter === '' || lead.owner_id === agentFilter
    return matchesSearch && matchesAgent
  })

  const MetricCard = ({ title, value, color }) => (
    <div style={{ flex: 1, padding: '20px', borderRadius: '8px', borderTop: `4px solid ${color}`, backgroundColor: '#f8fafc', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '0.9em', textTransform: 'uppercase' }}>{title}</h4>
      <p style={{ margin: 0, fontSize: '2em', fontWeight: 'bold', color: '#0f172a' }}>{value}</p>
    </div>
  )

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px' }}>Lead Management System</h1>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <MetricCard title="New Pipeline" value={kpis.new} color="#3b82f6" />
        <MetricCard title="Active Engagements" value={kpis.active} color="#eab308" />
        <MetricCard title="Deals Won" value={kpis.won} color="#22c55e" />
        <MetricCard title="Deals Lost" value={kpis.lost} color="#ef4444" />
      </div>
      
      <div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h3>Enter New Lead</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required style={{ padding: '8px' }}/>
            <input name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required style={{ padding: '8px' }}/>
            <input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required style={{ padding: '8px' }}/>
            <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required style={{ padding: '8px' }}/>
            <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Submit Lead</button>
          </form>
          {submitStatus && <p style={{ marginTop: '15px', fontWeight: 'bold' }}>{submitStatus}</p>}
        </div>

        <div style={{ flex: '2.5' }}>
          <h3>Live Leads Database</h3>
          
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <input 
              type="text" 
              placeholder="🔍 Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 2, padding: '10px', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#fff', color: '#0f172a', fontWeight: '500' }}
            />
            
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#fff', color: '#0f172a', fontWeight: '500', cursor: 'pointer' }}
            >
              <option value="">All Agents</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>Only {user.name}</option>
              ))}
            </select>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ccc' }}>
                <th style={{ padding: '10px' }}>Name</th>
                <th style={{ padding: '10px' }}>Contact</th>
                <th style={{ padding: '10px' }}>Stage</th>
                <th style={{ padding: '10px' }}>Agent</th>
                <th style={{ padding: '10px' }}>Actions</th> {/* NEW HEAD */}
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No matching leads found.</td></tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid #444', backgroundColor: activeLead?.id === lead.id ? '#1e293b' : 'transparent' }}>
                    <td style={{ padding: '10px' }}><strong>{lead.first_name} {lead.last_name}</strong></td>
                    <td style={{ padding: '10px', fontSize: '0.9em' }}>{lead.email}<br/>{lead.phone}</td>
                    
                    <td style={{ padding: '10px' }}>
                      <select 
                        value={lead.stage} 
                        onChange={(e) => handleStageChange(lead.id, e.target.value)}
                        style={{ padding: '4px', borderRadius: '4px', color: '#0f172a', backgroundColor: '#fff', fontWeight: '500' }}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Interested">Interested</option>
                        <option value="Negotiating">Negotiating</option>
                        <option value="Closed Won">Closed Won</option>
                        <option value="Closed Lost">Closed Lost</option>
                      </select>
                    </td>
                    
                    <td style={{ padding: '10px' }}>
                      <select 
                        value={lead.owner_id || ""} 
                        onChange={(e) => handleOwnerChange(lead.id, e.target.value)}
                        style={{ padding: '4px', borderRadius: '4px', color: '#0f172a', fontWeight: '500', backgroundColor: lead.owner_id ? '#dcfce7' : '#fff' }}
                      >
                        <option value="">Unassigned</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                      </select>
                    </td>

                    {/* NEW COLUMN: Action button to open activity log */}
                    <td style={{ padding: '10px' }}>
                      <button 
                        onClick={() => handleSelectLeadNotes(lead)}
                        style={{ padding: '6px 10px', background: '#475569', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em' }}
                      >
                        📝 Notes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- NEW SECTION: LIVE ACTIVITY NOTES LOGGER --- */}
      {activeLead && (
        <div style={{ padding: '25px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          
          {/* UPDATED: Flex row to hold the title and the close button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: '#0f172a' }}>
              Activity Log: <span style={{ color: '#007bff' }}>{activeLead.first_name} {activeLead.last_name}</span> 
              <span style={{ fontSize: '0.7em', padding: '3px 8px', background: '#cbd5e1', borderRadius: '10px', marginLeft: '10px', color: '#334155' }}>{activeLead.stage}</span>
            </h3>
            
            {/* NEW: The Close Button */}
            <button 
              onClick={() => setActiveLead(null)} 
              style={{ background: 'transparent', border: 'none', fontSize: '1.5em', cursor: 'pointer', color: '#94a3b8', padding: '0 5px' }}
              title="Close Notes"
            >
              ✖
            </button>
          </div>

          <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input 
              type="text" 
              placeholder="Type a vital timeline update (e.g., 'Called client, scheduled a product demo next Tuesday')..." 
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', color: '#0f172a', fontWeight: '500', backgroundColor: '#fff' }}
              required
            />
            <button type="submit" style={{ padding: '10px 20px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Save Note
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
            {notes.length === 0 ? (
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.95em', fontStyle: 'italic' }}>No logged activity updates for this lead yet.</p>
            ) : (
              notes.map(note => (
                <div key={note.id} style={{ padding: '12px', backgroundColor: '#fff', borderRadius: '6px', borderLeft: '4px solid #94a3b8', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                  <p style={{ margin: '0 0 5px 0', color: '#334155', fontWeight: '500', fontSize: '0.95em' }}>{note.content}</p>
                  <small style={{ color: '#94a3b8' }}>
                    Logged by <strong>{note.author}</strong> on {new Date(note.created_at).toLocaleString()}
                  </small>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default App