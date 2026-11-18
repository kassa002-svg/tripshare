import { useState } from "react";
import { APIProvider, InfoWindow, Map, useMap, useMapsLibrary, type MapMouseEvent, } from "@vis.gl/react-google-maps";
import type { CreateItineraryBody, NewItineraryItem, Itinerary } from "backend/models/Itinerary";
import { API_BASE } from "@/apiBase";
import ProfileNavbar from "@/components/ProfileNavbar";
import "./Map.css";

function readApiKey(): string | undefined {
  try {
    return process.env.BUN_PUBLIC_GOOGLE_MAPS_API_KEY;
  } catch {
    return undefined;
  }
}

const API_KEY = readApiKey();
const MIN_SEARCH_ZOOM = 14;

export default function MapPage() {
  if (!API_KEY) {
    return (
      <main>
        <ProfileNavbar />
        <h1>Map</h1>
        <p>
          BUN_PUBLIC_GOOGLE_MAPS_API_KEY is missing. Add it to tripshare/.env, then restart.
        </p>
      </main>
    );
  }

  return (
    <div className = "map-screen">
      <ProfileNavbar />
      <APIProvider apiKey={API_KEY}>
        <ItineraryBuilder/>
      </APIProvider>
    </div>
  );
}

type Panel = "closed" | "builder" | "search";

function ItineraryBuilder() {
  const placesLib = useMapsLibrary("places");
  const [selected, setSelected] = useState<NewItineraryItem | null>(null);
  const [stops, setStops] = useState<NewItineraryItem[]>([]);
  const [title, setTitle] = useState("");
  const [panel, setPanel] = useState<Panel>("closed");
  const [error, setError] = useState("");
  const [results, setResults] = useState<Itinerary[]>([]);
  const [searchMessage, setSearchMessage] = useState("");
  const map = useMap();

  async function handleMapClick(event: MapMouseEvent) {
    const { placeId, latLng } = event.detail;
    if (!placeId || !latLng) {
      setSelected(null);
      return;
    }

    event.stop();
    if (!placesLib) return;

    const place = new placesLib.Place({ id: placeId });
    await place.fetchFields({
      fields: ["displayName", "formattedAddress", "location", "primaryType"],
    });

    setSelected({
      placeId,
      name: place.displayName ?? "Unnamed place",
      address: place.formattedAddress ?? "",
      category: place.primaryType ?? null,
      description: "",
      location: place.location?.toJSON() ?? latLng,
    });
  }

  function addStop() {
    if (!selected) return;
    setStops([...stops, selected]);
    setSelected(null);
    setPanel("builder");
    setError("");
  }

  function resetItinerary() {
    setStops([]);
    setTitle("");
    setError("");
    setPanel("closed");
  }

  async function openSearch() {
    resetItinerary();
    setPanel("search");
    setResults([]);

    const zoom = map?.getZoom();
    const bounds = map?.getBounds()?.toJSON();
    if (zoom < MIN_SEARCH_ZOOM) {
      setSearchMessage("Zoom in more to find itineraries in the area.");
      return;
    }

    const params = new URLSearchParams({
      north: String(bounds.north),
      south: String(bounds.south),
      east: String(bounds.east),
      west: String(bounds.west),
    });

    try{
      const res = await fetch(`${API_BASE}/api/itineraries/nearby?${params}`);
      const data = await res.json();

      if (!res.ok) {
        setSearchMessage(data.error ?? "Could not search this area.");
        return;
      }

      const found = data as Itinerary[];
      setResults(found);
      setSearchMessage(found.length === 0 ? "No itineraries in this area yet." : "");
    } catch {
      setSearchMessage("Could not reach the backend.");
    }
  }

  async function saveItinerary() {
    if (title.trim() === "") {
      setError("Please give your itinerary a title.");
      return;
    }

    const body: CreateItineraryBody = { title: title.trim(), description: "", items: stops };

    try {
      const res = await fetch(`${API_BASE}/api/itineraries`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.status === 401) {
        setError("You need to be logged in to save an itinerary.");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Could not save the itinerary.");
        return;
      }

      resetItinerary();
    } catch {
      setError("Could not reach the backend.");
    }
  }

  return (
    <div className="map-page">
      <div className="map-area">
        <Map
          defaultZoom={17}
          defaultCenter={{lat: 33.9737, lng: -117.3281}}
          onClick={handleMapClick}
          style={{ width: "100%", height: "100%" }}
        >
          {selected && (<PlacePopup place={selected} onAdd={addStop} onClose={() => setSelected(null)} />)}
        </Map>

        <button className="btn-primary search-btn" onClick={openSearch}>
          Search Nearby
        </button>
      </div>

      {panel === "builder" && (<ItinerarySidebar title={title} stops={stops} error={error}
          onTitleChange={(newTitle) => {
            setTitle(newTitle);
            setError("");
          }}
          onSave={saveItinerary}
          onClose={resetItinerary}
        />
      )}

      {panel === "search" && (<SearchSidebar results={results} message={searchMessage}
          onClose={() => setPanel("closed")}
        />
      )}
    </div>
  );
}

type PlacePopupProps = {
  place: NewItineraryItem;
  onAdd: () => void;
  onClose: () => void;
};

function PlacePopup({ place, onAdd, onClose }: PlacePopupProps) {
  return (
    <InfoWindow position={place.location} onCloseClick={onClose}>
      <div className="place-popup">
        <p className="place-popup-name">{place.name}</p>
        <p className="place-popup-address">{place.address}</p>
        <button className="btn-primary" onClick={onAdd}>
          Add to itinerary
        </button>
      </div>
    </InfoWindow>
  );
}

type ItinerarySidebarProps = {
  title: string;
  stops: NewItineraryItem[];
  error: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onClose: () => void;
};

function ItinerarySidebar({ title, stops, error, onTitleChange, onSave, onClose }: ItinerarySidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-heading">New itinerary</h2>
        <button className="btn-close" onClick={onClose}>
          Close
        </button>
      </div>

      <input
        className="sidebar-title-input"
        placeholder="Title"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
      />

      <ol className="sidebar-stops">
        {stops.map((stop, index) => (
          <li key={index}>{stop.name}</li>
        ))}
      </ol>

      <button className="btn-primary btn-full" onClick={onSave}>
        Save itinerary
      </button>

      {error && <p className="sidebar-error">{error}</p>}
    </aside>
  );
}

type SearchSidebarProps = {
  results: Itinerary[];
  message: string;
  onClose: () => void;
};

function SearchSidebar({ results, message, onClose }: SearchSidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-heading">Itineraries in this area</h2>
        <button className="btn-close" onClick={onClose}>
          Close
        </button>
      </div>

      {message && <p className="sidebar-message">{message}</p>}

      <div className="search-list">
        {results.map((itinerary) => (
          <SearchCard key={itinerary.id} itinerary={itinerary} />
        ))}
      </div>
    </aside>
  );
}

type SearchCardProps = {
  itinerary: Itinerary;
};

function SearchCard({ itinerary }: SearchCardProps) {
  return (
    <div className="search-card">
      <p className="search-card-title">{itinerary.title}</p>
      <ol className="sidebar-stops">
        {itinerary.items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ol>
    </div>
  );
}
