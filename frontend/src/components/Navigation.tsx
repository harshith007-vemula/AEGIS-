'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, AlertTriangle, Cpu, History, BarChart3, Settings, LogOut, Radio, User, BookOpen, ShieldAlert 
} from 'lucide-react';
import { api } from '@/lib/api';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [alertCount, setAlertCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get user details
    const user = api.auth.getCurrentUser();
    setCurrentUser(user);

    // Fetch active notifications
    if (user) {
      api.resources.getNotifications()
        .then(data => {
          const unread = data.filter((n: any) => !n.is_read).length;
          setAlertCount(unread);
        })
        .catch(() => {});
    }

    // Set up polling for alerts
    const interval = setInterval(() => {
      if (api.auth.getCurrentUser()) {
        api.resources.getNotifications()
          .then(data => {
            const unread = data.filter((n: any) => !n.is_read).length;
            setAlertCount(unread);
          })
          .catch(() => {});
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [pathname]);

  const handleLogout = () => {
    api.auth.logout();
    router.push('/auth/login');
  };

  const navItems = [
    { name: 'Command Center', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Emergency Console', path: '/emergency', icon: AlertTriangle, badge: alertCount },
    { name: 'Agent Monitor', path: '/agents', icon: Cpu },
    { name: 'Incident History', path: '/history', icon: History },
    { name: 'Analytics & Reports', path: '/analytics', icon: BarChart3 },
    { name: 'System Settings', path: '/settings', icon: Settings },
    { name: 'About Platform', path: '/about', icon: BookOpen },
  ];

  if (currentUser?.role === 'admin') {
    navItems.push({ name: 'Admin Portal', path: '/admin', icon: ShieldAlert });
  }

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (!mounted) return null;
  if (pathname.includes('/auth') || pathname === '/' || !currentUser) return null;

  return (
    <>
      {/* Mobile Top Navbar Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 fixed top-0 left-0 right-0 z-40 h-16">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-7 h-7 rounded bg-red-950/50 border border-red-500/30 text-red-500">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <span className="font-extrabold tracking-widest text-xs text-slate-100 uppercase">AEGIS AI</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 border border-slate-850 rounded bg-slate-900 text-slate-400 hover:text-slate-200 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Backdrop overlay for mobile drawer */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* Collapsible Sidebar Navigation Panel */}
      <aside className={`w-64 glass-panel border-r border-slate-800 flex flex-col justify-between h-screen fixed left-0 top-0 z-30 transition-transform duration-300 md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          {/* System Branding Header */}
          <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-red-950/50 border border-red-500/30 text-red-500 animate-pulse">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-sm tracking-widest text-slate-100 uppercase">AEGIS AI</h1>
              <p className="text-[10px] text-red-500 font-bold tracking-widest">SYSTEM OPERATIONAL</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-slate-900 to-indigo-950/40 text-slate-100 border-l-2 border-indigo-500 font-medium'
                      : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full animate-bounce">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Operator Info & Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-4">
          {currentUser && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-950/40 border border-slate-900">
              <div className="w-8 h-8 rounded-full bg-indigo-950/60 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <User className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-200 truncate">{currentUser.full_name}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest truncate">{currentUser.role}</p>
              </div>
            </div>
          )}

          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-all border border-transparent hover:border-red-950/50 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>LOGOUT DECRYPT SESSION</span>
          </button>
        </div>
      </aside>
    </>
  );
}
