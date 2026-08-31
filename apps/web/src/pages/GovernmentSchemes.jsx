import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import DashboardLayout from '../components/DashboardLayout.jsx';
import SchemeCard from '../components/SchemeCard.jsx';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search } from 'lucide-react';
import { governmentSchemes } from '../data/sampleData.js';
import { useTranslation } from '../i18n/useTranslation.jsx';

const GovernmentSchemes = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredSchemes = governmentSchemes.filter(scheme => {
    const matchesSearch = scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scheme.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || scheme.type === filterType;
    return matchesSearch && matchesType;
  });

  const schemeTypes = ['all', ...new Set(governmentSchemes.map(s => s.type))];

  return (
    <DashboardLayout>
      <Helmet>
        <title>{`${t('nav.schemes')} - ${t('app.title')}`}</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold leading-tight" style={{ textWrap: 'balance' }}>
            {t('schemes.title')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('schemes.subtitle')}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('schemes.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t('schemes.filter')} />
            </SelectTrigger>
            <SelectContent>
              {schemeTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type === 'all' ? t('schemes.allTypes') : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map(scheme => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))}
        </div>

        {filteredSchemes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('schemes.noResults')}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GovernmentSchemes;