import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ClipboardList, PlayCircle, Radio, ShieldCheck } from 'lucide-react';

const STATUS_META = {
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground border-transparent' },
  saved: {
    label: 'Saved',
    className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  },
  planned: {
    label: 'Planned',
    className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  },
  ready: {
    label: 'Ready',
    className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
  },
  dispatched: {
    label: 'Dispatched',
    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  },
};

const SummaryRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-1.5 border-b last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-right">{value}</span>
  </div>
);

/**
 * Read-only summary of the mission currently in the planner, including
 * calculated route distance / flight time, current status, and the
 * frontend-only "Start Mission" simulation action.
 */
const MissionSummaryCard = ({
  missionNameLabel,
  cropLabel,
  fieldLabel,
  altitudeLabel,
  speedLabel,
  patternLabel,
  priorityLabel,
  waypointCount,
  routeDistanceLabel,
  flightTimeLabel,
  status,
  preflight,
  onCheckMission,
  onStartMission,
  canStartMission,
}) => {
  const statusMeta = STATUS_META[status] || STATUS_META.draft;

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-lg">Mission Summary</CardTitle>
          </div>
          <Badge className={statusMeta.className} variant="outline">
            {statusMeta.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-0.5">
        <SummaryRow label="Mission Name" value={missionNameLabel || '—'} />
        <SummaryRow label="Crop" value={cropLabel || '—'} />
        <SummaryRow label="Field" value={fieldLabel || '—'} />
        <SummaryRow label="Altitude" value={altitudeLabel} />
        <SummaryRow label="Speed" value={speedLabel} />
        <SummaryRow label="Pattern" value={patternLabel} />
        <SummaryRow label="Priority" value={priorityLabel} />
        <SummaryRow label="Waypoints" value={waypointCount} />
        <SummaryRow label="Route Distance" value={routeDistanceLabel} />
        <SummaryRow label="Estimated Flight Time" value={flightTimeLabel} />

        <div className="pt-4">
          <Button
            type="button"
            className="mb-2 w-full"
            variant="outline"
            onClick={onCheckMission}
            disabled={!missionNameLabel || preflight?.status === 'checking'}
          >
            <ShieldCheck className="w-4 h-4" />
            {preflight?.status === 'checking' ? 'Checking mission...' : 'Check Mission'}
          </Button>
          {preflight?.status === 'passed' && <p className="mb-2 text-xs font-semibold text-green-700">All pre-flight checks passed.</p>}
          {preflight?.status === 'failed' && <div className="mb-2 rounded-lg bg-red-50 p-2 text-xs text-red-700">{preflight.reasons?.map((reason) => <p key={reason}>{reason}</p>)}</div>}
          <Button
            type="button"
            className="w-full"
            variant="secondary"
            onClick={onStartMission}
            disabled={!canStartMission || preflight?.status !== 'passed'}
          >
            <PlayCircle className="w-4 h-4" />
            Start Mission
          </Button>
          {(!canStartMission || preflight?.status !== 'passed') && (
            <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1.5">
              <Radio className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              Save the mission, run the checks, then start it manually.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MissionSummaryCard;
