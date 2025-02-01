import { LngLatBounds, Map } from "maplibre-gl";
import {
  Coordinates,
  Geolevel,
  searchByPlaceName,
  SearchResult,
} from "us-places-geocoder";
import { geolevelToZoomLevel, querySelectorThrows } from "./helpers";
import { parseCoordinates, parseGeolevel } from "./parse";

const searchElem = querySelectorThrows("#search");
const searchTermsElem = querySelectorThrows<HTMLInputElement>("#search-terms");
const searchResultsElem =
  querySelectorThrows<HTMLInputElement>("#search-results");

// esbuild fills this in at build time using the env var of the same name
// @ts-expect-error
let style = BASEMAP_STYLE;

if (!style) {
  throw new Error("BASEMAP_STYLE not set");
}

const map = new Map({
  container: "map",
  style,
  bounds: new LngLatBounds(
    {
      lng: -166.1494140625007,
      lat: 14.14626137409661,
    },
    {
      lng: -39.85058593750213,
      lat: 63.96105841348822,
    }
  ),
  minZoom: 2,
  maxZoom: 12,
});

export function buildSearchResultItems(searchResults: SearchResult[]): string {
  return searchResults
    .map(
      ({ name, coordinates, geolevel }) =>
        `
      <li class="search-result-items" data-name="${name}" data-coordinates="${JSON.stringify(
          coordinates
        )}" data-geolevel="${geolevel}">
        ${name}
      </li>
    `
    )
    .join("");
}

function searchAndUpdateResults(
  searchTerms: string,
  hideResults: boolean = false
) {
  const searchResults = searchTerms ? searchByPlaceName(searchTerms) : [];
  const searchResultItems = buildSearchResultItems(searchResults);
  searchResultsElem.style.display =
    searchResults.length && !hideResults ? "block" : "none";
  searchResultsElem.innerHTML = searchResultItems;
}

searchTermsElem.addEventListener("input", (event: Event) => {
  const searchTerms = (event.target as HTMLInputElement).value;
  searchAndUpdateResults(searchTerms);
});

function extractSearchResultItemData(elem: HTMLElement):
  | {
      name: string;
      coordinates: Coordinates;
      geolevel: Geolevel;
    }
  | undefined {
  const name = "name" in elem.dataset ? elem.dataset.name : undefined;
  const coordinates =
    "coordinates" in elem.dataset && elem.dataset.coordinates
      ? parseCoordinates(elem.dataset.coordinates)
      : undefined;
  const geolevel =
    "geolevel" in elem.dataset && elem.dataset.geolevel
      ? parseGeolevel(elem.dataset.geolevel)
      : undefined;
  if (name && coordinates && geolevel) {
    return { name, coordinates, geolevel };
  }
  return undefined;
}

function selectSearchResult(result: {
  name: string;
  coordinates: Coordinates;
  geolevel: Geolevel;
}) {
  searchResultsElem.style.display = "none";
  searchTermsElem.value = result.name;
  map.flyTo({
    center: { lat: result.coordinates[0], lng: result.coordinates[1] },
    zoom: geolevelToZoomLevel(result.geolevel),
  });
  searchAndUpdateResults(result.name, true);
}

searchTermsElem.addEventListener("focus", () => {
  searchResultsElem.style.display = "block";
});
searchTermsElem.addEventListener("blur", (e: FocusEvent) => {
  if (e.target instanceof HTMLElement && e.target.id !== "search-terms") {
    searchResultsElem.style.display = "none";
  }
});
searchResultsElem.addEventListener("click", (e: MouseEvent) => {
  if (e.target instanceof HTMLElement) {
    const result = extractSearchResultItemData(e.target);
    if (result) {
      selectSearchResult(result);
    }
  }
});
searchResultsElem.addEventListener("mouseover", ({ target }: MouseEvent) => {
  if (target instanceof Element) {
    target.classList.add("highlighted");
  }
});
searchResultsElem.addEventListener("mouseout", ({ target }: MouseEvent) => {
  if (target instanceof Element) {
    target.classList.remove("highlighted");
  }
});
searchElem.addEventListener("keydown", (e: KeyboardEvent) => {
  const isDown = e.code === "ArrowDown";
  const isUp = e.code === "ArrowUp";
  const isEnter = e.code === "Enter";
  const searchResultItems = document.querySelectorAll(".search-result-items");
  if (isDown || isUp) {
    if (
      Array.from(searchResultItems).some((elem) =>
        elem.classList.contains("highlighted")
      )
    ) {
      // At least one search result is already highlighted
      for (let i = 0; i < searchResultItems.length; i++) {
        const elem = searchResultItems[i];
        if (elem.classList.contains("highlighted")) {
          if (isDown && i < searchResultItems.length - 1) {
            const nextElem = searchResultItems[i + 1];
            elem.classList.remove("highlighted");
            nextElem.classList.add("highlighted");
            break;
          } else if (isUp && i > 0) {
            const prevElem = searchResultItems[i - 1];
            elem.classList.remove("highlighted");
            prevElem.classList.add("highlighted");
            break;
          }
        }
      }
    } else {
      const elemToHighlight = isDown
        ? searchResultItems[0]
        : searchResultItems[searchResultItems.length - 1];
      elemToHighlight.classList.add("highlighted");
    }
  } else if (isEnter) {
    const highlightedItem = Array.from(searchResultItems).find((elem) =>
      elem.classList.contains("highlighted")
    );
    if (highlightedItem && highlightedItem instanceof HTMLElement) {
      const result = extractSearchResultItemData(highlightedItem);
      if (result) {
        selectSearchResult(result);
      }
    }
  }
});
