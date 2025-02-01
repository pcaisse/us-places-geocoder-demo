import { Coordinates, Geolevel } from "us-places-geocoder";

export function parseCoordinates(s: string): Coordinates | undefined {
  const maybeCoordinates = JSON.parse(s);
  if (
    maybeCoordinates &&
    maybeCoordinates.length === 2 &&
    typeof maybeCoordinates[0] === "number" &&
    typeof maybeCoordinates[1] === "number"
  ) {
    return [maybeCoordinates[0], maybeCoordinates[1]];
  }
  return undefined;
}

export function parseGeolevel(s: string): Geolevel | undefined {
  if (s && (s === "city" || s === "county" || s === "state")) {
    return s;
  }
  return undefined;
}
