import React from 'react'
import { Link } from 'react-router-dom'

export const HomePage: React.FC = () => {
  return (
    <div>
      <div className="space-between" style={{marginBottom: 12}}>
        <h2 style={{margin: 0}}>Виджеты</h2>
        <span className="kbd">⌘ + K</span>
      </div>
      <div className="grid">
        <Link to="/random-coffee" className="card widget">
          <div className="badge">Beta</div>
          <div className="row" style={{gap: 12}}>
            <div className="logo-badge" style={{width: 40, height: 40}}>☕️</div>
            <div>
              <div style={{fontWeight: 700}}>Random Coffee</div>
              <div style={{color: 'var(--muted)'}}>Случайные группы для кофе-чатов</div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

