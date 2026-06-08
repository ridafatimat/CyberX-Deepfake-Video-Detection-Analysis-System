'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { LayoutDashboard, BarChart3, User, Settings, LogOut, Menu, X, Home } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export function NavigationBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Analytics', href: '/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Profile', href: '/profile', icon: <User className="w-4 h-4" /> },
    ...(isAdmin ? [{ label: 'Admin', href: '/admin', icon: <Settings className="w-4 h-4" /> }] : []),
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex border-b border-cyan-900/30 bg-slate-950/50 backdrop-blur sticky top-0 z-40 h-16 items-center px-4">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="cursor-pointer hover:opacity-80 transition-opacity">
              <Home className="w-6 h-6 text-cyan-400" />
            </Link>
            <div className="flex gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${isActive(item.href)
                      ? 'text-cyan-300 bg-cyan-950/40 border border-cyan-900/50'
                      : 'text-gray-300 hover:text-cyan-300 hover:bg-cyan-950/20'
                    }
                  `}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">{user?.email}</span>
            {isAdmin && <span className="text-xs bg-purple-500/20 px-2 py-1 rounded text-purple-300">Admin</span>}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden border-b border-cyan-900/30 bg-slate-950/50 backdrop-blur sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="cursor-pointer hover:opacity-80">
            <Home className="w-6 h-6 text-cyan-400" />
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-300">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="px-4 pb-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg w-full text-sm font-medium
                  transition-all duration-200
                  ${isActive(item.href)
                    ? 'text-cyan-300 bg-cyan-950/40 border border-cyan-900/50'
                    : 'text-gray-300 hover:text-cyan-300 hover:bg-cyan-950/20'
                  }
                `}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg w-full text-sm text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
