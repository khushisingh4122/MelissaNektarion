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
  const mapCenter =
    waypoints.length > 0 ? [waypoints[0].latitude, waypoints[0].longitude] : DEFAULT_MAP_CENTER;

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

        {waypoints.length > 0 && (
          <MissionMap
            waypoints={waypoints}
            onMapClick={() => {}}
            center={mapCenter}
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
