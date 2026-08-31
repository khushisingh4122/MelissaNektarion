import React from 'react';
import { Helmet } from 'react-helmet';
import DashboardLayout from '../components/DashboardLayout.jsx';
import SummaryCard from '../components/SummaryCard.jsx';
import TrendChart from '../components/TrendChart.jsx';
import { Cloud, Leaf, Bug, Plane } from 'lucide-react';
import { weatherData, cropHealthData, pollinationData, droneData } from '../data/sampleData.js';
import { useTranslation } from '../i18n/useTranslation.jsx';

const DashboardOverview = () => {
  let t = (key) => key;
let language = "en";

try {
  const translation = useTranslation();
  if (translation) {
    t = translation.t || t;
    language = translation.language || "en";
  }
} catch (e) {
  console.log("Translation error:", e);
}
  const currentDate = new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <DashboardLayout>
      <Helmet>
        <title>{`${t('nav.dashboard')} - ${t('app.title')}`}</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold leading-tight" style={{ textWrap: 'balance' }}>
            {t('dashboard.title')}
          </h1>
          <p className="text-muted-foreground mt-1">{currentDate}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            icon={Cloud}
            title={t('dashboard.weather')}
            value={weatherData.temperature}
            unit="°C"
            trend="up"
            trendValue={`${weatherData.humidity}% ${t('dashboard.humidity')}`}
            iconColor="text-blue-600"
          />
          <SummaryCard
            icon={Leaf}
            title={t('dashboard.cropHealth')}
            value={cropHealthData.overallScore}
            unit="%"
            trend="up"
            trendValue="+2.8%"
            iconColor="text-green-600"
          />
          <SummaryCard
            icon={Bug}
            title={t('dashboard.pollination')}
            value={pollinationData.beeActivity}
            unit="%"
            trend="up"
            trendValue="+4.2%"
            iconColor="text-amber-600"
          />
          <SummaryCard
            icon={Plane}
            title={t('dashboard.droneStatus')}
            value={droneData.status}
            trend="neutral"
            trendValue={`${droneData.battery}% ${t('dashboard.battery')}`}
            iconColor="text-purple-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendChart
            title={t('dashboard.tempTrend')}
            data={weatherData.temperatureTrend}
            type="line"
            color="#3b82f6"
          />
          <TrendChart
            title={t('dashboard.rainProb')}
            data={weatherData.rainProbability}
            type="bar"
            color="#06b6d4"
          />
          <TrendChart
            title={t('dashboard.healthTrend')}
            data={cropHealthData.trend}
            type="line"
            color="#22c55e"
          />
          <TrendChart
            title={t('dashboard.yieldPred')}
            data={[
              { year: '2022', yield: 3.8 },
              { year: '2023', yield: 4.2 },
              { year: '2024', yield: 4.5 },
              { year: '2025', yield: 4.4 },
              { year: '2026', yield: 4.7 }
            ]}
            type="line"
            color="#f59e0b"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardOverview;