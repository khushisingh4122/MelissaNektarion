import { useState, useEffect, useCallback } from 'react';
import { generateLocalId } from '../utils/geo.js';

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

  const saveMission = useCallback((missionData) => {
    const now = new Date().toISOString();
    const newMission = {
      id: generateLocalId('mission'),
      status: 'planned',
      createdAt: now,
      updatedAt: now,
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
