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
  updateVisit: (
    regionCode: string,
    updates: Partial<Omit<Visit, "regionCode">>,
  ) => void;
  removeVisit: (regionCode: string) => void;
  getVisit: (regionCode: string) => Visit | undefined;
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
          const existingVisitIndex = state.visits.findIndex(
            (v) => v.regionCode === visit.regionCode,
          );

          let newVisits;
          if (existingVisitIndex >= 0) {
            newVisits = [...state.visits];
            newVisits[existingVisitIndex] = visit;
          } else {
            newVisits = [...state.visits, visit];
          }

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
      updateVisit: (regionCode, updates) =>
        set((state) => {
          const visitIndex = state.visits.findIndex(
            (visit) => visit.regionCode === regionCode,
          );
          if (visitIndex === -1) return state;

          const newVisits = [...state.visits];
          newVisits[visitIndex] = { ...newVisits[visitIndex], ...updates };

          return { visits: newVisits };
        }),
      removeVisit: (regionCode) =>
        set((state) => {
          const visit = state.visits.find((v) => v.regionCode === regionCode);
          if (!visit) return state;

          const newVisits = state.visits.filter(
            (v) => v.regionCode !== regionCode,
          );

          const hasOtherVisitsForCountry = newVisits.some(
            (v) => v.countryCode === visit.countryCode,
          );

          return {
            visits: newVisits,
            visitedRegions: state.visitedRegions.filter(
              (code) => code !== regionCode,
            ),
            visitedCountries: hasOtherVisitsForCountry
              ? state.visitedCountries
              : state.visitedCountries.filter(
                  (code) => code !== visit.countryCode,
                ),
          };
        }),
      getVisit: (regionCode) => {
        return get().visits.find((visit) => visit.regionCode === regionCode);
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
