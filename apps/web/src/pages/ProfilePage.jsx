import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { User, MapPin, Phone, Mail, Maximize, Sprout, Hash, Camera } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation.jsx';
import { useProfile } from '../hooks/useProfile.js';
import VoiceInputButton from "../components/VoiceInputButton.jsx";
import { toast } from 'sonner';

const ProfilePage = () => {
  const { t, language } = useTranslation();
  const { profile, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile);

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
    toast.success(t('profile.success'));
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderField = (id, icon, labelKey, type = "text") => (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {t(`profile.${labelKey}`)}
      </Label>
      <div className="flex gap-2">
        <Input
          id={id}
          type={type}
          value={formData[id]}
          onChange={(e) => handleChange(id, e.target.value)}
          disabled={!isEditing}
          className="flex-1 bg-background text-foreground"
        />
        {isEditing && (
          <VoiceInputButton 
            onTranscript={(text) => handleChange(id, text)} 
            language={language === 'hi' ? 'hi-IN' : 'en-IN'} 
          />
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <Helmet>
        <title>{`${t('nav.profile')} - ${t('app.title')}`}</title>
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold leading-tight" style={{ textWrap: 'balance' }}>
              {t('profile.title')}
            </h1>
            <p className="text-muted-foreground mt-1">{t('profile.subtitle')}</p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              {t('profile.edit')}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 h-fit">
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
              <div className="relative w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-lg overflow-hidden">
                <User className="w-16 h-16 text-muted-foreground" />
                {isEditing && (
                  <button className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6" />
                  </button>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">{formData.name || 'Farmer Name'}</h2>
                <p className="text-sm text-muted-foreground">{formData.location || 'Location not set'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{t('profile.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {renderField('name', <User className="w-4 h-4" />, 'name')}
                {renderField('phone', <Phone className="w-4 h-4" />, 'phone', 'tel')}
                {renderField('email', <Mail className="w-4 h-4" />, 'email', 'email')}
                {renderField('location', <MapPin className="w-4 h-4" />, 'location')}
                {renderField('farmSize', <Maximize className="w-4 h-4" />, 'farmSize')}
                {renderField('cropType', <Sprout className="w-4 h-4" />, 'cropType')}
                {renderField('farmId', <Hash className="w-4 h-4" />, 'farmId')}
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={handleCancel}>
                    {t('profile.cancel')}
                  </Button>
                  <Button onClick={handleSave}>
                    {t('profile.save')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;