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
import { MapPin, Plus, Undo2, Trash2, Save, RotateCcw, Radio, MonitorSmartphone, Check, X } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation.jsx';
import { apiServerClient } from '../lib/apiServerClient.js';
import { fieldZones } from '../data/sampleData.js';

const DEFAULT_FORM_DATA = {
  missionName: 'Pollination Mission 01',
  crop: '',
  field: '',
  altitude: 10,
  speed: 3,
  pattern: 'grid',
  priority: 'normal',
};

const MISSION_TYPES = [
  { value: 'pollination', label: 'Pollen' },
  { value: 'crop-monitoring', label: 'Crop' },
  { value: 'pest-detection', label: 'Pest' },
];

const labelFor = (options, value) => options.find((opt) => opt.value === value)?.label || '';

const FIELD_ZONE_BY_ID = {
  'field-a': 'north',
  'field-b': 'east',
  'field-c': 'south',
  'field-d': 'west',
};

const isPointInsidePolygon = (latitude, longitude, polygon) => {
  const epsilon = 0.000001;

  const isOnSegment = (start, end) => {
    const cross = (latitude - start[0]) * (end[1] - start[1]) -
      (longitude - start[1]) * (end[0] - start[0]);
    if (Math.abs(cross) > epsilon) return false;
    return latitude >= Math.min(start[0], end[0]) - epsilon &&
      latitude <= Math.max(start[0], end[0]) + epsilon &&
      longitude >= Math.min(start[1], end[1]) - epsilon &&
      longitude <= Math.max(start[1], end[1]) + epsilon;
  };

  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const [currentLatitude, currentLongitude] = polygon[index];
    const [previousLatitude, previousLongitude] = polygon[previous];
    if (isOnSegment([currentLatitude, currentLongitude], [previousLatitude, previousLongitude])) {
      return true;
    }
    const intersects =
      currentLongitude > longitude !== previousLongitude > longitude &&
      latitude < ((previousLatitude - currentLatitude) * (longitude - currentLongitude)) /
        (previousLongitude - currentLongitude) + currentLatitude;
    if (intersects) inside = !inside;
  }
  return inside;
};

const createWaypoint = (latitude, longitude, order) => ({
  id: generateLocalId('wp'),
  latitude,
  longitude,
  order,
});

const generatePatternWaypoints = (pattern, boundary) => {
  if (boundary.length < 3) return [];

  const latitudes = boundary.map(([latitude]) => latitude);
  const longitudes = boundary.map(([, longitude]) => longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const latitudePadding = (maxLatitude - minLatitude) * 0.12;
  const longitudePadding = (maxLongitude - minLongitude) * 0.12;
  const innerMinLatitude = minLatitude + latitudePadding;
  const innerMaxLatitude = maxLatitude - latitudePadding;
  const innerMinLongitude = minLongitude + longitudePadding;
  const innerMaxLongitude = maxLongitude - longitudePadding;

  if (pattern === 'linear') {
    return Array.from({ length: 6 }, (_, index) => {
      const ratio = index / 5;
      return createWaypoint(
        innerMinLatitude + (innerMaxLatitude - innerMinLatitude) * ratio,
        innerMinLongitude + (innerMaxLongitude - innerMinLongitude) * ratio,
        index + 1
      );
    });
  }

  if (pattern !== 'grid') return [];

  const rows = 5;
  const columns = 5;
  const generated = [];
  for (let row = 0; row < rows; row += 1) {
    const latitudeRatio = row / (rows - 1);
    const latitude = innerMaxLatitude - (innerMaxLatitude - innerMinLatitude) * latitudeRatio;
    const columnIndexes = row % 2 === 0
      ? Array.from({ length: columns }, (_, index) => index)
      : Array.from({ length: columns }, (_, index) => columns - 1 - index);
    columnIndexes.forEach((column) => {
      const longitudeRatio = column / (columns - 1);
      generated.push(createWaypoint(
        latitude,
        innerMinLongitude + (innerMaxLongitude - innerMinLongitude) * longitudeRatio,
        generated.length + 1
      ));
    });
  }
  return generated;
};

const MissionPlanning = () => {
  const { t } = useTranslation();
  const { missions, saveMission, updateMission, deleteMission, setMissionStatus } = useMissions();

  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [waypoints, setWaypoints] = useState([]);
  const [errors, setErrors] = useState({});
  const [editingMissionId, setEditingMissionId] = useState(null);
  const [status, setStatus] = useState('draft');
  const [missionType, setMissionType] = useState('pollination');
  const [droneId, setDroneId] = useState('1');
  const [backendMissionId, setBackendMissionId] = useState(null);
  const [mapMode, setMapMode] = useState('route');
  const [zoneShape, setZoneShape] = useState('polygon');
  const [preflight, setPreflight] = useState({ status: 'not_checked', reasons: [] });
  const [pollinationZones, setPollinationZones] = useState([]);
  const [pesticideZones, setPesticideZones] = useState([]);
  const [draftZone, setDraftZone] = useState([]);

  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [viewMission, setViewMission] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const cropLabel = labelFor(CROP_OPTIONS, formData.crop);
  const fieldLabel = labelFor(FIELD_OPTIONS, formData.field);
  const patternLabel = labelFor(PATTERN_OPTIONS, formData.pattern) || '—';
  const priorityLabel = labelFor(PRIORITY_OPTIONS, formData.priority) || '—';
  const selectedField = fieldZones.find(
    (field) => field.id === FIELD_ZONE_BY_ID[formData.field]
  );
  const selectedFieldBoundary = selectedField?.geometry.coordinates[0].map(
    ([longitude, latitude]) => [latitude, longitude]
  ) || [];

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
    if (key === 'field' && value !== formData.field) {
      setWaypoints([]);
      setPollinationZones([]);
      setPesticideZones([]);
      setDraftZone([]);
      setMapMode('route');
      setZoneShape('polygon');
      setErrors((prev) => ({ ...prev, waypoints: undefined }));
    }
  };

  const handleMapClick = (lat, lng) => {
    if (!formData.field) {
      toast.error('Select a field before adding waypoints.');
      return;
    }

    if (selectedFieldBoundary.length > 2 && !isPointInsidePolygon(lat, lng, selectedFieldBoundary)) {
      toast.error('Select waypoints inside the selected field boundary.');
      return;
    }

    if (mapMode !== 'route') {
      if (zoneShape === 'rectangle') {
        if (draftZone.length === 0) {
          setDraftZone([[lat, lng]]);
        } else {
          const [startLatitude, startLongitude] = draftZone[0];
          finishZone([
            [startLatitude, startLongitude],
            [startLatitude, lng],
            [lat, lng],
            [lat, startLongitude],
          ]);
        }
        return;
      }
      setDraftZone((prev) => [...prev, [lat, lng]]);
      return;
    }

    setWaypoints((prev) => {
      const nextOrder = prev.length + 1;
      return [...prev, { id: generateLocalId('wp'), latitude: lat, longitude: lng, order: nextOrder }];
    });
    setErrors((prev) => ({ ...prev, waypoints: undefined }));
  };

  const handleMapMove = (lat, lng) => {
    if (mapMode === 'route' || zoneShape !== 'rectangle' || draftZone.length !== 1) return;
    setDraftZone([draftZone[0], [lat, lng]]);
  };

  const finishZone = (zoneCoordinates = draftZone) => {
    if (mapMode === 'route' || zoneCoordinates.length < 3) {
      toast.error('Add at least 3 points to draw a zone.');
      return;
    }

    const zone = {
      id: generateLocalId(`${mapMode}-zone`),
      name: `${mapMode === 'pollination' ? 'Pollination' : 'Pesticide'} zone ${mapMode === 'pollination' ? pollinationZones.length + 1 : pesticideZones.length + 1}`,
      type: mapMode,
      shape: zoneShape,
      coordinates: zoneCoordinates,
    };
    if (mapMode === 'pollination') setPollinationZones((prev) => [...prev, zone]);
    else setPesticideZones((prev) => [...prev, zone]);
    setDraftZone([]);
    toast.success(`${zone.name} saved.`);
  };

  const clearDraftZone = () => setDraftZone([]);

  const removeZone = (zoneId, zoneType) => {
    if (zoneType === 'pollination') setPollinationZones((prev) => prev.filter((zone) => zone.id !== zoneId));
    else setPesticideZones((prev) => prev.filter((zone) => zone.id !== zoneId));
  };

  const handleGenerateRoute = () => {
    if (!formData.field) {
      toast.error('Select a field before generating a route.');
      return;
    }
    if (formData.pattern === 'custom') {
      toast.info('Custom route selected. Click inside the field to add waypoints.');
      return;
    }
    const generatedWaypoints = generatePatternWaypoints(formData.pattern, selectedFieldBoundary);
    setWaypoints(generatedWaypoints);
    setErrors((prev) => ({ ...prev, waypoints: undefined }));
    toast.success(`${patternLabel} route generated with ${generatedWaypoints.length} waypoints.`);
  };

  const renumberWaypoints = (list) =>
    [...list]
      .sort((a, b) => a.order - b.order)
      .map((wp, index) => ({ ...wp, order: index + 1 }));

  const handleRemoveWaypoint = (id) => {
    setWaypoints((prev) => renumberWaypoints(prev.filter((wp) => wp.id !== id)));
  };

  const handleUndoLast = () => {
    if (mapMode === 'route') {
      setWaypoints((prev) => {
        if (prev.length === 0) return prev;
        const ordered = [...prev].sort((a, b) => a.order - b.order);
        ordered.pop();
        return ordered;
      });
      return;
    }

    if (draftZone.length > 0) {
      setDraftZone([]);
      return;
    }

    if (mapMode === 'pollination') {
      setPollinationZones((prev) => prev.slice(0, -1));
    } else {
      setPesticideZones((prev) => prev.slice(0, -1));
    }
  };

  const canUndo = mapMode === 'route'
    ? waypoints.length > 0
    : draftZone.length > 0 || (mapMode === 'pollination' ? pollinationZones.length > 0 : pesticideZones.length > 0);

  const handleClearRoute = () => {
    setWaypoints([]);
  };

  const handleAddWaypointManually = () => {
    setFormData((prev) => ({ ...prev, pattern: 'custom' }));
    toast.info('Custom mode active. Click the field to place WP1, WP2, and the next points.');
  };

  // ---------------------------------------------------------------------
  // Validation + Save
  // ---------------------------------------------------------------------

  const validate = () => {
    const nextErrors = {};
    if (!formData.missionName.trim()) nextErrors.missionName = 'Mission name is required.';
    const duplicateName = missions.some((mission) =>
      mission.id !== editingMissionId &&
      mission.missionName?.trim().toLowerCase() === formData.missionName.trim().toLowerCase()
    );
    if (duplicateName) nextErrors.missionName = 'Use a different mission name. This name already exists.';
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

  const handleSaveMission = async () => {
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
      pollinationZones,
      pesticideZones,
      status: 'saved',
    };

    let localMissionId = editingMissionId;
    if (editingMissionId) {
      updateMission(editingMissionId, payload);
    } else {
      const created = saveMission(payload);
      setEditingMissionId(created.id);
      localMissionId = created.id;
    }

    let savedBackendMissionId = backendMissionId;
    try {
      if (backendMissionId) {
        await apiServerClient.fetch(`/missions/${backendMissionId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'saved', pollination_zones: payload.pollinationZones, pesticide_zones: payload.pesticideZones }),
        });
      } else {
        const response = await apiServerClient.fetch('/missions/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.missionName.trim(),
            location: formData.field,
            drone_id: Number(droneId),
            status: 'saved',
            mission_name: payload.missionName,
            crop: payload.crop,
            altitude: payload.altitude,
            speed: payload.speed,
            pattern: payload.pattern,
            priority: payload.priority,
            waypoints: payload.waypoints,
            route_distance: payload.routeDistance,
            estimated_flight_time: payload.estimatedFlightTime,
            pollination_zones: payload.pollinationZones,
            pesticide_zones: payload.pesticideZones,
          }),
        });
        if (!response.ok) throw new Error('Mission could not be saved to the backend.');
        const createdBackendMission = await response.json();
        setBackendMissionId(createdBackendMission.id);
        savedBackendMissionId = createdBackendMission.id;
      }
    } catch (error) {
      toast.error(error.message || 'Backend mission save failed.');
      return;
    }

    localStorage.setItem('melissa_active_mission', JSON.stringify({
      ...payload,
      id: localMissionId || null,
      backendMissionId: savedBackendMissionId,
    }));
    if (localMissionId) updateMission(localMissionId, { ...payload, backendMissionId: savedBackendMissionId });

    setStatus('saved');
    setPreflight({ status: 'not_checked', reasons: [] });
    toast.success('Mission saved successfully. Start it manually when ready.');
  };

  // ---------------------------------------------------------------------
  // Start Mission (frontend-only simulation)
  // ---------------------------------------------------------------------

  const handleCheckMission = async () => {
    if (!editingMissionId || !backendMissionId) {
      setPreflight({ status: 'failed', reasons: ['Save the mission to the backend before checking it.'] });
      toast.error('Save the mission before checking it.');
      return;
    }

    setPreflight({ status: 'checking', reasons: [] });
    try {
      const response = await apiServerClient.fetch(`/missions/${backendMissionId}/validate`, { method: 'POST' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.valid === false) {
        const reasons = result.reasons || [result.detail || 'Mission pre-flight checks failed.'];
        setPreflight({ status: 'failed', reasons });
        toast.error('Mission cannot start.', { description: reasons.join(' ') });
        return;
      }
      setPreflight({ status: 'passed', reasons: [] });
      setStatus('ready');
      toast.success('Mission checks passed. You can start the mission now.');
    } catch (error) {
      setPreflight({ status: 'failed', reasons: [error.message || 'Unable to check the mission.'] });
      toast.error(error.message || 'Mission pre-flight check failed.');
    }
  };

  const handleStartMission = async () => {
    if (!editingMissionId) {
      toast.error('Save the mission before starting it.');
      return;
    }
    if (!backendMissionId) {
      toast.error('Save this mission to the backend before dispatching it.');
      return;
    }
    if (preflight.status !== 'passed') {
      toast.error('Check the mission before starting it.');
      return;
    }
    try {
      const dispatch = await apiServerClient.fetch(`/missions/${backendMissionId}/dispatch`, { method: 'POST' });
      if (!dispatch.ok) throw new Error('Mission dispatch failed.');
      setMissionStatus(editingMissionId, 'dispatched');
      setStatus('dispatched');
      toast.success('Mission sent to drone.', { description: 'Live monitoring is now available.' });
    } catch (error) {
      toast.error(error.message || 'Mission dispatch failed.');
    }
  };

  // ---------------------------------------------------------------------
  // Reset
  // ---------------------------------------------------------------------

  const performReset = () => {
    setFormData(DEFAULT_FORM_DATA);
    setWaypoints([]);
    setPollinationZones([]);
    setPesticideZones([]);
    setDraftZone([]);
    setMapMode('route');
    setZoneShape('polygon');
    setErrors({});
    setEditingMissionId(null);
    setBackendMissionId(null);
    setStatus('draft');
    setPreflight({ status: 'not_checked', reasons: [] });
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
    setPollinationZones(mission.pollinationZones || []);
    setPesticideZones(mission.pesticideZones || []);
    setDraftZone([]);
    setMapMode('route');
    setZoneShape('polygon');
    setEditingMissionId(mission.id);
    setStatus(mission.status || 'draft');
    setPreflight({ status: 'not_checked', reasons: [] });
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

        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[#cbd8c5] bg-[#f5f7f1] p-3 sm:grid-cols-4 lg:grid-cols-8">
          {['Select Field', 'Select Mission', 'Generate Route', 'Select Drone', 'Validate', 'Send to Drone', 'Flight', 'Live Monitoring'].map((step, index) => (
            <div key={step} className={`rounded-xl px-2 py-2 text-center text-[10px] font-semibold ${index <= 2 ? 'bg-[#dcefd5] text-[#355340]' : 'text-[#718446]'}`}>
              <span className="mb-1 block text-[9px] text-[#9aa994]">0{index + 1}</span>{step}
            </div>
          ))}
        </div>

        <Card className="border border-[#cbd8c5] bg-[#f5f7f1]">
          <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-xs font-semibold text-[#55705c]">Mission type
              <select value={missionType} onChange={(event) => setMissionType(event.target.value)} className="mt-1 block w-full rounded-xl border border-[#cbd8c5] bg-[#eef4e9] px-3 py-2 text-sm text-[#183d2d]">
                {MISSION_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label} mission</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-[#55705c]">Drone
              <select value={droneId} onChange={(event) => setDroneId(event.target.value)} className="mt-1 block w-full rounded-xl border border-[#cbd8c5] bg-[#eef4e9] px-3 py-2 text-sm text-[#183d2d]">
                <option value="1">Drone A1 • Active</option><option value="2">Drone B2 • Idle</option>
              </select>
            </label>
            <div className="flex items-end rounded-xl bg-[#e8f1e2] px-3 py-2 text-xs text-[#55705c]">{status === 'dispatched' ? 'Mission dispatched • Live monitoring ready' : 'Route is local until you validate and send it.'}</div>
          </CardContent>
        </Card>

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
                    <Button type="button" variant="outline" size="sm" onClick={handleGenerateRoute}>
                      <MapPin className="w-4 h-4" />
                      Generate Route
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddWaypointManually}>
                      <Plus className="w-4 h-4" />
                      Add Custom Point
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUndoLast}
                      disabled={!canUndo}
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
                  Choose a map mode, then click inside the selected field. Route mode adds waypoints; zone modes draw the areas where the pump or pesticide system may operate.
                </p>
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#cbd8c5] bg-[#eef4e9] p-2">
                  <span className="mr-1 text-xs font-semibold text-[#55705c]">Map mode:</span>
                  {[
                    { value: 'route', label: 'Flight route', className: 'border-blue-300 text-blue-700' },
                    { value: 'pollination', label: 'Pollination zone', className: 'border-amber-300 text-amber-700' },
                    { value: 'pesticide', label: 'Pesticide zone', className: 'border-red-300 text-red-700' },
                  ].map((mode) => (
                    <Button
                      key={mode.value}
                      type="button"
                      size="sm"
                      variant={mapMode === mode.value ? 'default' : 'outline'}
                      className={mapMode === mode.value ? '' : mode.className}
                      onClick={() => { setMapMode(mode.value); setDraftZone([]); }}
                    >
                      {mode.label}
                    </Button>
                  ))}
                  {mapMode !== 'route' && (
                    <>
                      <span className="ml-2 text-xs font-semibold text-[#55705c]">Shape:</span>
                      <Button type="button" size="sm" variant={zoneShape === 'polygon' ? 'default' : 'outline'} onClick={() => { setZoneShape('polygon'); setDraftZone([]); }}>
                        Lines / polygon
                      </Button>
                      <Button type="button" size="sm" variant={zoneShape === 'rectangle' ? 'default' : 'outline'} onClick={() => { setZoneShape('rectangle'); setDraftZone([]); }}>
                        Rectangle / box
                      </Button>
                      {zoneShape === 'polygon' && <Button type="button" size="sm" onClick={() => finishZone()} disabled={draftZone.length < 3}>
                        <Check className="h-4 w-4" /> Finish zone ({draftZone.length}/3+)
                      </Button>}
                      {zoneShape === 'rectangle' && <span className="px-2 text-xs text-muted-foreground">Click first corner, move to resize, click opposite corner.</span>}
                      <Button type="button" size="sm" variant="ghost" onClick={clearDraftZone} disabled={draftZone.length === 0}>
                        <X className="h-4 w-4" /> Clear points
                      </Button>
                    </>
                  )}
                </div>
                <MissionMap
                  waypoints={waypoints}
                  onMapClick={handleMapClick}
                  onMapMove={handleMapMove}
                  onRemoveWaypoint={handleRemoveWaypoint}
                  zones={[...pollinationZones, ...pesticideZones]}
                  draftZone={draftZone}
                  center={mapCenter}
                  fieldBoundary={selectedFieldBoundary}
                  fieldName={selectedField?.name}
                />
                {errors.waypoints && <p className="text-xs text-destructive">{errors.waypoints}</p>}

                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                    Flight route: click to add waypoints
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    Pollination zones: {pollinationZones.length} saved
                  </div>
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                    Pesticide zones: {pesticideZones.length} saved
                  </div>
                </div>

                {(pollinationZones.length > 0 || pesticideZones.length > 0) && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[...pollinationZones, ...pesticideZones].map((zone) => (
                      <div key={zone.id} className="flex items-center justify-between rounded-lg border border-[#cbd8c5] bg-white px-3 py-2 text-xs">
                        <span className={zone.type === 'pollination' ? 'text-amber-700' : 'text-red-700'}>{zone.name}</span>
                        <button type="button" className="text-muted-foreground hover:text-destructive" onClick={() => removeZone(zone.id, zone.type)} aria-label={`Remove ${zone.name}`}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

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
            preflight={preflight}
            onCheckMission={handleCheckMission}
            onStartMission={handleStartMission}
            canStartMission={Boolean(editingMissionId) && status === 'ready'}
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
