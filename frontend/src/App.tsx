import "./index.css";
import ProfileNavBar from "./components/ProfileNavbar";
import FeedPage from "./Pages/Feed";
import MapPage from "./Pages/Map";
import NotFound from "./Pages/NotFound";
import OAuthTest from "./Pages/OAuthTest";

export function App() {
  const path = window.location.pathname;

  if (path === "/map") return <MapPage />;
  if (path === "/feed") return <FeedPage />;
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
