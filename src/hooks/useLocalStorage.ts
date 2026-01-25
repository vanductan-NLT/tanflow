import { useState, useEffect, useCallback, useRef } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Use ref to track if this is the initial mount
  const isInitialMount = useRef(true);
  
  // Read initial value from localStorage
  const getInitialValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        return JSON.parse(item) as T;
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    return initialValue;
  };

  const [storedValue, setStoredValue] = useState<T>(getInitialValue);

  // Sync to localStorage whenever value changes (except on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Create a stable setValue function
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      if (value instanceof Function) {
        return value(prev);
      }
      return value;
    });
  }, []);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          const newValue = JSON.parse(event.newValue) as T;
          setStoredValue(newValue);
        } catch (error) {
          console.warn(`Error parsing storage event for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}
