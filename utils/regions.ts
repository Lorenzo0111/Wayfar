import countriesData from "@/assets/countries.json";
import { Country, Region } from "@/types/regions";

export const countries: Country[] = countriesData.map((c) => ({
  ...c,
  states: c.states.map((s) => ({
    ...s,
    code: `${c.code2}-${s.code}`,
    countryCode: c.code2,
    countryName: c.name,
  })),
}));

export const regions: Region[] = countries.flatMap((c) => c.states);
