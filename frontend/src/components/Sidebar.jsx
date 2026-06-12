import React from 'react'

const NavItem = ({ icon, label, active, onClick }) => (
  <div onClick={onClick} style={{ padding: '12px 20px', margin: '8px 16px', borderRadius: '8px', backgroundColor: active ? '#1e293b' : 'transparent', color: active ? '#fff' : '#94a3b8', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center', fontWeight: '500', transition: 'all 0.2s' }}>
    <span style={{ fontSize: '1.2em' }}>{icon}</span>
    <span>{label}</span>
  </div>
)

const Sidebar = ({ activeTab, setActiveTab, currentUser }) => {
  return (
    <div style={{ width: '260px', backgroundColor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #1e293b', marginBottom: '16px' }}>
        <div style={{ width: '32px', height: '32px', backgroundColor: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>⚡️</div>
        <h2 style={{ margin: 0, fontSize: '1.2em', fontWeight: '700', tracking: 'tight' }}>LMS Pro</h2>
      </div>
      
      <div style={{ flex: 1 }}>
        <NavItem icon="📊" label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
        <NavItem icon="👥" label="Leads Pipeline" active={activeTab === 'Leads'} onClick={() => setActiveTab('Leads')} />
        <NavItem icon="📋" label="Kanban Board" active={activeTab === 'Kanban'} onClick={() => setActiveTab('Kanban')} />
        <NavItem icon="📈" label="Analytics" active={activeTab === 'Analytics'} onClick={() => setActiveTab('Analytics')} />
        
        {/* --- THE RBAC LOCK --- */}
        {/* Only render this button if the user is an Admin! */}
        {currentUser?.role === 'Admin' && (
          <NavItem icon="⚙️" label="Admin Settings" active={activeTab === 'Settings'} onClick={() => setActiveTab('Settings')} />
        )}
      </div>
    </div>
  )
}

export default Sidebar