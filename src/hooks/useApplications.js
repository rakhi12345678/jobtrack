import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'jobtrack-applications';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function uid() {
  return 'app_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

export function useApplications() {
  const [apps, setApps] = useState(loadFromStorage);

  // Persist to localStorage whenever the list changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
    } catch (e) {
      // storage can fail (quota, private mode) — fail silently, UI still works in-memory
    }
  }, [apps]);

  const addApp = useCallback((data) => {
    const newApp = { id: uid(), createdAt: Date.now(), ...data };
    setApps((prev) => [...prev, newApp]);
    return newApp;
  }, []);

  const updateApp = useCallback((id, data) => {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
  }, []);

  const deleteApp = useCallback((id) => {
    setApps((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { apps, addApp, updateApp, deleteApp };
}
