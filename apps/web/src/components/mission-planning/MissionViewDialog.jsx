import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import MissionMap from '../MissionMap.jsx';
import { formatDistance, formatDuration, DEFAULT_MAP_CENTER } from '../../utils/geo.js';
import { CROP_OPTIONS, FIELD_OPTIONS, PATTERN_OPTIONS, PRIORITY_OPTIONS } from './MissionConfigPanel.jsx';
import { fieldZones } from '../../data/sampleData.js';

const FIELD_ZONE_BY_ID = { 'field-a': 'north', 'field-b': 'east', 'field-c': 'south', 'field-d': 'west' };

const STATUS_BADGE = {
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground border-transparent' },
  planned: {
    label: 'Planned',
    className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  },
  ready: {
    label: 'Ready',
    className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
  },
};

const labelFor = (options, value) => options.find((opt) => opt.value === value)?.label || value || '—';

const DetailRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-1.5 border-b last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-right">{value}</span>
  </div>
);

/**
 * Read-only detail view of a single saved mission, including its route
 * drawn on the map where coordinates are available.
 */
const MissionViewDialog = ({ mission, open, onOpenChange }) => {
  if (!mission) return null;

  const statusMeta = STATUS_BADGE[mission.status] || STATUS_BADGE.draft;
  const waypoints = mission.waypoints || [];
  const zones = [...(mission.pollinationZones || []), ...(mission.pesticideZones || [])];
  const selectedField = fieldZones.find((field) => field.id === FIELD_ZONE_BY_ID[mission.field]);
  const fieldBoundary = selectedField?.geometry.coordinates[0].map(([longitude, latitude]) => [latitude, longitude]) || [];
  const hasMapData = waypoints.length > 0 || fieldBoundary.length > 2 || zones.length > 0;
  const mapCenter =
    waypoints.length > 0
      ? [waypoints[0].latitude, waypoints[0].longitude]
      : zones[0]?.coordinates?.[0] || fieldBoundary[0] || DEFAULT_MAP_CENTER;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <DialogTitle>{mission.missionName}</DialogTitle>
            <Badge className={statusMeta.className} variant="outline">
              {statusMeta.label}
            </Badge>
          </div>
          <DialogDescription>
            {labelFor(CROP_OPTIONS, mission.crop)} Pollination Mission &middot; {labelFor(FIELD_OPTIONS, mission.field)}
          </DialogDescription>
        </DialogHeader>

        {hasMapData && (
          <MissionMap
            waypoints={waypoints}
            onMapClick={() => {}}
            zones={zones}
            center={mapCenter}
            fieldBoundary={fieldBoundary}
            fieldName={selectedField?.name}
            disabled
            heightClassName="h-64"
          />
        )}

        <div>
          <DetailRow label="Altitude" value={`${mission.altitude} m`} />
          <DetailRow label="Speed" value={`${mission.speed} m/s`} />
          <DetailRow label="Pattern" value={labelFor(PATTERN_OPTIONS, mission.pattern)} />
          <DetailRow label="Priority" value={labelFor(PRIORITY_OPTIONS, mission.priority)} />
          <DetailRow label="Waypoints" value={waypoints.length} />
          <DetailRow label="Pollination Zones" value={mission.pollinationZones?.length || 0} />
          <DetailRow label="Pesticide Zones" value={mission.pesticideZones?.length || 0} />
          <DetailRow label="Route Distance" value={formatDistance(mission.routeDistance)} />
          <DetailRow label="Estimated Time" value={formatDuration(mission.estimatedFlightTime)} />
          <DetailRow
            label="Created"
            value={mission.createdAt ? new Date(mission.createdAt).toLocaleString() : '—'}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MissionViewDialog;
