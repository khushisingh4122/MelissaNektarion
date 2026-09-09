import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import DashboardLayout from '../components/DashboardLayout.jsx';
import MissionMap from '../components/MissionMap.jsx';
import MissionConfigPanel, {
  CROP_OPTIONS,
  FIELD_OPTIONS,
  PATTERN_OPTIONS,
  PRIORITY_OPTIONS,
} from '../components/mission-planning/MissionConfigPanel.jsx';
import WaypointTable from '../components/mission-planning/WaypointTable.jsx';
import MissionSummaryCard from '../components/mission-planning/MissionSummaryCard.jsx';
import MissionHistoryTable from '../components/mission-planning/MissionHistoryTable.jsx';
import MissionViewDialog from '../components/mission-planning/MissionViewDialog.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { useMissions } from '../hooks/useMissions.js';
import {
  calculateRouteDistance,
  calculateFlightTimeSeconds,
  formatDistance,
  formatDuration,
  generateLocalId,
  DEFAULT_MAP_CENTER,
} from '../utils/geo.js';
import { MapPin, Plus, Undo2, Trash2, Save, RotateCcw, Radio, MonitorSmartphone } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation.jsx';

const DEFAULT_FORM_DATA = {
  missionName: 'Pollination Mission 01',
  crop: '',
  field: '',
  altitude: 10,
  speed: 3,
  pattern: 'grid',
  priority: 'normal',
};

const labelFor = (options, value) => options.find((opt) => opt.value === value)?.label || '';

const MissionPlanning = () => {
  const { t } = useTranslation();
  const { missions, saveMission, updateMission, deleteMission, setMissionStatus } = useMissions();

  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [waypoints, setWaypoints] = useState([]);
  const [errors, setErrors] = useState({});
  const [editingMissionId, setEditingMissionId] = useState(null);
  const [status, setStatus] = useState('draft');

  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [viewMission, setViewMission] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const cropLabel = labelFor(CROP_OPTIONS, formData.crop);
  const fieldLabel = labelFor(FIELD_OPTIONS, formData.field);
  const patternLabel = labelFor(PATTERN_OPTIONS, formData.pattern) || '—';
  const priorityLabel = labelFor(PRIORITY_OPTIONS, formData.priority) || '—';

  const routeDistance = useMemo(() => calculateRouteDistance(waypoints), [waypoints]);
  const estimatedFlightTime = useMemo(
    () => calculateFlightTimeSeconds(routeDistance, Number(formData.speed) || 0),
    [routeDistance, formData.speed]
  );

  const hasUnsavedPlannerState =
    formData.missionName !== DEFAULT_FORM_DATA.missionName ||
    Boolean(formData.crop) ||
    Boolean(formData.field) ||
    waypoints.length > 0 ||
    Boolean(editingMissionId);

  // ---------------------------------------------------------------------
  // Field / waypoint handlers
  // ---------------------------------------------------------------------

  const handleFieldChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleMapClick = (lat, lng) => {
    setWaypoints((prev) => {
      const nextOrder = prev.length + 1;
      return [...prev, { id: generateLocalId('wp'), latitude: lat, longitude: lng, order: nextOrder }];
    });
    setErrors((prev) => ({ ...prev, waypoints: undefined }));
  };

  const renumberWaypoints = (list) =>
    [...list]
      .sort((a, b) => a.order - b.order)
      .map((wp, index) => ({ ...wp, order: index + 1 }));

  const handleRemoveWaypoint = (id) => {
    setWaypoints((prev) => renumberWaypoints(prev.filter((wp) => wp.id !== id)));
  };

  const handleUndoLast = () => {
    setWaypoints((prev) => {
      if (prev.length === 0) return prev;
      const ordered = [...prev].sort((a, b) => a.order - b.order);
      ordered.pop();
      return ordered;
    });
  };

  const handleClearRoute = () => {
    setWaypoints([]);
  };

  const handleAddWaypointManually = () => {
    setWaypoints((prev) => {
      const last = [...prev].sort((a, b) => a.order - b.order).at(-1);
      const base = last ? [last.latitude, last.longitude] : DEFAULT_MAP_CENTER;
      // Small deterministic offset so consecutive manual adds don't stack exactly.
      const jitter = 0.0004 * (prev.length + 1);
      const nextOrder = prev.length + 1;
      return [
        ...prev,
        {
          id: generateLocalId('wp'),
          latitude: base[0] + jitter,
          longitude: base[1] + jitter,
          order: nextOrder,
        },
      ];
    });
    setErrors((prev) => ({ ...prev, waypoints: undefined }));
  };

  // ---------------------------------------------------------------------
  // Validation + Save
  // ---------------------------------------------------------------------

  const validate = () => {
    const nextErrors = {};
    if (!formData.missionName.trim()) nextErrors.missionName = 'Mission name is required.';
    if (!formData.crop) nextErrors.crop = 'Select a crop.';
    if (!formData.field) nextErrors.field = 'Select a field.';

    const altitudeNum = Number(formData.altitude);
    if (formData.altitude === '' || Number.isNaN(altitudeNum) || altitudeNum <= 0) {
      nextErrors.altitude = 'Enter a valid altitude greater than 0.';
    }

    const speedNum = Number(formData.speed);
    if (formData.speed === '' || Number.isNaN(speedNum) || speedNum <= 0) {
      nextErrors.speed = 'Enter a valid speed greater than 0.';
    }

    if (waypoints.length < 2) {
      nextErrors.waypoints = 'Add at least 2 waypoints on the map.';
    }

    return nextErrors;
  };

  const handleSaveMission = () => {
    const validationErrors = validate();
    setErrors(validationErrors);

    const errorMessages = Object.values(validationErrors).filter(Boolean);
    if (errorMessages.length > 0) {
      toast.error(errorMessages[0], {
        description: errorMessages.length > 1 ? `${errorMessages.length - 1} more issue(s) to fix.` : undefined,
      });
      return;
    }

    const payload = {
      missionName: formData.missionName.trim(),
      crop: formData.crop,
      field: formData.field,
      altitude: Number(formData.altitude),
      speed: Number(formData.speed),
      pattern: formData.pattern,
      priority: formData.priority,
      waypoints,
      routeDistance,
      estimatedFlightTime,
      status: 'planned',
    };

    if (editingMissionId) {
      updateMission(editingMissionId, payload);
    } else {
      const created = saveMission(payload);
      setEditingMissionId(created.id);
    }

    setStatus('planned');
    toast.success('Mission saved successfully.');
  };

  // ---------------------------------------------------------------------
  // Start Mission (frontend-only simulation)
  // ---------------------------------------------------------------------

  const handleStartMission = () => {
    if (!editingMissionId) {
      toast.error('Save the mission before starting it.');
      return;
    }
    setMissionStatus(editingMissionId, 'ready');
    setStatus('ready');
    toast.success('Mission ready for execution.', {
      description: 'Backend/flight controller connection required for real execution.',
    });
  };

  // ---------------------------------------------------------------------
  // Reset
  // ---------------------------------------------------------------------

  const performReset = () => {
    setFormData(DEFAULT_FORM_DATA);
    setWaypoints([]);
    setErrors({});
    setEditingMissionId(null);
    setStatus('draft');
    setResetDialogOpen(false);
  };

  const handleResetRequest = () => {
    if (hasUnsavedPlannerState) {
      setResetDialogOpen(true);
    } else {
      performReset();
    }
  };

  // ---------------------------------------------------------------------
  // Mission History actions
  // ---------------------------------------------------------------------

  const handleEditMission = (mission) => {
    setFormData({
      missionName: mission.missionName || '',
      crop: mission.crop || '',
      field: mission.field || '',
      altitude: mission.altitude ?? '',
      speed: mission.speed ?? '',
      pattern: mission.pattern || 'grid',
      priority: mission.priority || 'normal',
    });
    setWaypoints(mission.waypoints || []);
    setEditingMissionId(mission.id);
    setStatus(mission.status || 'draft');
    setErrors({});
    toast.info(`Editing "${mission.missionName}"`);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDeleteMission = (missionId) => {
    deleteMission(missionId);
    if (editingMissionId === missionId) {
      performReset();
    }
    toast.success('Mission deleted.');
  };

  const handleViewMission = (mission) => {
    setViewMission(mission);
    setViewDialogOpen(true);
  };

  const mapCenter = useMemo(() => {
    const first = [...waypoints].sort((a, b) => a.order - b.order)[0];
    return first ? [first.latitude, first.longitude] : DEFAULT_MAP_CENTER;
  }, [waypoints]);

  return (
    <DashboardLayout>
      <Helmet>
        <title>{`${t('missionPlanning.title')} - ${t('app.title')}`}</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold leading-tight" style={{ textWrap: 'balance' }}>
              {t('missionPlanning.title')}
            </h1>
            <p className="text-muted-foreground mt-1">{t('missionPlanning.subtitle')}</p>
          </div>
          <Badge
            variant="outline"
            className="flex items-center gap-1.5 w-fit bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
          >
            <MonitorSmartphone className="w-3.5 h-3.5" />
            {t('missionPlanning.simulationMode')}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground -mt-4 flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 shrink-0" />
          This mission is currently planned locally in your browser and is not being sent to a real drone yet.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: configuration + objective */}
          <div className="lg:col-span-1 space-y-6">
            <MissionConfigPanel formData={formData} errors={errors} onFieldChange={handleFieldChange} />

            <Card className="hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-lg">
                  {cropLabel ? `${cropLabel} Pollination Mission` : 'Pollination Mission'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This planner defines the flight route for a{' '}
                  {cropLabel ? cropLabel.toLowerCase() : 'selected crop'} pollination flight
                  {fieldLabel ? ` over ${fieldLabel}` : ''}. Flower-level detection and autonomous
                  pollination will be carried out by the onboard system once this mission is connected
                  to the FastAPI backend and flight controller — this page only plans the route.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Center/right column: map + waypoint controls */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-lg">Flight Route</CardTitle>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleAddWaypointManually}>
                      <Plus className="w-4 h-4" />
                      Add Waypoint
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUndoLast}
                      disabled={waypoints.length === 0}
                    >
                      <Undo2 className="w-4 h-4" />
                      Undo Last
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClearRoute}
                      disabled={waypoints.length === 0}
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear Route
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Click anywhere on the map to add a waypoint. Waypoints connect in order, WP1 → WP2 → WP3…
                </p>
                <MissionMap
                  waypoints={waypoints}
                  onMapClick={handleMapClick}
                  onRemoveWaypoint={handleRemoveWaypoint}
                  center={mapCenter}
                />
                {errors.waypoints && <p className="text-xs text-destructive">{errors.waypoints}</p>}

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-center">
                    <div className="text-xs text-blue-700 dark:text-blue-400 mb-1">Waypoints</div>
                    <div className="text-xl font-bold text-blue-900 dark:text-blue-300">{waypoints.length}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-center">
                    <div className="text-xs text-green-700 dark:text-green-400 mb-1">Route Distance</div>
                    <div className="text-xl font-bold text-green-900 dark:text-green-300">
                      {formatDistance(routeDistance)}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-center">
                    <div className="text-xs text-purple-700 dark:text-purple-400 mb-1">Est. Flight Time</div>
                    <div className="text-xl font-bold text-purple-900 dark:text-purple-300">
                      {formatDuration(estimatedFlightTime)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Waypoint table + Mission summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WaypointTable waypoints={waypoints} onRemove={handleRemoveWaypoint} />
          <MissionSummaryCard
            missionNameLabel={formData.missionName}
            cropLabel={cropLabel}
            fieldLabel={fieldLabel}
            altitudeLabel={formData.altitude !== '' ? `${formData.altitude} m` : '—'}
            speedLabel={formData.speed !== '' ? `${formData.speed} m/s` : '—'}
            patternLabel={patternLabel}
            priorityLabel={priorityLabel}
            waypointCount={waypoints.length}
            routeDistanceLabel={formatDistance(routeDistance)}
            flightTimeLabel={formatDuration(estimatedFlightTime)}
            status={status}
            onStartMission={handleStartMission}
            canStartMission={Boolean(editingMissionId) && status !== 'draft'}
          />
        </div>

        {/* Save / Reset action bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Button type="button" variant="outline" onClick={handleResetRequest} className="sm:w-auto">
            <RotateCcw className="w-4 h-4" />
            Reset Planner
          </Button>
          <Button type="button" onClick={handleSaveMission} size="lg" className="sm:w-auto font-semibold">
            <Save className="w-4 h-4" />
            {editingMissionId ? 'Update Mission' : 'Save Mission'}
          </Button>
        </div>

        {/* Mission history */}
        <MissionHistoryTable
          missions={missions}
          onView={handleViewMission}
          onEdit={handleEditMission}
          onDelete={handleDeleteMission}
        />
      </div>

      <MissionViewDialog mission={viewMission} open={viewDialogOpen} onOpenChange={setViewDialogOpen} />

      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset the mission planner?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear the mission name, crop, field, altitude, speed, pattern, priority and all
              waypoints currently on the map. Unsaved changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={performReset}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default MissionPlanning;
