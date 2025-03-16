import type { Visit } from "@/types/visited";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface VisitedState {
  visitedCountries: string[];
  visits: Visit[];
  visitedRegions: string[];
  addCountry: (countryCode: string) => void;
  removeCountry: (countryCode: string) => void;
  addVisit: (visit: Visit) => void;
  updateVisit: (id: string, updates: Partial<Omit<Visit, "id">>) => void;
  removeVisit: (id: string) => void;
  getVisits: (regionCode: string) => Visit[];
  getVisit: (id: string) => Visit | undefined;
  clearAll: () => void;
}

export const useVisitedStore = create<VisitedState>()(
  persist(
    (set, get) => ({
      visitedCountries: [],
      visitedRegions: [],
      visits: [],
      addCountry: (countryCode) =>
        set((state) => ({
          visitedCountries: [
            ...new Set([...state.visitedCountries, countryCode]),
          ],
        })),
      removeCountry: (countryCode) =>
        set((state) => ({
          visitedCountries: state.visitedCountries.filter(
            (code) => code !== countryCode,
          ),
          visits: state.visits.filter(
            (visit) => visit.countryCode !== countryCode,
          ),
        })),
      addVisit: (visit) =>
        set((state) => {
          const visitWithId = {
            ...visit,
            id: visit.id || `${visit.regionCode}-${Date.now()}`,
          };

          const newVisits = [...state.visits, visitWithId];

          return {
            visits: newVisits,
            visitedRegions: [
              ...new Set([...state.visitedRegions, visit.regionCode]),
            ],
            visitedCountries: [
              ...new Set([...state.visitedCountries, visit.countryCode]),
            ],
          };
        }),
      updateVisit: (id, updates) =>
        set((state) => {
          const visitIndex = state.visits.findIndex((visit) => visit.id === id);
          if (visitIndex === -1) return state;

          const newVisits = [...state.visits];
          newVisits[visitIndex] = { ...newVisits[visitIndex], ...updates };

          return { visits: newVisits };
        }),
      removeVisit: (id) =>
        set((state) => {
          const visit = state.visits.find((v) => v.id === id);
          if (!visit) return state;

          const newVisits = state.visits.filter((v) => v.id !== id);

          const hasOtherVisitsForRegion = newVisits.some(
            (v) => v.regionCode === visit.regionCode,
          );

          const hasOtherVisitsForCountry = newVisits.some(
            (v) => v.countryCode === visit.countryCode,
          );

          return {
            visits: newVisits,
            visitedRegions: hasOtherVisitsForRegion
              ? state.visitedRegions
              : state.visitedRegions.filter(
                  (code) => code !== visit.regionCode,
                ),
            visitedCountries: hasOtherVisitsForCountry
              ? state.visitedCountries
              : state.visitedCountries.filter(
                  (code) => code !== visit.countryCode,
                ),
          };
        }),
      getVisits: (regionCode) => {
        return get().visits.filter((visit) => visit.regionCode === regionCode);
      },
      getVisit: (id) => {
        return get().visits.find((visit) => visit.id === id);
      },
      clearAll: () =>
        set({
          visitedCountries: [],
          visitedRegions: [],
          visits: [],
        }),
    }),
    {
      name: "visited-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
