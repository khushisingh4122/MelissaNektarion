import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { AlertTriangle, Bug, Droplet, Cloud, Plane, X } from 'lucide-react';

const AlertCard = ({ alert, onMarkAsRead, onDismiss }) => {
  const getIcon = () => {
    switch (alert.type) {
      case 'pest': return Bug;
      case 'disease': return AlertTriangle;
      case 'water': return Droplet;
      case 'weather': return Cloud;
      case 'drone': return Plane;
      default: return AlertTriangle;
    }
  };

  const getSeverityColor = () => {
    switch (alert.severity) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-orange-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityBadgeVariant = () => {
    switch (alert.severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'secondary';
      default: return 'outline';
    }
  };

  const Icon = getIcon();

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${alert.read ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-xl ${getSeverityColor()} bg-opacity-10`}>
            <Icon className={`w-5 h-5 ${getSeverityColor().replace('bg-', 'text-')}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-base leading-tight">{alert.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-destructive/10"
                onClick={() => onDismiss(alert.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{alert.description}</p>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Badge variant={getSeverityBadgeVariant()} className="text-xs">
                  {alert.severity}
                </Badge>
                <span className="text-xs text-muted-foreground">{alert.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                {!alert.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => onMarkAsRead(alert.id)}
                  >
                    Mark as read
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertCard;