import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<App/>}/>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
