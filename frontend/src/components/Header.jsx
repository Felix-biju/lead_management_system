import React from 'react'

const Header = ({ activeTab, currentUser, onLogout }) => {
  const displayTitle = activeTab === 'Leads' ? 'Live Database' : activeTab

  // Safety check: if currentUser is somehow missing, don't crash the header!
  if (!currentUser) return null; 

  return (
    <div style={{ height: '70px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0 }}>
      <h2 style={{ margin: 0, fontSize: '1.4em', color: '#0f172a', fontWeight: '600' }}>{displayTitle}</h2>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        {/* User Info */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#0f172a', fontSize: '0.95em', fontWeight: '600' }}>{currentUser.name}</div>
          <div style={{ color: '#3b82f6', fontSize: '0.75em', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{currentUser.role}</div>
        </div>
        
        {/* Avatar & Action Container */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '20px', borderLeft: '2px solid #f1f5f9' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2em' }}>
            👨🏻‍💻
          </div>
          
          <button 
            onClick={onLogout}
            style={{ 
              backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', 
              padding: '8px 16px', borderRadius: '6px', fontSize: '0.85em', 
              fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#fecaca'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#fee2e2'}
          >
            Sign Out
          </button>
        </div>

      </div>
    </div>
  )
}

export default Header