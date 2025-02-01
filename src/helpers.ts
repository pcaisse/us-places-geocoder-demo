import { Geolevel } from "us-places-geocoder";

export function querySelectorThrows<T extends HTMLElement>(
  selector: string
): T {
  const elem: T | null = document.querySelector(selector);
  if (!elem) {
    throw new Error(`Element not found for selector: ${selector}`);
  }
  return elem;
}

export function geolevelToZoomLevel(geolevel: Geolevel) {
  return geolevel === "city" ? 9 : geolevel === "county" ? 8 : 7;
}
