// Local storage hook for persisting application data

import { useState, useEffect } from 'react';

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
};

// Utility functions for specific data types
export const saveGraphData = (data: any) => {
  try {
    localStorage.setItem('gridflow_graph_data', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving graph data:', error);
  }
};

export const loadGraphData = () => {
  try {
    const data = localStorage.getItem('gridflow_graph_data');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading graph data:', error);
    return null;
  }
};

export const saveWarehouseData = (warehouseId: string, data: any) => {
  try {
    const key = `gridflow_warehouse_${warehouseId}`;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving warehouse data:', error);
  }
};

export const loadWarehouseData = (warehouseId: string) => {
  try {
    const key = `gridflow_warehouse_${warehouseId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading warehouse data:', error);
    return null;
  }
};