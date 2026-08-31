import React from 'react';
import { Helmet } from 'react-helmet';
import DashboardLayout from '../components/DashboardLayout.jsx';
import DroneStatusCard from '../components/DroneStatusCard.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { useWebSocketSimulator } from '../hooks/useWebSocketSimulator.js';
import { droneData } from '../data/sampleData.js';
import { useTranslation } from '../i18n/useTranslation.jsx';

const DroneMonitoring = () => {
  const { t } = useTranslation();
  const liveData = useWebSocketSimulator(droneData);

  return (
    <DashboardLayout>
      <Helmet>
        <title>{`${t('nav.droneMonitoring')} - ${t('app.title')}`}</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold leading-tight" style={{ textWrap: 'balance' }}>
            {t('drone.title')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('drone.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DroneStatusCard droneData={liveData} />
          </div>

          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-lg">{t('drone.quickStats')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
                <div className="text-sm text-green-700 dark:text-green-400 mb-1">{t('drone.flightsToday')}</div>
                <div className="text-2xl font-bold text-green-900 dark:text-green-300">3</div>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                <div className="text-sm text-blue-700 dark:text-blue-400 mb-1">{t('drone.imagesCaptured')}</div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-300">247</div>
              </div>
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20">
                <div className="text-sm text-purple-700 dark:text-purple-400 mb-1">{t('drone.flightTime')}</div>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-300">2.4h</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-lg">{t('drone.recentCaptures')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {liveData.lastImages.map((image) => (
                <div key={image.id} className="space-y-2">
                  <div className="rounded-xl overflow-hidden border aspect-video">
                    <img
                      src={image.url}
                      alt={`Drone capture of ${image.location}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{image.location}</p>
                    <p className="text-xs text-muted-foreground">{image.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DroneMonitoring;