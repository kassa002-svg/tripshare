import "./index.css";
import ProfileNavBar from "./ProfilePage";
import FeedPage from "./pages/Feed";
import MapPage from "./pages/Map";
import NotFound from "./pages/NotFound";
import OAuthTest from "./pages/OAuthTest";

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