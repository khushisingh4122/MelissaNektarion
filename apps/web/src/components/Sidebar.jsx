import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  Plane,
  Leaf,
  Bug,
  TrendingUp,
  FileText,
  Bell,
  Route,
  User,
  Settings,
  HelpCircle,
  X,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { useTranslation } from '../i18n/useTranslation.jsx';

const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  const navItems = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { path: '/farm-intelligence', label: 'Farm Intelligence', icon: Map },
    { path: '/drone-monitoring', label: t('nav.droneMonitoring'), icon: Plane },
    { path: '/mission-planning', label: t('nav.missionPlanning'), icon: Route },
    { path: '/pollination', label: t('nav.pollination'), icon: Bug },
    { path: '/ai-analysis', label: 'AI Insights', icon: Leaf },
    { path: '/alerts', label: t('nav.alerts'), icon: Bell },
  ];

  const bottomNavItems = [
    { path: '/profile', label: t('nav.profile'), icon: User },
    { path: '/farmer-support', label: t('nav.support'), icon: HelpCircle },
    { path: '/settings', label: t('nav.settings'), icon: Settings },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-[#d8e3d2] bg-[#f5f7f1] text-[#183d2d] shadow-[0_20px_55px_rgba(24,61,45,0.16)] transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'lg:translate-x-0 -translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-[#d8e3d2] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f5d3d] text-lg">🌾</div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#718446]">Mellisanectorian</p>
              <p className="text-sm font-semibold text-[#183d2d]">Farm control</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-[#183d2d] hover:bg-[#e8f1e2]">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive ? 'bg-[#dcefd5] text-[#183d2d]' : 'text-[#55705c] hover:bg-[#e8f1e2] hover:text-[#183d2d]'
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="space-y-1 border-t border-[#d8e3d2] p-4">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive ? 'bg-[#dcefd5] text-[#183d2d]' : 'text-[#55705c] hover:bg-[#e8f1e2] hover:text-[#183d2d]'
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;