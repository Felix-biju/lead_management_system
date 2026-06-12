import { useState, useEffect } from 'react'
import axios from 'axios'

import Sidebar from './components/Sidebar'
import Header from './components/Header'
import MetricCard from './components/MetricCard'
import KanbanBoard from './components/KanbanBoard'
import QuickAddForm from './components/QuickAddForm'
import LeadsPipeline from './components/LeadsPipeline'
import Analytics from './components/Analytics'
import AuthScreen from './components/AuthScreen'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [leads, setLeads] = useState([])
  const [users, setUsers] = useState([]) 
  const [activeLead, setActiveLead] = useState(null)
  const [notes, setNotes] = useState([])

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

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/users/${userId}/role`, { role: newRole })
      fetchData() 
    } catch (error) { alert("Failed to update user role.") }
  }

  const handleSelectLeadNotes = async (lead) => {
    setActiveLead(lead)
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/leads/${lead.id}/notes`)
      setNotes(response.data)
    } catch (error) {}
  }

  const handleLogout = () => {
    setCurrentUser(null)
  }

  const kpis = {
    new: leads.filter(l => l.stage === 'New').length,
    active: leads.filter(l => ['Contacted', 'Interested', 'Negotiating'].includes(l.stage)).length,
    won: leads.filter(l => l.stage === 'Closed Won').length,
    lost: leads.filter(l => l.stage === 'Closed Lost').length
  }

  if (!currentUser) {
    return <AuthScreen onLogin={(userData) => setCurrentUser(userData)} />
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f1f5f9', margin: 0, overflow: 'hidden' }}>
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        <Header activeTab={activeTab} currentUser={currentUser} onLogout={handleLogout} />
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          
          {activeTab === 'Dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px' }}>
              <div style={{ display: 'flex', gap: '24px' }}>
                <MetricCard title="New Pipeline" value={kpis.new} color="#3b82f6" />
                <MetricCard title="Active Deals" value={kpis.active} color="#eab308" />
                <MetricCard title="Deals Won" value={kpis.won} color="#22c55e" />
                <MetricCard title="Deals Lost" value={kpis.lost} color="#ef4444" />
              </div>
              <QuickAddForm fetchData={fetchData} />
            </div>
          )}

          {activeTab === 'Leads' && (
            <LeadsPipeline 
              leads={leads} users={users} 
              activeLead={activeLead} setActiveLead={setActiveLead} 
              handleStageChange={handleStageChange} handleOwnerChange={handleOwnerChange} 
              handleSelectLeadNotes={handleSelectLeadNotes} notes={notes} setNotes={setNotes} 
            />
          )}

          {activeTab === 'Kanban' && (
            <KanbanBoard 
              leads={leads} 
              handleStageChange={handleStageChange} 
              handleSelectLeadNotes={handleSelectLeadNotes} 
            />
          )}

          {activeTab === 'Analytics' && (
            <Analytics leads={leads} users={users} />
          )}

          {activeTab === 'Settings' && (
            <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, color: '#0f172a' }}>User Management</h2>
                <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '0.9em' }}>Manage employee access levels and system permissions.</p>
              </div>

              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ color: '#64748b', fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <th style={{ padding: '12px 16px', borderBottom: '2px solid #e2e8f0' }}>Employee Name</th>
                    <th style={{ padding: '12px 16px', borderBottom: '2px solid #e2e8f0' }}>Email Address</th>
                    <th style={{ padding: '12px 16px', borderBottom: '2px solid #e2e8f0' }}>Current Role</th>
                    <th style={{ padding: '12px 16px', borderBottom: '2px solid #e2e8f0', textAlign: 'right' }}>Update Access</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '16px', fontWeight: '500', color: '#334155' }}>{u.name}</td>
                      <td style={{ padding: '16px', color: '#64748b', fontSize: '0.95em' }}>{u.email}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          padding: '6px 12px', 
                          borderRadius: '20px', 
                          fontSize: '0.85em', 
                          fontWeight: '600',
                          backgroundColor: u.role === 'Admin' ? '#fee2e2' : u.role === 'Manager' ? '#fef08a' : u.role === 'TL' ? '#dcfce7' : '#e0e7ff',
                          color: u.role === 'Admin' ? '#991b1b' : u.role === 'Manager' ? '#854d0e' : u.role === 'TL' ? '#166534' : '#3730a3'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <select 
                          value={u.role} 
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          disabled={u.id === currentUser.id} 
                          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: u.id === currentUser.id ? '#f1f5f9' : '#fff', cursor: u.id === currentUser.id ? 'not-allowed' : 'pointer', fontWeight: '500' }}
                        >
                          <option value="Agent">Agent</option>
                          <option value="TL">Team Lead</option>
                          <option value="Manager">Manager</option>
                          <option value="Admin">System Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default App