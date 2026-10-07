import { useState, useEffect } from 'react';

export const useWebSocketSimulator = (initialData) => {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => ({
        ...prevData,
        battery: Math.max(20, Math.min(100, prevData.battery + (Math.random() - 0.5) * 5)),
        altitude: Math.max(30, Math.min(60, prevData.altitude + (Math.random() - 0.5) * 3)),
        speed: Math.max(5, Math.min(15, prevData.speed + (Math.random() - 0.5) * 2)),
        missionProgress: Math.min(100, prevData.missionProgress + Math.random() * 2),
        areaCoverage: Math.min(prevData.totalArea, prevData.areaCoverage + Math.random() * 3)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return data;
};