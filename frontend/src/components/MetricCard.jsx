import React from 'react'

const MetricCard = ({ title, value, color }) => (
  <div style={{ flex: 1, padding: '24px', borderRadius: '12px', backgroundColor: '#fff', borderLeft: `5px solid ${color}`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
    <h4 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h4>
    <p style={{ margin: 0, fontSize: '2.5em', fontWeight: '800', color: '#0f172a' }}>{value}</p>
  </div>
)

export default MetricCard