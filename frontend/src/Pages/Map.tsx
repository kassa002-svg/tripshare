import {
  APIProvider,
  Map,
  type MapCameraChangedEvent,
} from "@vis.gl/react-google-maps";

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
          BUN_PUBLIC_GOOGLE_MAPS_API_KEY is missing. Add it to tripshare/.env,
          then restart `bun run build:watch`.
        </p>
      </main>
    );
  }

  return (
    <APIProvider
      apiKey={API_KEY}
      onLoad={() => console.log("Maps API has loaded.")}
    >
      {}
      <div style={{ width: "100vw", height: "100vh" }}>
        <Map
          defaultZoom={17}
          defaultCenter={{ lat: 33.9737, lng: -117.3281 }}
          onCameraChanged={(ev: MapCameraChangedEvent) =>
            console.log(
              "camera changed:",
              ev.detail.center,
              "zoom:",
              ev.detail.zoom,
            )
          }
        />
      </div>
    </APIProvider>
  );
}
