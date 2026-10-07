import React from 'react';
import { Helmet } from 'react-helmet';
import DashboardLayout from '../components/DashboardLayout.jsx';
import MapComponent from '../components/MapComponent.jsx';
import { farmBoundary, fieldZones, droneFlightPath, stressMarkers, diseaseMarkers } from '../data/sampleData.js';
import { useTranslation } from '../i18n/useTranslation.jsx';

const FarmMap = () => {
  const { t } = useTranslation();

  return (
    <DashboardLayout>
      <Helmet>
        <title>{`${t('nav.farmMap')} - ${t('app.title')}`}</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold leading-tight" style={{ textWrap: 'balance' }}>
            {t('map.title')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('map.subtitle')}</p>
        </div>

        <MapComponent
          farmBoundary={farmBoundary}
          fieldZones={fieldZones}
          droneFlightPath={droneFlightPath}
          stressMarkers={stressMarkers}
          diseaseMarkers={diseaseMarkers}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {fieldZones.map(zone => (
            <div key={zone.id} className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="w-4 h-4 rounded" 
                  style={{ backgroundColor: zone.properties.color }}
                />
                <span className="font-semibold">{zone.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('map.status')}: <span className="capitalize">{zone.properties.health}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FarmMap;