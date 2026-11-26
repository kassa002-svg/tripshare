import "./index.css";
import FeedPage from "./pages/Feed";
import MapPage from "./pages/Map";
import NotFound from "./pages/NotFound";
import NewPost from "./pages/NewPost";
import ItineraryPage from "./pages/Itinerary";
import { SessionProvider, useSession } from "./Session";
import Profile from "./pages/Profile";
import LoginUI from "./pages/Login";
import Signup from "./pages/Signup";

function AppContent() {
  const path = window.location.pathname;
  const { user, loading } = useSession();

  if (loading) return null;

  if (!user && path !== "/login" && path !== "/signup") return <LoginUI />;

  if (path === "/")
    return <LoginUI />;
  if (path === "/map")
    return <MapPage />;
  if (path === "/feed")
    return <FeedPage />;
  if (path === "/profile")
    return <Profile />;
  if (path.startsWith("/profile/"))
    return <Profile profileId={path.split("/")[2] || ""} />;
  if (path === "/login") return <LoginUI />;
  if (path === "/signup") return <Signup />;
  if (path.startsWith("/itineraries/")) return <ItineraryPage id={path.split("/")?.[2] || ""} />;

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
