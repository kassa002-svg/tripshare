import { useState } from "react";
import { APIProvider, InfoWindow, Map, useMapsLibrary, type MapMouseEvent, } from "@vis.gl/react-google-maps";
import type { CreateItineraryBody, NewItineraryItem } from "backend/models/Itinerary";
import "./Map.css";

function readApiKey(): string | undefined {
  try {
    return process.env.BUN_PUBLIC_GOOGLE_MAPS_API_KEY;
  } catch {
    return undefined;
  }
}

const API_KEY = readApiKey();

export default function MapPage() {
  if (!API_KEY) {
    return (
      <main>
        <h1>Map</h1>
        <p>
          BUN_PUBLIC_GOOGLE_MAPS_API_KEY is missing. Add it to tripshare/.env, then restart.
        </p>
      </main>
    );
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <ItineraryBuilder/>
    </APIProvider>
  );
}

function ItineraryBuilder() {
  const placesLib = useMapsLibrary("places");
  const [selected, setSelected] = useState<NewItineraryItem | null>(null);
  const [stops, setStops] = useState<NewItineraryItem[]>([]);
  const [title, setTitle] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState("");

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
    setSidebarOpen(true);
    setError("");
  }

  function resetItinerary() {
    setStops([]);
    setTitle("");
    setError("");
    setSidebarOpen(false);
  }

  async function saveItinerary() {
    if (title.trim() === "") {
      setError("Please give your itinerary a title.");
      return;
    }

    const body: CreateItineraryBody = { title: title.trim(), description: "", items: stops };

    try {
      const res = await fetch("http://localhost:3001/api/itineraries", {
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
      </div>

      {sidebarOpen && (<ItinerarySidebar title={title} stops={stops} error={error}
          onTitleChange={(newTitle) => {
            setTitle(newTitle);
            setError("");
          }}
          onSave={saveItinerary}
          onClose={resetItinerary}
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