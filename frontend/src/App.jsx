import { useState, useEffect } from 'react'
import axios from 'axios'
// --- NEW: Charting Imports ---
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

function App() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('Dashboard') // NEW: Tab switching state
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', phone: '' })
  const [submitStatus, setSubmitStatus] = useState(null)
  const [leads, setLeads] = useState([])
  const [users, setUsers] = useState([]) 
  const [searchTerm, setSearchTerm] = useState('')
  const [agentFilter, setAgentFilter] = useState('')
  const [activeLead, setActiveLead] = useState(null)
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')

  // --- API CALLS ---
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

  useEffect(() => { fetchData() }, [])

  const handleSelectLeadNotes = async (lead) => {
    setActiveLead(lead)
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/leads/${lead.id}/notes`)
      setNotes(response.data)
    } catch (error) {}
  }

  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!newNote.trim()) return
    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/leads/${activeLead.id}/notes`, { content: newNote, author: "Admin" })
      setNotes([response.data, ...notes]) 
      setNewNote('')
    } catch (error) { alert("Failed to save note.") }
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault() 
    setSubmitStatus("Saving...")
    try {
      await axios.post('http://127.0.0.1:8000/api/leads', formData)
      setSubmitStatus("✅ Lead captured!")
      setFormData({ first_name: '', last_name: '', email: '', phone: '' })
      fetchData()
      setTimeout(() => setSubmitStatus(null), 3000)
    } catch (error) { setSubmitStatus("🚨 Error capturing lead.") }
  }

  const handleStageChange = async (leadId, newStage) => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/leads/${leadId}/stage`, { stage: newStage })
      fetchData() 
      if (activeLead && activeLead.id === leadId) setActiveLead({ ...activeLead, stage: newStage })
    } catch (error) { alert("Failed to update stage.") }
  }

  const handleOwnerChange = async (leadId, newOwnerId) => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/leads/${leadId}/owner`, { owner_id: newOwnerId })
      fetchData()
    } catch (error) { alert("Failed to assign agent.") }
  }

  // --- LOGIC ---
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

  // --- NEW: DATA MAPPING FOR CHARTS ---
  const stageData = [
    { name: 'New', count: leads.filter(l => l.stage === 'New').length },
    { name: 'Contacted', count: leads.filter(l => l.stage === 'Contacted').length },
    { name: 'Interested', count: leads.filter(l => l.stage === 'Interested').length },
    { name: 'Negotiating', count: leads.filter(l => l.stage === 'Negotiating').length }
  ]

  const winLossData = [
    { name: 'Won', value: kpis.won, color: '#22c55e' },
    { name: 'Lost', value: kpis.lost, color: '#ef4444' }
  ]

  const agentData = users.map(user => ({
    name: user.name,
    leads: leads.filter(l => l.owner_id === user.id).length
  }))

  // --- UI COMPONENTS ---
  const MetricCard = ({ title, value, color }) => (
    <div style={{ flex: 1, padding: '24px', borderRadius: '12px', backgroundColor: '#fff', borderLeft: `5px solid ${color}`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
      <h4 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h4>
      <p style={{ margin: 0, fontSize: '2.5em', fontWeight: '800', color: '#0f172a' }}>{value}</p>
    </div>
  )

  const NavItem = ({ icon, label, active, onClick }) => (
    <div onClick={onClick} style={{ padding: '12px 20px', margin: '8px 16px', borderRadius: '8px', backgroundColor: active ? '#1e293b' : 'transparent', color: active ? '#fff' : '#94a3b8', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center', fontWeight: '500', transition: 'all 0.2s' }}>
      <span style={{ fontSize: '1.2em' }}>{icon}</span>
      <span>{label}</span>
    </div>
  )

  const ChartCard = ({ title, children }) => (
    <div style={{ flex: 1, backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', minWidth: '400px' }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '1.1em' }}>{title}</h3>
      <div style={{ height: '300px' }}>{children}</div>
    </div>
  )

  // --- RENDER ---
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f1f5f9', margin: 0, overflow: 'hidden' }}>
      
      {/* 1. SIDEBAR */}
      <div style={{ width: '260px', backgroundColor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #1e293b', marginBottom: '16px' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>⚡️</div>
          <h2 style={{ margin: 0, fontSize: '1.2em', fontWeight: '700', tracking: 'tight' }}>LMS Pro</h2>
        </div>
        
        <div style={{ flex: 1 }}>
          {/* UPDATED: Nav items now change state */}
          <NavItem icon="📊" label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
          <NavItem icon="📈" label="Analytics" active={activeTab === 'Analytics'} onClick={() => setActiveTab('Analytics')} />
          <NavItem icon="⚙️" label="Settings" active={activeTab === 'Settings'} onClick={() => setActiveTab('Settings')} />
        </div>
      </div>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Top Header */}
        <div style={{ height: '70px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: '1.4em', color: '#0f172a', fontWeight: '600' }}>{activeTab}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#64748b', fontSize: '0.9em', fontWeight: '500' }}>Welcome back, Felix</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2em' }}>👨🏻‍💻</div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          
          {/* --- VIEW: DASHBOARD --- */}
          {activeTab === 'Dashboard' && (
            <>
              <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
                <MetricCard title="New Pipeline" value={kpis.new} color="#3b82f6" />
                <MetricCard title="Active Deals" value={kpis.active} color="#eab308" />
                <MetricCard title="Deals Won" value={kpis.won} color="#22c55e" />
                <MetricCard title="Deals Lost" value={kpis.lost} color="#ef4444" />
              </div>
              
              <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
                <div style={{ width: '320px', backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', flexShrink: 0 }}>
                  <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '1.1em' }}>⚡️ Quick Add Lead</h3>
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}/>
                    <input name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}/>
                    <input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}/>
                    <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}/>
                    <button type="submit" style={{ padding: '12px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', marginTop: '8px' }}>Add to Pipeline</button>
                  </form>
                  {submitStatus && <p style={{ marginTop: '16px', fontSize: '0.9em', color: submitStatus.includes('✅') ? '#059669' : '#dc2626', fontWeight: '500' }}>{submitStatus}</p>}
                </div>

                <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                    <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1em' }}>Live Database</h3>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <input type="text" placeholder="🔍 Search leads..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '250px', outline: 'none' }} />
                      <select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer', outline: 'none' }}>
                        <option value="">All Agents</option>
                        {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#fff', color: '#64748b', fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <th style={{ padding: '16px 24px', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Name & Contact</th>
                        <th style={{ padding: '16px 24px', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Stage</th>
                        <th style={{ padding: '16px 24px', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Owner</th>
                        <th style={{ padding: '16px 24px', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.length === 0 ? (
                        <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No records match your criteria.</td></tr>
                      ) : (
                        filteredLeads.map((lead) => (
                          <tr key={lead.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: activeLead?.id === lead.id ? '#f8fafc' : '#fff', transition: 'background-color 0.2s' }}>
                            <td style={{ padding: '16px 24px' }}><div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>{lead.first_name} {lead.last_name}</div><div style={{ color: '#64748b', fontSize: '0.85em' }}>{lead.email} • {lead.phone}</div></td>
                            <td style={{ padding: '16px 24px' }}>
                              <select value={lead.stage} onChange={(e) => handleStageChange(lead.id, e.target.value)} style={{ padding: '6px 10px', borderRadius: '20px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#334155', fontWeight: '500', fontSize: '0.9em', cursor: 'pointer', outline: 'none' }}>
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Interested">Interested</option>
                                <option value="Negotiating">Negotiating</option>
                                <option value="Closed Won">Closed Won</option>
                                <option value="Closed Lost">Closed Lost</option>
                              </select>
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                              <select value={lead.owner_id || ""} onChange={(e) => handleOwnerChange(lead.id, e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid transparent', color: '#0f172a', fontWeight: '500', fontSize: '0.9em', cursor: 'pointer', backgroundColor: lead.owner_id ? '#dcfce7' : '#f1f5f9', outline: 'none' }}>
                                <option value="">Unassigned</option>
                                {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                              </select>
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                              <button onClick={() => handleSelectLeadNotes(lead)} style={{ padding: '6px 12px', background: '#fff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9em', fontWeight: '500' }}>View Notes</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {activeLead && (
                <div style={{ marginTop: '32px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                  <div style={{ padding: '20px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1em' }}>Activity Log: <span style={{ color: '#3b82f6' }}>{activeLead.first_name} {activeLead.last_name}</span></h3>
                    <button onClick={() => setActiveLead(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.2em', cursor: 'pointer', color: '#64748b' }}>✖</button>
                  </div>
                  <div style={{ padding: '24px' }}>
                    <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                      <input type="text" placeholder="Log a call, email, or meeting note..." value={newNote} onChange={(e) => setNewNote(e.target.value)} required style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95em' }} />
                      <button type="submit" style={{ padding: '0 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Save Note</button>
                    </form>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                      {notes.length === 0 ? <p style={{ color: '#94a3b8', margin: 0, fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>No activity logged yet.</p> : notes.map(note => (
                        <div key={note.id} style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #cbd5e1' }}>
                          <p style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '0.95em', lineHeight: '1.4' }}>{note.content}</p>
                          <small style={{ color: '#64748b', fontSize: '0.85em' }}>Logged by <strong style={{ color: '#475569' }}>{note.author}</strong> on {new Date(note.created_at).toLocaleString()}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* --- VIEW: ANALYTICS --- */}
          {activeTab === 'Analytics' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
              
              <ChartCard title="Active Pipeline Distribution">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stageData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Win / Loss Ratio">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={winLossData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                      {winLossData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Leads by Agent">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agentData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#0f172a', fontWeight: 500, fontSize: 14}} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="leads" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

            </div>
          )}

          {/* --- VIEW: SETTINGS --- */}
          {activeTab === 'Settings' && (
            <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>
              <h3>Settings Configuration</h3>
              <p>Module coming soon.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default Apps