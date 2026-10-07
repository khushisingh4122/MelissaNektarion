import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Slider } from '../components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Globe, Mic, Bell, Palette, Info, Sun, Moon } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation.jsx';
import { useTheme } from '../components/ThemeProvider.jsx';
import { toast } from 'sonner';

const SettingsPage = () => {
  const { t, language, setLanguage } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('appSettings');
    return saved ? JSON.parse(saved) : {
      voiceInput: true,
      tts: true,
      voiceSpeed: 'normal',
      voiceVolume: [80],
      notifications: true,
      notifyCrop: true,
      notifyWeather: true,
      notifyPest: true,
      notifyYield: false,
      notifyFreq: 'realtime'
    };
  });

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    toast.success(t('settings.success'));
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>{`${t('nav.settings')} - ${t('app.title')}`}</title>
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold leading-tight" style={{ textWrap: 'balance' }}>
            {t('settings.title')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('settings.subtitle')}</p>
        </div>

        <Tabs defaultValue="language" className="w-full flex flex-col md:flex-row gap-6">
          <TabsList className="flex flex-col h-auto w-full md:w-64 bg-transparent space-y-2">
            <TabsTrigger value="language" className="w-full justify-start gap-2 data-[state=active]:bg-muted">
              <Globe className="w-4 h-4" /> {t('settings.language')}
            </TabsTrigger>
            <TabsTrigger value="voice" className="w-full justify-start gap-2 data-[state=active]:bg-muted">
              <Mic className="w-4 h-4" /> {t('settings.voice')}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="w-full justify-start gap-2 data-[state=active]:bg-muted">
              <Bell className="w-4 h-4" /> {t('settings.notifications')}
            </TabsTrigger>
            <TabsTrigger value="theme" className="w-full justify-start gap-2 data-[state=active]:bg-muted">
              <Palette className="w-4 h-4" /> {t('settings.theme')}
            </TabsTrigger>
            <TabsTrigger value="about" className="w-full justify-start gap-2 data-[state=active]:bg-muted">
              <Info className="w-4 h-4" /> {t('settings.about')}
            </TabsTrigger>
          </TabsList>

          <div className="flex-1">
            <TabsContent value="language" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>{t('settings.language')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-xl">
                    <div>
                      <Label className="text-base">English</Label>
                      <p className="text-sm text-muted-foreground">Set application language to English</p>
                    </div>
                    <Button variant={language === 'en' ? 'default' : 'outline'} onClick={() => setLanguage('en')}>
                      English
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-xl">
                    <div>
                      <Label className="text-base">हिंदी (Hindi)</Label>
                      <p className="text-sm text-muted-foreground">एप्लिकेशन की भाषा हिंदी सेट करें</p>
                    </div>
                    <Button variant={language === 'hi' ? 'default' : 'outline'} onClick={() => setLanguage('hi')}>
                      हिंदी
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="voice" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>{t('settings.voice')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">{t('settings.enableVoice')}</Label>
                    <Switch checked={settings.voiceInput} onCheckedChange={(v) => updateSetting('voiceInput', v)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-base">{t('settings.enableTTS')}</Label>
                    <Switch checked={settings.tts} onCheckedChange={(v) => updateSetting('tts', v)} />
                  </div>
                  <div className="space-y-3">
                    <Label>{t('settings.voiceSpeed')}</Label>
                    <Select value={settings.voiceSpeed} onValueChange={(v) => updateSetting('voiceSpeed', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slow">{t('settings.slow')}</SelectItem>
                        <SelectItem value="normal">{t('settings.normal')}</SelectItem>
                        <SelectItem value="fast">{t('settings.fast')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>{t('settings.voiceVolume')}</Label>
                      <span className="text-sm text-muted-foreground">{settings.voiceVolume[0]}%</span>
                    </div>
                    <Slider 
                      value={settings.voiceVolume} 
                      onValueChange={(v) => updateSetting('voiceVolume', v)} 
                      max={100} step={1} 
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>{t('settings.notifications')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b">
                    <Label className="text-base font-semibold">Enable All Notifications</Label>
                    <Switch checked={settings.notifications} onCheckedChange={(v) => updateSetting('notifications', v)} />
                  </div>
                  
                  <div className={`space-y-4 ${!settings.notifications && 'opacity-50 pointer-events-none'}`}>
                    <div className="flex items-center justify-between">
                      <Label>Crop Health Alerts</Label>
                      <Switch checked={settings.notifyCrop} onCheckedChange={(v) => updateSetting('notifyCrop', v)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Weather Warnings</Label>
                      <Switch checked={settings.notifyWeather} onCheckedChange={(v) => updateSetting('notifyWeather', v)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Pest Detection</Label>
                      <Switch checked={settings.notifyPest} onCheckedChange={(v) => updateSetting('notifyPest', v)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Yield Predictions</Label>
                      <Switch checked={settings.notifyYield} onCheckedChange={(v) => updateSetting('notifyYield', v)} />
                    </div>
                    
                    <div className="pt-4 space-y-3">
                      <Label>{t('settings.freq')}</Label>
                      <Select value={settings.notifyFreq} onValueChange={(v) => updateSetting('notifyFreq', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realtime">{t('settings.realtime')}</SelectItem>
                          <SelectItem value="daily">{t('settings.daily')}</SelectItem>
                          <SelectItem value="weekly">{t('settings.weekly')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="theme" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>{t('settings.theme')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-xl">
                    <div className="flex items-center gap-3">
                      <Sun className="w-5 h-5" />
                      <Label className="text-base">{t('settings.lightMode')}</Label>
                    </div>
                    <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => theme !== 'light' && toggleTheme()}>
                      Select
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-xl">
                    <div className="flex items-center gap-3">
                      <Moon className="w-5 h-5" />
                      <Label className="text-base">{t('settings.darkMode')}</Label>
                    </div>
                    <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => theme !== 'dark' && toggleTheme()}>
                      Select
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="about" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>{t('settings.about')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Version</span>
                    <span className="font-medium">1.0.0</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Help & Support</span>
                    <a href="#" className="text-primary hover:underline">support@smartagri.com</a>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Privacy Policy</span>
                    <a href="#" className="text-primary hover:underline">View Policy</a>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Terms of Service</span>
                    <a href="#" className="text-primary hover:underline">View Terms</a>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave} size="lg">
                {t('settings.save')}
              </Button>
            </div>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;