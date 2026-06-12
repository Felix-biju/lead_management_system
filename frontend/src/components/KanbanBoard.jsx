import React from 'react'

const KanbanBoard = ({ leads, handleStageChange, handleSelectLeadNotes }) => {
  const stages = ['New', 'Contacted', 'Interested', 'Negotiating', 'Closed Won', 'Closed Lost']

  // --- NATIVE HTML5 DRAG & DROP LOGIC ---
  const onDragStart = (e, leadId) => {
    // When the user grabs a card, we store the Lead's ID in the browser's drag memory
    e.dataTransfer.setData('leadId', leadId)
  }

  const onDragOver = (e) => {
    // This is required by HTML5 to allow a "drop" to happen in this container
    e.preventDefault()
  }

  const onDrop = (e, newStage) => {
    // When the user drops the card, we read the ID and trigger your database update
    const leadId = e.dataTransfer.getData('leadId')
    handleStageChange(leadId, newStage)
  }

  // Define colors for the cards based on stage
  const getBorderColor = (stage) => {
    if (stage === 'Closed Won') return '#22c55e'
    if (stage === 'Closed Lost') return '#ef4444'
    if (stage === 'Negotiating') return '#eab308'
    return '#3b82f6'
  }

  return (
    <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px', height: 'calc(100vh - 180px)', alignItems: 'flex-start' }}>
      
      {/* We map through the 6 stages and create a column for each one */}
      {stages.map(stage => (
        <div 
          key={stage} 
          onDragOver={onDragOver} 
          onDrop={(e) => onDrop(e, stage)}
          style={{ minWidth: '300px', backgroundColor: '#e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '100%' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#475569', fontSize: '0.9em', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>{stage}</h3>
            <span style={{ backgroundColor: '#cbd5e1', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8em', color: '#334155', fontWeight: 'bold' }}>
              {leads.filter(l => l.stage === stage).length}
            </span>
          </div>

          {/* The scrollable area for the cards inside the column */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
            
            {leads.filter(lead => lead.stage === stage).map(lead => (
              <div 
                key={lead.id} 
                draggable 
                onDragStart={(e) => onDragStart(e, lead.id)}
                style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', cursor: 'grab', borderLeft: `4px solid ${getBorderColor(stage)}`, transition: 'transform 0.1s' }}
                onDragEnd={(e) => e.target.style.opacity = '1'}
              >
                <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '1.05em' }}>{lead.first_name} {lead.last_name}</div>
                <div style={{ color: '#64748b', fontSize: '0.85em', marginTop: '4px', marginBottom: '12px' }}>{lead.email}</div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75em', padding: '4px 8px', background: lead.owner_id ? '#dcfce7' : '#f1f5f9', color: lead.owner_id ? '#166534' : '#64748b', borderRadius: '4px', fontWeight: '600' }}>
                    {lead.owner_id ? 'Assigned' : 'Unassigned'}
                  </span>
                  <button 
                    onClick={() => handleSelectLeadNotes(lead)} 
                    style={{ fontSize: '0.8em', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'transparent', cursor: 'pointer', color: '#3b82f6', fontWeight: '600' }}
                  >
                    Notes
                  </button>
                </div>
              </div>
            ))}

          </div>
        </div>
      ))}
    </div>
  )
}

export default KanbanBoard