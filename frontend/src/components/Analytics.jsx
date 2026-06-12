import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const ChartCard = ({ title, children }) => (
  <div style={{ flex: 1, backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', minWidth: '400px' }}>
    <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '1.1em' }}>{title}</h3>
    <div style={{ height: '300px' }}>{children}</div>
  </div>
)

const Analytics = ({ leads, users }) => {
  const kpis = {
    won: leads.filter(l => l.stage === 'Closed Won').length,
    lost: leads.filter(l => l.stage === 'Closed Lost').length
  }

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

  return (
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
  )
}

export default Analytics