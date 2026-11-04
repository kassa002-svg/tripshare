import "./index.css";
import ProfileNavBar from "./components/ProfileNavbar";
import FeedPage from "./pages/Feed";
import MapPage from "./pages/Map";
import NotFound from "./pages/NotFound";
import OAuthTest from "./pages/OAuthTest";
import NewPost from "./pages/NewPost";
import ItineraryPage from "./pages/Itinerary";
import { SessionProvider } from "./Session";
import Profile from "./pages/Profile";
import LoginUI from "./pages/Login";

export function App() {
  const path = window.location.pathname;

  if (path === "/")
    return (
      <SessionProvider>
        <OAuthTest />
      </SessionProvider>
    );
  if (path === "/map")
    return (
      <SessionProvider>
        <MapPage />
      </SessionProvider>
    );
  if (path === "/feed")
    return (
      <SessionProvider>
        <FeedPage />
      </SessionProvider>
    );
  if (path === "/itineraries/new") return <NewPost />;
  if (path.startsWith("/itineraries/")) {
    const sp = path.split("/");
    return <ItineraryPage id={sp?.[sp.length - 1] ?? ""} />;
  }

  if (path === "/profile")
    return (
      <SessionProvider>
        <Profile />
      </SessionProvider>
    );
  if (path === "/login")
    return (
      <SessionProvider>
        <LoginUI />
      </SessionProvider>
    );

  /* return ( Friend UI
    <div>
      <ProfileNavBar />
      <Friend />
    </div>
  ); */

  return (
    <SessionProvider>
      <NotFound />
    </SessionProvider>
  );
}

export default App;
