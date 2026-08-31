import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { Badge } from '../components/ui/badge';
import { Line } from 'react-chartjs-2';
import { TrendingUp, Droplet, Leaf, Sprout } from 'lucide-react';
import { yieldPredictionData } from '../data/sampleData.js';
import { useTheme } from '../components/ThemeProvider.jsx';
import { useTranslation } from '../i18n/useTranslation.jsx';

const YieldPrediction = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  const [weatherCondition, setWeatherCondition] = useState('favorable');
  const [soilMoisture, setSoilMoisture] = useState([75]);
  const [cropHealth, setCropHealth] = useState([87]);
  const [irrigationLevel, setIrrigationLevel] = useState([80]);
  const [showResults, setShowResults] = useState(false);

  const handlePredict = () => {
    setShowResults(true);
  };

  const chartData = {
    labels: yieldPredictionData.historicalData.map(d => d.year),
    datasets: [
      {
        label: 'Yield (tons/hectare)',
        data: yieldPredictionData.historicalData.map(d => d.yield),
        borderColor: '#22c55e',
        backgroundColor: '#22c55e20',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  const chartOptions = {
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
        <title>{`${t('nav.yieldPrediction')} - ${t('app.title')}`}</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold leading-tight" style={{ textWrap: 'balance' }}>
            {t('yield.title')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('yield.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-lg">{t('yield.inputParams')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>{t('yield.weatherCond')}</Label>
                  <Select value={weatherCondition} onValueChange={setWeatherCondition}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="favorable">{t('yield.favorable')}</SelectItem>
                      <SelectItem value="moderate">{t('yield.moderate')}</SelectItem>
                      <SelectItem value="adverse">{t('yield.adverse')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-blue-600" />
                      {t('yield.soilMoisture')}
                    </Label>
                    <span className="text-sm font-medium">{soilMoisture[0]}%</span>
                  </div>
                  <Slider
                    value={soilMoisture}
                    onValueChange={setSoilMoisture}
                    max={100}
                    step={1}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-green-600" />
                      {t('yield.healthScore')}
                    </Label>
                    <span className="text-sm font-medium">{cropHealth[0]}%</span>
                  </div>
                  <Slider
                    value={cropHealth}
                    onValueChange={setCropHealth}
                    max={100}
                    step={1}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Sprout className="w-4 h-4 text-amber-600" />
                      {t('yield.irrigation')}
                    </Label>
                    <span className="text-sm font-medium">{irrigationLevel[0]}%</span>
                  </div>
                  <Slider
                    value={irrigationLevel}
                    onValueChange={setIrrigationLevel}
                    max={100}
                    step={1}
                    className="py-4"
                  />
                </div>

                <Button
                  onClick={handlePredict}
                  className="w-full transition-all duration-200 active:scale-[0.98]"
                  size="lg"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {t('yield.predictBtn')}
                </Button>
              </CardContent>
            </Card>
          </div>

          {showResults && (
            <Card className="hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-lg">{t('yield.results')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
                  <div className="text-sm text-green-700 dark:text-green-400 mb-1">{t('yield.estYield')}</div>
                  <div className="text-3xl font-bold text-green-900 dark:text-green-300">{yieldPredictionData.estimatedYield}</div>
                  <div className="text-sm text-green-700 dark:text-green-400">tons/hectare</div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                  <div className="text-sm text-blue-700 dark:text-blue-400 mb-1">{t('yield.confScore')}</div>
                  <div className="text-3xl font-bold text-blue-900 dark:text-blue-300">{yieldPredictionData.confidenceScore}%</div>
                  <Badge variant="default" className="mt-2 bg-blue-600">{t('yield.highConf')}</Badge>
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <h4 className="font-semibold text-sm">{t('yield.keyFactors')}</h4>
                  {yieldPredictionData.factors.map((factor, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{factor.name}</span>
                        <Badge variant="secondary" className="text-xs">{factor.weight}%</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">{factor.impact}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {showResults && (
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-lg">{t('yield.histComp')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Line data={chartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default YieldPrediction;