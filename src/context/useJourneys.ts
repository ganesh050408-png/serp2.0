import { useState, useEffect, useCallback } from 'react';
import { travelStorage, StoredJourney } from '../services/travelStorage';

export function useJourneys() {
  const [journeys, setJourneys] = useState<StoredJourney[]>(() => {
    return travelStorage.getJourneys();
  });

  const reload = useCallback(() => {
    setJourneys(travelStorage.getJourneys());
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      reload();
    };

    window.addEventListener('aethera:journeys_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('aethera:journeys_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [reload]);

  return {
    journeys,
    reload,
    activeJourney: journeys[0] || null,
    saveJourney: (journey: StoredJourney) => {
      travelStorage.saveJourney(journey);
    },
    deleteJourney: (id: string) => {
      travelStorage.deleteJourney(id);
    },
  };
}

