import "./index.css";
import FeedPage from "./pages/Feed";
import MapPage from "./pages/Map";
import NotFound from "./pages/NotFound";
import NewPost from "./pages/NewPost";
import ItineraryPage from "./pages/Itinerary";
import { SessionProvider, useSession } from "./Session";
import Profile from "./pages/Profile";
import LoginUI from "./pages/Login";

function AppContent() {
  const path = window.location.pathname;
  const { user, loading } = useSession();

  if (loading) return null;

  if (!user && path !== "/login") return <LoginUI />;

  if (path === "/")
    return <LoginUI />;
  if (path === "/map")
    return <MapPage />;
  if (path === "/feed")
    return <FeedPage />;
  if (path === "/profile")
    return <Profile />;
  if (path === "/login") return <LoginUI />;

  return <NotFound />;
}

export function App() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}

export default App;
