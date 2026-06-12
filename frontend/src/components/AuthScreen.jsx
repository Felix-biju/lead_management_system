import React, { useState } from 'react'
import axios from 'axios'

const AuthScreen = ({ onLogin }) => {
  // We upgraded state from a boolean to a string to handle 4 different views
  const [view, setView] = useState('login') // 'login', 'register', 'forgot', 'reset'
  const [formData, setFormData] = useState({ name: '', email: '', password: '', token: '' })
  const [notification, setNotification] = useState(null)

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setNotification(null)
    
    try {
      if (view === 'register') {
        await axios.post('http://127.0.0.1:8000/api/auth/register', formData)
        setNotification({ type: 'success', msg: "Registration successful! You can now sign in." })
        setView('login')
        
      } else if (view === 'login') {
        const response = await axios.post('http://127.0.0.1:8000/api/auth/login', {
          email: formData.email, password: formData.password
        })
        onLogin(response.data) 
        
      } else if (view === 'forgot') {
        await axios.post('http://127.0.0.1:8000/api/auth/forgot-password', { email: formData.email })
        setNotification({ type: 'success', msg: "If an account exists, a reset token was sent to your terminal." })
        setView('reset')
        
      } else if (view === 'reset') {
        await axios.post('http://127.0.0.1:8000/api/auth/reset-password', {
          token: formData.token, new_password: formData.password
        })
        setNotification({ type: 'success', msg: "Password successfully changed! Please sign in." })
        setView('login')
      }
    } catch (error) {
      setNotification({ type: 'error', msg: error.response?.data?.detail || "An error occurred." })
    }
  }

  // Helper to change titles dynamically
  const getTitle = () => {
    if (view === 'register') return 'Create your account'
    if (view === 'forgot') return 'Reset your password'
    if (view === 'reset') return 'Enter new password'
    return 'Sign in to your dashboard'
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ width: '400px', backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', fontSize: '1.2em' }}>⚡️</div>
          <h2 style={{ margin: 0, fontSize: '1.5em', fontWeight: '800', color: '#0f172a' }}>LMS Pro</h2>
        </div>

        <h3 style={{ textAlign: 'center', color: '#334155', marginBottom: '24px' }}>{getTitle()}</h3>

        {notification && (
          <div style={{ padding: '12px', marginBottom: '20px', borderRadius: '8px', backgroundColor: notification.type === 'success' ? '#dcfce7' : '#fee2e2', color: notification.type === 'success' ? '#166534' : '#991b1b', fontSize: '0.9em', textAlign: 'center', fontWeight: '500' }}>
            {notification.msg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {view === 'register' && (
            <input name="name" type="text" placeholder="Full Name" value={formData.name} onChange={handleChange} required style={{ padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#f8fafc', fontSize: '1em' }} />
          )}
          
          {(view === 'login' || view === 'register' || view === 'forgot') && (
            <input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required style={{ padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#f8fafc', fontSize: '1em' }} />
          )}

          {view === 'reset' && (
            <input name="token" type="text" placeholder="Paste Token Here" value={formData.token} onChange={handleChange} required style={{ padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#f8fafc', fontSize: '1em', fontFamily: 'monospace' }} />
          )}

          {(view === 'login' || view === 'register' || view === 'reset') && (
            <input name="password" type="password" placeholder={view === 'reset' ? "New Password" : "Password"} value={formData.password} onChange={handleChange} required style={{ padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#f8fafc', fontSize: '1em' }} />
          )}
          
          {view === 'login' && (
            <div style={{ textAlign: 'right' }}>
              <span onClick={() => { setView('forgot'); setNotification(null); }} style={{ color: '#3b82f6', fontSize: '0.85em', fontWeight: '600', cursor: 'pointer' }}>Forgot password?</span>
            </div>
          )}

          <button type="submit" style={{ padding: '14px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', marginTop: '8px', fontSize: '1em' }}>
            {view === 'register' ? 'Register Account' : view === 'forgot' ? 'Send Reset Link' : view === 'reset' ? 'Change Password' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9em', color: '#64748b' }}>
          {view === 'login' ? (
            <>Don't have an account? <span onClick={() => { setView('register'); setNotification(null); }} style={{ color: '#3b82f6', fontWeight: '600', cursor: 'pointer' }}>Create one</span></>
          ) : (
            <><span onClick={() => { setView('login'); setNotification(null); }} style={{ color: '#3b82f6', fontWeight: '600', cursor: 'pointer' }}>← Back to Sign In</span></>
          )}
        </div>
        
      </div>
    </div>
  )
}

export default AuthScreen