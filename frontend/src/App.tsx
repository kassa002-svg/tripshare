import "./index.css";

import MapPage from "./pages/Map";
import NotFound from "./pages/NotFound";
import OAuthTest from "./pages/OAuthTest";

export function App() {
  const path = window.location.pathname;

  if (path === "/map") return <MapPage />;
  if (path === "/") return <OAuthTest />;

  return <NotFound />;
}

export default App;
