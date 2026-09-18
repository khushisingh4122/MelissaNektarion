import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import {
  Activity,
  Battery,
  CheckCircle2,
  Clock3,
  Gauge,
  MapPin,
  Navigation,
  Pause,
  Play,
  RotateCcw,
  Route as RouteIcon,
  ShieldCheck,
  Square,
  Timer,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import DroneSimulationMap from '../components/DroneSimulationMap.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { useMissions } from '../hooks/useMissions.js';
import { useDroneSimulation } from '../hooks/useDroneSimulation.js';
import { formatDistance, formatDuration } from '../utils/geo.js';

const statusMeta = {
  idle: { label: 'Ready', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  takeoff: { label: 'Taking Off', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  flying: { label: 'Flying', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  paused: { label: 'Paused', className: 'bg-violet-50 text-violet-700 border-violet-200' },
  landing: { label: 'Landing', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  completed: { label: 'Completed', className: 'bg-blue-50 text-blue-700 border-blue-200' },
};

const formatCoord = (value) => (Number.isFinite(value) ? value.toFixed(6) : '—');

const Metric = ({ icon: Icon, label, value, detail }) => (
  <div className="rounded-xl border border-border bg-background p-4">
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="h-4 w-4" />
      <span className="text-xs font-medium">{label}</span>
    </div>
    <div className="mt-2 text-xl font-bold tracking-tight">{value}</div>
    {detail && <div className="mt-1 text-xs text-muted-foreground">{detail}</div>}
  </div>
);

const DroneSimulation = () => {
  const { missions } = useMissions();
  const [selectedId, setSelectedId] = useState(missions[0]?.id || '');

  const selectedMission = useMemo(
    () => missions.find((mission) => mission.id === selectedId) || missions[0] || null,
    [missions, selectedId]
  );

  const simulation = useDroneSimulation(selectedMission);
  const meta = statusMeta[simulation.status] || statusMeta.idle;

  const missionReady = selectedMission && selectedMission.waypoints?.length >= 2;

  const handleStart = () => {
    simulation.start();
  };

  const elapsed = simulation.elapsedSeconds || 0;

  return (
    <DashboardLayout>
      <Helmet>
        <title>Drone Simulation - MelissaNektarion</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Drone Simulation</h1>
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                <Activity className="mr-1.5 h-3.5 w-3.5" />
                Frontend Simulation
              </Badge>
            </div>
            <p className="mt-1 max-w-2xl text-muted-foreground">
              Test mission execution, waypoint navigation and live telemetry before connecting the real UAV.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleStart}
              disabled={!missionReady || ['takeoff', 'flying', 'landing'].includes(simulation.status)}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              {simulation.status === 'completed' ? 'Run Again' : 'Start Simulation'}
            </Button>

            {simulation.status === 'flying' && (
              <Button variant="outline" onClick={simulation.pause} className="gap-2">
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            )}

            {simulation.status === 'paused' && (
              <Button variant="outline" onClick={simulation.resume} className="gap-2">
                <Play className="h-4 w-4" />
                Resume
              </Button>
            )}

            <Button variant="outline" onClick={simulation.reset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        <Card className="border-blue-200 bg-blue-50/60 dark:border-blue-900/60 dark:bg-blue-950/20">
          <CardContent className="flex gap-3 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-200">Safe software-only test</p>
              <p className="mt-1 text-sm text-blue-800/80 dark:text-blue-200/70">
                This simulator only moves a virtual drone on the dashboard. It does not send commands to Pixhawk,
                Raspberry Pi, motors, GPS or any physical UAV hardware.
              </p>
            </div>
          </CardContent>
        </Card>

        {!missions.length ? (
          <Card>
            <CardContent className="flex min-h-[260px] flex-col items-center justify-center text-center">
              <RouteIcon className="h-10 w-10 text-muted-foreground" />
              <h2 className="mt-4 text-lg font-semibold">No saved missions yet</h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Create and save a mission in Mission Planning first. The simulator will use its waypoints and flight settings.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg">Simulation Mission</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">Select a saved mission to test.</p>
                  </div>
                  <select
                    value={selectedMission?.id || ''}
                    onChange={(event) => setSelectedId(event.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring sm:w-[320px]"
                  >
                    {missions.map((mission) => (
                      <option key={mission.id} value={mission.id}>
                        {mission.missionName} — {mission.crop || 'Crop not selected'}
                      </option>
                    ))}
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                  <span className="font-medium">{selectedMission?.missionName}</span>
                  <span className="text-muted-foreground">{selectedMission?.crop || '—'}</span>
                  <span className="text-muted-foreground">{selectedMission?.field || '—'}</span>
                  <span className="text-muted-foreground">
                    {selectedMission?.waypoints?.length || 0} waypoints
                  </span>
                  <Badge variant="outline" className={meta.className}>{meta.label}</Badge>
                </div>
              </CardContent>
            </Card>

            {!missionReady && (
              <Card className="border-amber-200 bg-amber-50/60">
                <CardContent className="p-4 text-sm text-amber-800">
                  This mission needs at least 2 waypoints before simulation can start.
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <DroneSimulationMap mission={selectedMission} simulation={simulation} />

              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Live Telemetry</CardTitle>
                      <Badge variant="outline" className={meta.className}>{meta.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <Metric
                        icon={Navigation}
                        label="Altitude"
                        value={`${simulation.altitude.toFixed(1)} m`}
                        detail={`Target ${Number(selectedMission?.altitude || 0).toFixed(0)} m`}
                      />
                      <Metric
                        icon={Gauge}
                        label="Speed"
                        value={`${simulation.speed.toFixed(1)} m/s`}
                        detail={`${(simulation.speed * 3.6).toFixed(1)} km/h`}
                      />
                      <Metric
                        icon={Battery}
                        label="Battery"
                        value={`${simulation.battery.toFixed(0)}%`}
                        detail="Simulated"
                      />
                      <Metric
                        icon={Timer}
                        label="Elapsed"
                        value={formatDuration(elapsed)}
                        detail="Simulation time"
                      />
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium">Mission Progress</span>
                        <span className="font-semibold">{simulation.progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={simulation.progress} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Navigation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Current waypoint</span>
                      <span className="font-semibold">
                        {simulation.currentWaypointIndex ? `WP${simulation.currentWaypointIndex}` : '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Direction</span>
                      <span className="font-semibold">{simulation.direction}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Travelled</span>
                      <span className="font-semibold">{formatDistance(simulation.distance)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Remaining</span>
                      <span className="font-semibold">{formatDistance(simulation.remainingDistance)}</span>
                    </div>
                    <div className="flex items-start justify-between gap-4 border-t pt-3">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        Position
                      </span>
                      <span className="text-right font-mono text-xs">
                        {formatCoord(simulation.position?.latitude)}
                        <br />
                        {formatCoord(simulation.position?.longitude)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Mission Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Route distance</span>
                      <span className="font-medium">{formatDistance(simulation.route.totalDistance)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Configured altitude</span>
                      <span className="font-medium">{selectedMission?.altitude} m</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Configured speed</span>
                      <span className="font-medium">{selectedMission?.speed} m/s</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Flight pattern</span>
                      <span className="font-medium capitalize">{selectedMission?.pattern || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
                      <Clock3 className="h-4 w-4" />
                      Simulation runs faster than real time for convenient testing.
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {simulation.status === 'completed' && (
              <Card className="border-emerald-200 bg-emerald-50/60">
                <CardContent className="flex items-center gap-3 p-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-emerald-900">Simulation completed successfully</p>
                    <p className="text-sm text-emerald-800/80">
                      The virtual UAV reached the final waypoint and completed the landing sequence.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DroneSimulation;
