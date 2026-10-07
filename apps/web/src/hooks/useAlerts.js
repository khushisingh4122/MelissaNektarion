import { useState } from 'react';

export const useAlerts = (initialAlerts) => {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [filter, setFilter] = useState('all');

  const markAsRead = (id) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const dismissAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.type === filter);

  const unreadCount = alerts.filter(alert => !alert.read).length;

  return {
    alerts: filteredAlerts,
    allAlerts: alerts,
    filter,
    setFilter,
    markAsRead,
    dismissAlert,
    unreadCount
  };
};