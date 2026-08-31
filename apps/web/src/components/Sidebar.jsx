import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  MessageSquare, 
  Plane, 
  Leaf, 
  Bug, 
  TrendingUp, 
  FileText, 
  Bell,
  User,
  Settings,
  HelpCircle,
  X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { useTranslation } from '../i18n/useTranslation.jsx';

const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  const navItems = [
    { path: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { path: '/farm-map', label: t('nav.farmMap'), icon: Map },
    { path: '/ai-chatbot', label: t('nav.aiChatbot'), icon: MessageSquare },
    { path: '/drone-monitoring', label: t('nav.droneMonitoring'), icon: Plane },
    { path: '/crop-health', label: t('nav.cropHealth'), icon: Leaf },
    { path: '/pollination', label: t('nav.pollination'), icon: Bug },
    { path: '/yield-prediction', label: t('nav.yieldPrediction'), icon: TrendingUp },
    { path: '/schemes', label: t('nav.schemes'), icon: FileText },
    { path: '/alerts', label: t('nav.alerts'), icon: Bell },
  ];

  const bottomNavItems = [
    { path: '/profile', label: t('nav.profile'), icon: User },
    { path: '/farmer-support', label: t('nav.support'), icon: HelpCircle },
    { path: '/settings', label: t('nav.settings'), icon: Settings },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-background border-r transition-transform duration-300 lg:translate-x-0 lg:static flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b lg:hidden">
          <span className="font-semibold">{t('nav.menu')}</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )
                }
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t space-y-1">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;