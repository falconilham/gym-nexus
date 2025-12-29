'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  Dumbbell, 
  Settings, 
  LogOut 
} from 'lucide-react';

const MENU_ITEMS = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Members', path: '/members', icon: Users },
    { name: 'Schedule', path: '/schedule', icon: CalendarDays },
    { name: 'Equipment', path: '/equipment', icon: Dumbbell },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-[#333] bg-[#0F0F0F]">
      <div className="flex h-16 items-center px-6 border-b border-[#333]">
        <h1 className="text-2xl font-black tracking-widest text-white">
          GYM<span className="text-[var(--primary)]">NEXUS</span>
        </h1>
      </div>

      <nav className="mt-6 px-3 space-y-2">
        {MENU_ITEMS.map((item) => {
            const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
                <Link 
                    key={item.path}
                    href={item.path} 
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                        isActive 
                        ? 'text-[var(--primary)] bg-[#1E1E1E] border border-[#333]' 
                        : 'text-gray-400 hover:bg-[#1E1E1E] hover:text-white'
                    }`}
                >
                    <Icon size={20} className={isActive ? 'text-[var(--primary)]' : 'text-gray-500'} />
                    {item.name}
                </Link>
            );
        })}
      </nav>

      <div className="absolute bottom-6 px-3 w-full">
        <Link 
          href="/settings" 
          className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
             pathname === '/settings' 
             ? 'text-[var(--primary)] bg-[#1E1E1E]' 
             : 'text-gray-400 hover:bg-[#1E1E1E] hover:text-white'
          }`}
        >
          <Settings size={20} />
          Settings
        </Link>
        <button 
          className="w-full mt-2 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-950/20 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}

