import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Battery, Gauge, Navigation, MapPin } from 'lucide-react';

const DroneStatusCard = ({ droneData = {} }) => {
  const status = droneData?.status?.toLowerCase() || 'unknown';
  const battery = droneData?.battery ?? 0;

  const getStatusColor = () => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'charging': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getBatteryColor = () => {
    if (battery > 60) return 'text-green-600';
    if (battery > 30) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Card className="shadow-lg rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Drone Status</CardTitle>
        <Badge className={`${getStatusColor()} text-white`}>
          {status.toUpperCase()}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Battery */}
        <div className="flex items-center gap-2">
          <Battery className={getBatteryColor()} />
          <span className={getBatteryColor()}>{battery}%</span>
        </div>
        <Progress value={battery} />

        {/* Speed */}
        <div className="flex items-center gap-2">
          <Gauge />
          <span>{droneData?.speed || 0} km/h</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2">
          <MapPin />
          <span>{droneData?.location || 'Unknown'}</span>
        </div>

        {/* Direction */}
        <div className="flex items-center gap-2">
          <Navigation />
          <span>{droneData?.direction || 'N/A'}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default DroneStatusCard;