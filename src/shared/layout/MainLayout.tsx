import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export function MainLayout() {
  return (
    <div className="flex h-screen w-screen print:block print:h-auto">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden print:block">
        <Navbar />
        <main className="flex-1 overflow-auto bg-gray-50 p-6 print:overflow-visible print:bg-white print:p-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
