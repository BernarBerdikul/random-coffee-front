import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles.css'
import { AppShell } from './app/layouts'
import { HomePage } from './pages/home/ui/HomePage'
import { SettingsPage } from './pages/settings/ui/SettingsPage'
import { RandomCoffeePage } from './pages/random-coffee/ui/RandomCoffeePage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'random-coffee', element: <RandomCoffeePage /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)

