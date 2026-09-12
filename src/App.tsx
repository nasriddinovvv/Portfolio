import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import ProjectsAdmin from './pages/admin/ProjectsAdmin'
import SkillsAdmin from './pages/admin/SkillsAdmin'
import ExperienceAdmin from './pages/admin/ExperienceAdmin'
import MessagesAdmin from './pages/admin/MessagesAdmin'
import SettingsAdmin from './pages/admin/SettingsAdmin'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<ProjectsAdmin />} />
        <Route path="skills" element={<SkillsAdmin />} />
        <Route path="experience" element={<ExperienceAdmin />} />
        <Route path="messages" element={<MessagesAdmin />} />
        <Route path="settings" element={<SettingsAdmin />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
