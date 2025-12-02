'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  MessageSquare, 
  Link as LinkIcon, 
  Users, 
  Settings,
  GraduationCap,
  Search
} from 'lucide-react';
import DarkModeToggle from './ui/DarkModeToggle';
import SearchBar from './SearchBar';

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/resources', label: 'Recursos', icon: FileText },
    { href: '/admin/activities', label: 'Actividades', icon: BookOpen },
    { href: '/admin/responses', label: 'Respuestas', icon: MessageSquare },
    { href: '/admin/links', label: 'Enlaces', icon: LinkIcon },
    { href: '/admin/sessions', label: 'Sesiones', icon: Users },
    { href: '/admin/settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <aside className="w-[260px] h-full bg-surface dark:bg-gray-900 border-r border-border dark:border-gray-800 flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-border dark:border-gray-800">
        <Link href="/admin/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:bg-primary-dark transition-colors">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Formador
          </span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-border dark:border-gray-800">
        <SearchBar placeholder="Buscar actividades, recursos..." />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3
                    px-3 py-2.5
                    rounded-xl
                    text-sm font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary dark:text-primary-light' : ''}`} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer with Dark Mode Toggle and Logout */}
      <div className="p-4 border-t border-border dark:border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted dark:text-gray-500">Tema</span>
          <DarkModeToggle />
        </div>
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('formador_admin');
              window.location.href = '/';
            }
          }}
          className="w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-left"
        >
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}

