import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Frontend-only drone simulator.
 *
 * It consumes a saved mission with ordered GPS waypoints and interpolates
 * a simulated drone position between them. No Pixhawk, GPS, Raspberry Pi,
 * backend, or network connection is used.
 */
const INITIAL_BATTERY = 100;
const TICK_MS = 500;
const SIMULATION_SPEED_MULTIPLIER = 8;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const haversineMeters = (a, b) => {
  if (!a || !b) return 0;
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(x));
};

const interpolate = (a, b, ratio) => ({
  latitude: a.latitude + (b.latitude - a.latitude) * ratio,
  longitude: a.longitude + (b.longitude - a.longitude) * ratio,
});

const bearingDegrees = (a, b) => {
  if (!a || !b) return 0;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const dLon = toRad(b.longitude - a.longitude);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
};

const directionLabel = (degrees) => {
  const labels = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return labels[Math.round(degrees / 45) % 8];
};

const buildSegments = (waypoints) => {
  const ordered = [...(waypoints || [])].sort((a, b) => a.order - b.order);
  const segments = [];
  let total = 0;

  for (let i = 0; i < ordered.length - 1; i += 1) {
    const start = ordered[i];
    const end = ordered[i + 1];
    const distance = haversineMeters(start, end);
    segments.push({ start, end, distance, startDistance: total });
    total += distance;
  }

  return { ordered, segments, totalDistance: total };
};

const positionAtDistance = (mission, distance) => {
  const { ordered, segments, totalDistance } = buildSegments(mission?.waypoints);

  if (!ordered.length) {
    return {
      position: null,
      currentWaypointIndex: 0,
      progress: 0,
      bearing: 0,
      totalDistance: 0,
      travelledDistance: 0,
    };
  }

  if (ordered.length === 1 || totalDistance <= 0) {
    return {
      position: { latitude: ordered[0].latitude, longitude: ordered[0].longitude },
      currentWaypointIndex: 1,
      progress: 100,
      bearing: 0,
      totalDistance,
      travelledDistance: 0,
    };
  }

  const travelled = clamp(distance, 0, totalDistance);

  for (let i = 0; i < segments.length; i += 1) {
    const segment = segments[i];
    const segmentEnd = segment.startDistance + segment.distance;

    if (travelled <= segmentEnd || i === segments.length - 1) {
      const ratio = segment.distance > 0
        ? clamp((travelled - segment.startDistance) / segment.distance, 0, 1)
        : 1;

      return {
        position: interpolate(segment.start, segment.end, ratio),
        currentWaypointIndex: i + 2,
        progress: (travelled / totalDistance) * 100,
        bearing: bearingDegrees(segment.start, segment.end),
        totalDistance,
        travelledDistance: travelled,
      };
    }
  }

  return {
    position: ordered[ordered.length - 1],
    currentWaypointIndex: ordered.length,
    progress: 100,
    bearing: 0,
    totalDistance,
    travelledDistance: totalDistance,
  };
};

export const useDroneSimulation = (mission) => {
  const [state, setState] = useState(() => ({
    status: 'idle',
    distance: 0,
    elapsedSeconds: 0,
    battery: INITIAL_BATTERY,
    altitude: 0,
    position: null,
    currentWaypointIndex: 0,
    progress: 0,
    bearing: 0,
  }));

  const lastTickRef = useRef(null);

  const route = useMemo(() => buildSegments(mission?.waypoints), [mission]);

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      distance: 0,
      elapsedSeconds: 0,
      battery: INITIAL_BATTERY,
      altitude: 0,
      position: route.ordered[0]
        ? { latitude: route.ordered[0].latitude, longitude: route.ordered[0].longitude }
        : null,
      currentWaypointIndex: route.ordered.length ? 1 : 0,
      progress: 0,
      bearing: 0,
    });
    lastTickRef.current = null;
  }, [route.ordered]);

  useEffect(() => {
    reset();
  }, [mission?.id, reset]);

  const start = useCallback(() => {
    if (!mission || route.ordered.length < 2) return false;
    setState((prev) => ({
      ...prev,
      status: prev.status === 'completed' ? 'idle' : 'takeoff',
      altitude: Number(mission.altitude) || 10,
    }));
    lastTickRef.current = performance.now();
    return true;
  }, [mission, route.ordered.length]);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, status: prev.status === 'flying' ? 'paused' : prev.status }));
  }, []);

  const resume = useCallback(() => {
    setState((prev) => (prev.status === 'paused' ? { ...prev, status: 'flying' } : prev));
    lastTickRef.current = performance.now();
  }, []);

  useEffect(() => {
    if (state.status !== 'takeoff' && state.status !== 'flying') return undefined;

    const timer = window.setInterval(() => {
      const now = performance.now();
      const previous = lastTickRef.current ?? now;
      const deltaSeconds = Math.min((now - previous) / 1000, 1);
      lastTickRef.current = now;

      setState((prev) => {
        const speed = Math.max(Number(mission?.speed) || 3, 0.5);
        const metersPerTick = speed * SIMULATION_SPEED_MULTIPLIER * deltaSeconds;

        if (prev.status === 'takeoff') {
          const nextAltitude = Math.min(Number(mission?.altitude) || 10, prev.altitude + 3 * deltaSeconds);
          if (nextAltitude >= (Number(mission?.altitude) || 10) - 0.1) {
            return { ...prev, status: 'flying', altitude: Number(mission?.altitude) || 10 };
          }
          return { ...prev, altitude: nextAltitude, elapsedSeconds: prev.elapsedSeconds + deltaSeconds };
        }

        const nextDistance = Math.min(route.totalDistance, prev.distance + metersPerTick);
        const routeState = positionAtDistance(mission, nextDistance);
        const batteryDrain = (metersPerTick / Math.max(route.totalDistance, 100)) * 14;
        const completed = nextDistance >= route.totalDistance - 0.01;

        return {
          ...prev,
          status: completed ? 'landing' : 'flying',
          distance: nextDistance,
          elapsedSeconds: prev.elapsedSeconds + deltaSeconds,
          battery: clamp(prev.battery - batteryDrain, 18, 100),
          altitude: completed ? Math.max(0, prev.altitude - 2 * deltaSeconds) : Number(mission?.altitude) || 10,
          position: routeState.position,
          currentWaypointIndex: routeState.currentWaypointIndex,
          progress: routeState.progress,
          bearing: routeState.bearing,
        };
      });
    }, TICK_MS);

    return () => window.clearInterval(timer);
  }, [state.status, mission, route.totalDistance]);

  useEffect(() => {
    if (state.status !== 'landing') return undefined;

    const timer = window.setInterval(() => {
      setState((prev) => {
        const nextAltitude = Math.max(0, prev.altitude - 3);
        if (nextAltitude <= 0) {
          return { ...prev, status: 'completed', altitude: 0, progress: 100 };
        }
        return { ...prev, altitude: nextAltitude };
      });
    }, 500);

    return () => window.clearInterval(timer);
  }, [state.status]);

  const formatted = useMemo(() => {
    const remaining = Math.max(0, route.totalDistance - state.distance);
    const speed = Math.max(Number(mission?.speed) || 3, 0.5);
    const remainingSeconds = state.status === 'completed' ? 0 : remaining / speed / SIMULATION_SPEED_MULTIPLIER;

    return {
      remainingDistance: remaining,
      remainingSeconds,
      speed,
      direction: directionLabel(state.bearing),
    };
  }, [mission?.speed, route.totalDistance, state]);

  return {
    ...state,
    ...formatted,
    start,
    pause,
    resume,
    reset,
    route,
    simulationSpeedMultiplier: SIMULATION_SPEED_MULTIPLIER,
  };
};
