import { useState, useEffect, useCallback } from 'react';
import { generateLocalId } from '../utils/geo.js';
import { apiServerClient } from '../lib/apiServerClient.js';

const STORAGE_KEY = 'melissa_missions';

/**
 * Safely reads the missions array out of localStorage.
 * Never throws — corrupted or missing data resolves to an empty array so the
 * page can never crash because of malformed storage content.
 * @returns {Array<object>}
 */
function readMissionsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Filter out any malformed entries rather than failing the whole read.
    return parsed.filter(
      (mission) => mission && typeof mission === 'object' && typeof mission.id === 'string'
    );
  } catch (error) {
    console.error('Failed to read missions from localStorage:', error);
    return [];
  }
}

/**
 * Safely persists the missions array to localStorage.
 * @param {Array<object>} missions
 * @returns {boolean} whether the write succeeded
 */
function writeMissionsToStorage(missions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(missions));
    return true;
  } catch (error) {
    console.error('Failed to save missions to localStorage:', error);
    return false;
  }
}

/**
 * Manages Mission Planning history in localStorage.
 * Frontend-only for now; the shape returned here is what will later be sent
 * to the FastAPI backend and Pixhawk/Raspberry Pi flight controller.
 */
export const useMissions = () => {
  const [missions, setMissions] = useState(() => readMissionsFromStorage());
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    const ok = writeMissionsToStorage(missions);
    setStorageError(!ok);
  }, [missions]);

  useEffect(() => {
    let active = true;
    apiServerClient.fetch('/missions/')
      .then((response) => (response.ok ? response.json() : []))
      .then((serverMissions) => {
        if (!active || !Array.isArray(serverMissions)) return;
        setMissions((localMissions) => {
          const localByBackendId = new Map(
            localMissions
              .filter((mission) => mission.backendMissionId)
              .map((mission) => [String(mission.backendMissionId), mission])
          );
          const imported = serverMissions.map((mission) => {
            const existing = localByBackendId.get(String(mission.id));
            return {
              ...existing,
              id: existing?.id || `backend-${mission.id}`,
              backendMissionId: mission.id,
              missionName: mission.mission_name || mission.name,
              name: mission.name,
              field: mission.location,
              crop: mission.crop || existing?.crop || '',
              altitude: mission.altitude ?? existing?.altitude ?? 10,
              speed: mission.speed ?? existing?.speed ?? 3,
              pattern: mission.pattern || existing?.pattern || 'grid',
              priority: mission.priority || existing?.priority || 'normal',
              waypoints: mission.waypoints || existing?.waypoints || [],
              routeDistance: mission.route_distance ?? existing?.routeDistance ?? 0,
              estimatedFlightTime: mission.estimated_flight_time ?? existing?.estimatedFlightTime ?? 0,
              pollinationZones: mission.pollination_zones || existing?.pollinationZones || [],
              pesticideZones: mission.pesticide_zones || existing?.pesticideZones || [],
              status: mission.status || existing?.status || 'saved',
              createdAt: existing?.createdAt || new Date().toISOString(),
            };
          });
          const importedIds = new Set(imported.map((mission) => String(mission.backendMissionId)));
          return [...imported, ...localMissions.filter((mission) => !importedIds.has(String(mission.backendMissionId)))];
        });
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const saveMission = useCallback((missionData) => {
    const now = new Date().toISOString();
    const newMission = {
      id: generateLocalId('mission'),
      status: 'saved',
      createdAt: now,
      updatedAt: now,
      pollinationZones: [],
      pesticideZones: [],
      ...missionData,
    };
    setMissions((prev) => [newMission, ...prev]);
    return newMission;
  }, []);

  const updateMission = useCallback((missionId, missionData) => {
    let updated = null;
    setMissions((prev) =>
      prev.map((mission) => {
        if (mission.id !== missionId) return mission;
        updated = {
          ...mission,
          ...missionData,
          id: mission.id,
          createdAt: mission.createdAt,
          updatedAt: new Date().toISOString(),
        };
        return updated;
      })
    );
    return updated;
  }, []);

  const deleteMission = useCallback((missionId) => {
    setMissions((prev) => prev.filter((mission) => mission.id !== missionId));
  }, []);

  const setMissionStatus = useCallback((missionId, status) => {
    setMissions((prev) =>
      prev.map((mission) =>
        mission.id === missionId
          ? { ...mission, status, updatedAt: new Date().toISOString() }
          : mission
      )
    );
  }, []);

  const getMissionById = useCallback(
    (missionId) => missions.find((mission) => mission.id === missionId) || null,
    [missions]
  );

  return {
    missions,
    storageError,
    saveMission,
    updateMission,
    deleteMission,
    setMissionStatus,
    getMissionById,
  };
};
