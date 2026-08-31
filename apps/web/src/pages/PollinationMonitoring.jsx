import React from 'react';
import { Helmet } from 'react-helmet';
import DashboardLayout from '../components/DashboardLayout.jsx';
import TrendChart from '../components/TrendChart.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { pollinationData } from '../data/sampleData.js';
import { useTheme } from '../components/ThemeProvider.jsx';
import { useTranslation } from '../i18n/useTranslation.jsx';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const PollinationMonitoring = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  const gaugeData = {
    labels: ['Active', 'Inactive'],
    datasets: [
      {
        data: [pollinationData.beeActivity, 100 - pollinationData.beeActivity],
        backgroundColor: ['#f59e0b', isDark ? '#334155' : '#e5e7eb'],
        borderWidth: 0
      }
    ]
  };

  const gaugeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    circumference: 180,
    rotation: 270,
    cutout: '75%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    }
  };

  const beeCountData = {
    labels: pollinationData.beeCountByHive.map(h => h.hive),
    datasets: [
      {
        label: 'Bee Count',
        data: pollinationData.beeCountByHive.map(h => h.count),
        backgroundColor: '#f59e0b',
        borderRadius: 8
      }
    ]
  };

  const beeCountOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 12,
        cornerRadius: 8,
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: gridColor },
        ticks: { color: textColor }
      },
      x: {
        grid: { display: false },
        ticks: { color: textColor }
      }
    }
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>{`${t('nav.pollination')} - ${t('app.title')}`}</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold leading-tight" style={{ textWrap: 'balance' }}>
            {t('pollination.title')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('pollination.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-lg">{t('pollination.activityLevel')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-48">
                <Doughnut data={gaugeData} options={gaugeOptions} />
                <div className="absolute inset-0 flex items-end justify-center pb-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-amber-600">{pollinationData.beeActivity}%</div>
                    <div className="text-sm text-muted-foreground">{t('pollination.activity')}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-lg">{t('pollination.efficiency')}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-48">
              <div className="text-5xl font-bold text-green-600 mb-2">{pollinationData.efficiency}%</div>
              <Badge variant="default" className="bg-green-600">Excellent</Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-lg">{t('pollination.floweringStage')}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-48">
              <div className="text-3xl font-bold mb-2">{pollinationData.floweringStage}</div>
              <p className="text-sm text-muted-foreground text-center">{t('pollination.optimalWindow')}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendChart
            title={t('pollination.efficiencyTrend')}
            data={pollinationData.trend}
            type="line"
            color="#f59e0b"
          />

          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-lg">{t('pollination.beeCount')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Bar data={beeCountData} options={beeCountOptions} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-lg">{t('pollination.hiveDetails')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pollinationData.beeCountByHive.map((hive) => (
                <div key={hive.hive} className="p-4 rounded-xl border bg-card">
                  <div className="font-semibold mb-2">{hive.hive}</div>
                  <div className="text-2xl font-bold text-amber-600">{hive.count.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">{t('pollination.bees')}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PollinationMonitoring;