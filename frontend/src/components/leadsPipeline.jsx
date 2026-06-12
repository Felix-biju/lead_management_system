import React, { useState, useEffect } from 'react'
import axios from 'axios'

const SortHeader = ({ label, sortKey, sortConfig, requestSort }) => (
  <th onClick={() => requestSort(sortKey)} style={{ padding: '16px 24px', fontWeight: '600', borderBottom: '1px solid #e2e8f0', cursor: 'pointer', userSelect: 'none' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {label}
      {sortConfig.key === sortKey && <span style={{ color: '#3b82f6' }}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
    </div>
  </th>
)

const LeadsPipeline = ({ leads, users, activeLead, setActiveLead, handleStageChange, handleOwnerChange, handleSelectLeadNotes, notes, setNotes }) => {
  // Moved all this state out of App.jsx!
  const [searchTerm, setSearchTerm] = useState('')
  const [agentFilter, setAgentFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState({ key: 'first_name', direction: 'asc' })
  const [newNote, setNewNote] = useState('')
  const leadsPerPage = 5

  useEffect(() => { setCurrentPage(1) }, [searchTerm, agentFilter])

  const exportToCSV = () => {
    const headers = ["First Name", "Last Name", "Email", "Phone", "Stage", "Owner ID"]
    const csvRows = [headers.join(",")]
    filteredLeads.forEach(lead => {
      const row = [lead.first_name, lead.last_name, lead.email, lead.phone, lead.stage, lead.owner_id || "Unassigned"]
      csvRows.push(row.map(value => `"${value}"`).join(","))
    })
    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `LMS_Export_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const requestSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc'
    setSortConfig({ key, direction })
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

  const filteredLeads = leads.filter(lead => {
    const fullName = `${lead.first_name} ${lead.last_name}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAgent = agentFilter === '' || lead.owner_id === agentFilter
    return matchesSearch && matchesAgent
  })

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const indexOfLastLead = currentPage * leadsPerPage
  const indexOfFirstLead = indexOfLastLead - leadsPerPage
  const currentLeads = sortedLeads.slice(indexOfFirstLead, indexOfLastLead)
  const totalPages = Math.ceil(sortedLeads.length / leadsPerPage)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
          <button onClick={exportToCSV} style={{ padding: '8px 16px', background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9em', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
            📥 Export CSV
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input type="text" placeholder="🔍 Search leads..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '300px', outline: 'none' }} />
            <select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)} style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer', outline: 'none' }}>
              <option value="">All Agents</option>
              {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
            </select>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#fff', color: '#64748b', fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <SortHeader label="Name" sortKey="first_name" sortConfig={sortConfig} requestSort={requestSort} />
              <SortHeader label="Stage" sortKey="stage" sortConfig={sortConfig} requestSort={requestSort} />
              <SortHeader label="Owner" sortKey="owner_id" sortConfig={sortConfig} requestSort={requestSort} />
              <th style={{ padding: '16px 24px', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentLeads.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No records match your criteria.</td></tr>
            ) : (
              currentLeads.map((lead) => (
                <tr key={lead.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: activeLead?.id === lead.id ? '#f8fafc' : '#fff', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '4px', fontSize: '1.05em' }}>{lead.first_name} {lead.last_name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.9em' }}>{lead.email} • {lead.phone}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <select value={lead.stage} onChange={(e) => handleStageChange(lead.id, e.target.value)} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#334155', fontWeight: '500', fontSize: '0.9em', cursor: 'pointer', outline: 'none' }}>
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Interested">Interested</option>
                      <option value="Negotiating">Negotiating</option>
                      <option value="Closed Won">Closed Won</option>
                      <option value="Closed Lost">Closed Lost</option>
                    </select>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <select value={lead.owner_id || ""} onChange={(e) => handleOwnerChange(lead.id, e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid transparent', color: '#0f172a', fontWeight: '500', fontSize: '0.9em', cursor: 'pointer', backgroundColor: lead.owner_id ? '#dcfce7' : '#f1f5f9', outline: 'none' }}>
                      <option value="">Unassigned</option>
                      {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <button onClick={() => handleSelectLeadNotes(lead)} style={{ padding: '8px 16px', background: '#fff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9em', fontWeight: '600' }}>View Notes</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
          <span style={{ color: '#64748b', fontSize: '0.9em', fontWeight: '500' }}>
            Showing {indexOfFirstLead + 1} to {Math.min(indexOfLastLead, sortedLeads.length)} of {sortedLeads.length} leads
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: currentPage === 1 ? '#f1f5f9' : '#fff', color: currentPage === 1 ? '#94a3b8' : '#0f172a', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: '600' }}>Previous</button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: currentPage === totalPages || totalPages === 0 ? '#f1f5f9' : '#fff', color: currentPage === totalPages || totalPages === 0 ? '#94a3b8' : '#0f172a', cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer', fontWeight: '600' }}>Next</button>
          </div>
        </div>
      </div>

      {activeLead && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.2em' }}>Activity Log: <span style={{ color: '#3b82f6' }}>{activeLead.first_name} {activeLead.last_name}</span></h3>
            <button onClick={() => setActiveLead(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.2em', cursor: 'pointer', color: '#64748b' }}>✖</button>
          </div>
          <div style={{ padding: '24px' }}>
            <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <input type="text" placeholder="Log a call, email, or meeting note..." value={newNote} onChange={(e) => setNewNote(e.target.value)} required style={{ flex: 1, padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1em', backgroundColor: '#f8fafc' }} />
              <button type="submit" style={{ padding: '0 32px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1em' }}>Save Note</button>
            </form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
              {notes.length === 0 ? <p style={{ color: '#94a3b8', margin: 0, fontStyle: 'italic', textAlign: 'center', padding: '30px 0' }}>No activity logged yet.</p> : notes.map(note => (
                <div key={note.id} style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #cbd5e1' }}>
                  <p style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '1em', lineHeight: '1.5' }}>{note.content}</p>
                  <small style={{ color: '#64748b', fontSize: '0.85em' }}>Logged by <strong style={{ color: '#475569' }}>{note.author}</strong> on {new Date(note.created_at).toLocaleString()}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeadsPipeline