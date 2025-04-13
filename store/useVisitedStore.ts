import type { Visit } from "@/types/visited";
import { countries } from "@/utils/regions";
import { ExtensionStorage } from "@bacons/apple-targets";
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

export const widgetStorage = new ExtensionStorage(
  "group.me.lorenzo0111.wayfar",
);

const updateWidgetData = (state: VisitedState) => {
  widgetStorage.set("visitedCountries", state.visitedCountries.length);
  widgetStorage.set("visitedRegions", state.visitedRegions.length);

  const countriesCompletedPercentage = Math.round(
    (state.visitedCountries.length / countries.length) * 100,
  );

  widgetStorage.set("countriesCompleted", countriesCompletedPercentage);
  widgetStorage.set("worldCompleted", countriesCompletedPercentage);

  ExtensionStorage.reloadWidget();
};

export const useVisitedStore = create<VisitedState>()(
  persist(
    (set, get) => ({
      visitedCountries: [],
      visitedRegions: [],
      visits: [],
      addCountry: (countryCode) =>
        set((state) => {
          const newState = {
            visitedCountries: [
              ...new Set([...state.visitedCountries, countryCode]),
            ],
          };

          setTimeout(() => updateWidgetData({ ...state, ...newState }), 0);

          return newState;
        }),
      removeCountry: (countryCode) =>
        set((state) => {
          const newState = {
            visitedCountries: state.visitedCountries.filter(
              (code) => code !== countryCode,
            ),
            visits: state.visits.filter(
              (visit) => visit.countryCode !== countryCode,
            ),
          };

          setTimeout(() => updateWidgetData({ ...state, ...newState }), 0);

          return newState;
        }),
      addVisit: (visit) =>
        set((state) => {
          const visitWithId = {
            ...visit,
            id: visit.id || `${visit.regionCode}-${Date.now()}`,
          };

          const newVisits = [...state.visits, visitWithId];

          const newState = {
            visits: newVisits,
            visitedRegions: [
              ...new Set([...state.visitedRegions, visit.regionCode]),
            ],
            visitedCountries: [
              ...new Set([...state.visitedCountries, visit.countryCode]),
            ],
          };

          setTimeout(() => updateWidgetData({ ...state, ...newState }), 0);

          return newState;
        }),
      updateVisit: (id, updates) =>
        set((state) => {
          const visitIndex = state.visits.findIndex((visit) => visit.id === id);
          if (visitIndex === -1) return state;

          const newVisits = [...state.visits];
          newVisits[visitIndex] = { ...newVisits[visitIndex], ...updates };

          const newState = { visits: newVisits };

          setTimeout(() => updateWidgetData({ ...state, ...newState }), 0);

          return newState;
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

          const newState = {
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

          setTimeout(() => updateWidgetData({ ...state, ...newState }), 0);

          return newState;
        }),
      getVisits: (regionCode) => {
        return get().visits.filter((visit) => visit.regionCode === regionCode);
      },
      getVisit: (id) => {
        return get().visits.find((visit) => visit.id === id);
      },
      clearAll: () => {
        const newState = {
          visitedCountries: [],
          visitedRegions: [],
          visits: [],
        };

        setTimeout(() => updateWidgetData({ ...get(), ...newState }), 0);

        return set(newState);
      },
    }),
    {
      name: "visited-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          updateWidgetData(state);
        }
      },
    },
  ),
);
