import { APITester } from "./APITester";
import "./index.css";
import ProfileNavBar from "./ProfilePage";
import LoginUI from "./Login"

export function App() {
  return (
    <div>
        {/*
          <LoginUI /> Login UI for later
        */}

        <ProfileNavBar />
        <div className ="profileScreen">
          <div className="center">
              <div className="samplePlus">
                 + 
              </div>
              <div className="samplePost">
              </div>
          </div>
          <div className ="bigProfilePicture">
          </div>
        </div>
        {/*
          <div className="app">
        <h1>Profile</h1>
        <p>
          Edit <code>src/App.tsx</code>
        </p>
        <APITester />
      </div>
        */}
    </div>
  );
}

export default App;
