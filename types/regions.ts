export interface Region {
  code: string;
  name: string;
  countryCode: string;
  countryName: string;
}

export interface Country {
  code2: string;
  name: string;
  states: Region[];
}

export type CountryGroup = Country & {
  isExpanded: boolean;
};

export type ListItem = CountryGroup | Region;
