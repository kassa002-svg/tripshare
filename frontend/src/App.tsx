import "./index.css";
import ProfileNavBar from "./components/ProfileNavbar";
import Friend from "./components/Friend"
import FeedPage from "./Pages/Feed";
import MapPage from "./Pages/Map";
import NotFound from "./Pages/NotFound";
import OAuthTest from "./Pages/OAuthTest";
import Dropdown from "./components/DropdownLogin";
import { SessionProvider } from "./Session";
import Profile from "./Pages/Profile";
import LoginUI from "./Pages/Login";


export function App() {
  const path = window.location.pathname;

  if (path === "/map") return <SessionProvider><MapPage /></SessionProvider>;
  if (path === "/feed") return <SessionProvider><FeedPage /></SessionProvider>;
  if (path === "/") return <SessionProvider><OAuthTest /></SessionProvider>;

  if (path === "/profile") return <SessionProvider><Profile /></SessionProvider>;
  if (path === "/login") return <SessionProvider><LoginUI /></SessionProvider>;

  /* return ( Friend UI
    <div>
      <ProfileNavBar />
      <Friend />
    </div>
  ); */

  return <SessionProvider><NotFound /></SessionProvider>;

}

export default App;
