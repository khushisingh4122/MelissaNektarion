import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

const SummaryCard = ({ icon: Icon, title, value, unit, trend, trendValue, iconColor = 'text-primary' }) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUp className="w-4 h-4" />;
    if (trend === 'down') return <ArrowDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-xl bg-primary/10 ${iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">{title}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{value}</span>
              {unit && <span className="text-lg text-muted-foreground">{unit}</span>}
            </div>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-muted ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-sm font-medium">{trendValue}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;