import React from 'react';
import VoiceCommandButton from './VoiceCommandButton.jsx';
import { useNavigate } from 'react-router-dom';
import { Bell, User, Menu, Sun, Moon, Globe, Settings, HelpCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { useTheme } from './ThemeProvider.jsx';
import { useTranslation } from '../i18n/useTranslation.jsx';

const Header = ({ onMenuClick, unreadCount = 0 }) => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useTranslation();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    setLanguage(language === 'hi' ? 'en' : 'hi');
  };

  const handleLogout = () => {
    localStorage.removeItem('agri_access_token');
    sessionStorage.removeItem('agri_access_token');
    localStorage.removeItem('agri_user');
    sessionStorage.removeItem('agri_user');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#cbd8c5] bg-[#f4f5ed]">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="rounded-xl border border-[#d8e3d2] bg-white/80 shadow-sm" onClick={onMenuClick}>
            <Menu className="h-5 w-5 text-[#183d2d]" />
          </Button>

          <div className="flex cursor-pointer items-center gap-3" onClick={() => navigate('/')}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1f5d3d] text-lg">
              <span className="text-white">🌾</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold leading-tight text-[#183d2d]">Mellisanectorian</h1>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#718446]">Smart agriculture</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <VoiceCommandButton />

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center gap-2 rounded-xl border border-[#d8e3d2] bg-white/80 px-3 text-[#183d2d] transition-all hover:bg-[#e8f1e2]"
            aria-label="Toggle language"
          >
            <Globe className="h-4 w-4" />
            <span className="text-xs font-medium">{language === 'hi' ? 'हिंदी' : 'EN'}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="rounded-xl border border-[#d8e3d2] bg-white/80 text-[#183d2d] transition-all hover:bg-[#e8f1e2]"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="relative rounded-xl border border-[#d8e3d2] bg-white/80 text-[#183d2d] transition-all hover:bg-[#e8f1e2]"
            onClick={() => navigate('/alerts')}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-[10px] text-emerald-950">
                {unreadCount}
              </Badge>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-xl border border-[#d8e3d2] bg-white/80 text-[#183d2d] transition-all hover:bg-[#e8f1e2]">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                {t('nav.profile')}
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                {t('nav.settings')}
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/farmer-support')}>
                <HelpCircle className="mr-2 h-4 w-4" />
                {t('nav.support')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive" onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;