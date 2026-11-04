import "./index.css";
import ProfileNavBar from "./components/ProfileNavbar";
import FeedPage from "./pages/Feed";
import MapPage from "./pages/Map";
import NotFound from "./pages/NotFound";
import OAuthTest from "./pages/OAuthTest";
import NewPost from "./pages/NewPost";
import ItineraryPage from "./pages/Itinerary";

export function App() {
  const path = window.location.pathname;

  if (path === "/map") return <MapPage />;
  if (path === "/feed") return <FeedPage />;
  if (path === "/itineraries/new") return <NewPost />;
  if (path.startsWith("/itineraries/")) {
    const sp = path.split("/");
    return <ItineraryPage id={sp?.[sp.length - 1] ?? ""} />;
  }
  if (path === "/") return <OAuthTest />;

  if (path === "/profile") {
    return (
      <div>
        <ProfileNavBar />

        <div className="profileScreen">
          <div className="center">
            <div className="samplePlus">+</div>
            <div className="samplePost"></div>
          </div>
          <div className="bigProfilePicture"></div>
        </div>
      </div>
    );
  }

  return <NotFound />;
}

export default App;
