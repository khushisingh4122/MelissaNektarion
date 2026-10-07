import { useState, useEffect } from 'react';

const DEFAULT_PROFILE = {
  name: '',
  phone: '',
  email: '',
  location: '',
  farmSize: '',
  cropType: '',
  farmId: ''
};

export const useProfile = () => {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('farmerProfile');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  useEffect(() => {
    localStorage.setItem('farmerProfile', JSON.stringify(profile));
  }, [profile]);

  const updateProfile = (updates) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  return { profile, updateProfile };
};