import React from 'react';
import { Helmet } from 'react-helmet';
import DashboardLayout from '../components/DashboardLayout.jsx';
import AlertCard from '../components/AlertCard.jsx';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAlerts } from '../hooks/useAlerts.js';
import { alertsData } from '../data/sampleData.js';
import { useTranslation } from '../i18n/useTranslation.jsx';

const AlertsNotifications = () => {
  const { t } = useTranslation();
  const { alerts, allAlerts, filter, setFilter, markAsRead, dismissAlert, unreadCount } = useAlerts(alertsData);

  const filterOptions = [
    { value: 'all', label: t('alerts.all') },
    { value: 'pest', label: t('alerts.pest') },
    { value: 'disease', label: t('alerts.disease') },
    { value: 'water', label: t('alerts.water') },
    { value: 'weather', label: t('alerts.weather') },
    { value: 'drone', label: t('alerts.drone') }
  ];

  return (
    <DashboardLayout unreadCount={unreadCount}>
      <Helmet>
        <title>{`${t('nav.alerts')} - ${t('app.title')}`}</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold leading-tight" style={{ textWrap: 'balance' }}>
              {t('alerts.title')}
            </h1>
            <p className="text-muted-foreground mt-1">{t('alerts.subtitle')}</p>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-base px-3 py-1">
              {unreadCount} {t('alerts.unread')}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {filterOptions.map(option => (
            <Button
              key={option.value}
              variant={filter === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(option.value)}
              className="transition-all duration-200"
            >
              {option.label}
              {option.value !== 'all' && (
                <Badge variant="secondary" className="ml-2">
                  {allAlerts.filter(a => a.type === option.value).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {alerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onMarkAsRead={markAsRead}
              onDismiss={dismissAlert}
            />
          ))}
        </div>

        {alerts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('alerts.noAlerts')}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AlertsNotifications;