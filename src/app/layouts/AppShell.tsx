import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

export const AppShell: React.FC = () => {
  return (
    <div className="app-shell">
      <header className="header">
        <div className="logo">
          <div className="logo-badge">RC</div>
          <div>Random Coffee</div>
        </div>
        <nav className="nav">
          <NavLink to="/" end className={({isActive}) => isActive ? 'active' : ''}>Главная</NavLink>
          <NavLink to="/settings" className={({isActive}) => isActive ? 'active' : ''}>Настройки</NavLink>
        </nav>
      </header>
      <main>
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

