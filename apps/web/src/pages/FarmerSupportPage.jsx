import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Search, Phone, MessageSquare, MapPin, Star, Award } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation.jsx';
import { supportContacts } from '../data/sampleSupportContacts.js';

const FarmerSupportPage = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = [
    { id: 'all', label: t('support.all') },
    { id: 'Pest Control Experts', label: t('support.pestControl') },
    { id: 'Fertilizer Suppliers', label: t('support.fertilizer') },
    { id: 'Crop Monitoring Experts', label: t('support.monitoring') },
    { id: 'Local Agriculture Officers', label: t('support.officers') },
    { id: 'Community Farmers', label: t('support.community') }
  ];

  const filteredContacts = supportContacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          contact.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || contact.category === filterCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => a.distance - b.distance);

  return (
    <DashboardLayout>
      <Helmet>
        <title>{`${t('nav.support')} - ${t('app.title')}`}</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold leading-tight" style={{ textWrap: 'balance' }}>
            {t('support.title')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('support.subtitle')}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('support.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background text-foreground"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder={t('support.filter')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map(contact => (
            <Card key={contact.id} className="flex flex-col h-full hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{contact.name}</h3>
                    <Badge variant="secondary" className="mt-1 font-normal">
                      {contact.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-md text-sm font-medium">
                    <Star className="w-3 h-3 fill-current" />
                    {contact.rating}
                  </div>
                </div>

                <div className="space-y-3 text-sm flex-1">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <Award className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-foreground">{t('support.specialization')}:</span> {contact.specialization}
                      <br />
                      <span className="text-xs">{contact.experience} {t('support.experience')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>{contact.location} ({contact.distance} km {t('support.distance')})</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t">
                  <Button className="flex-1 gap-2" onClick={() => window.location.href = `tel:${contact.phone}`}>
                    <Phone className="w-4 h-4" />
                    {t('support.call')}
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <MessageSquare className="w-4 h-4" />
                    {t('support.message')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No contacts found matching your criteria.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FarmerSupportPage;