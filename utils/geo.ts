export interface ReverseGeocode {
  countryCode: string;
  countryName: string;
  principalSubdivision: string;
  principalSubdivisionCode: string;
  locality: string;
  continent: string;
}

export async function reverseGeocode(
  lat: number,
  long: number,
): Promise<ReverseGeocode> {
  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${long}&localityLanguage=en`,
  );

  if (!response.ok) throw new Error("Failed to reverse geocode");

  const data = await response.json();
  return data;
}
