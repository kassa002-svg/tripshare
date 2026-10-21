import { useState } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import ProfileNavBar from "./ProfilePage";


const googleClientId = "193727342680-2rm8o1lojootujg6cvccdfbb3mvnv3le.apps.googleusercontent.com";

export function App() {
  const [oauthResult, setOauthResult] = useState("Not tested yet.");

  const testGoogleOAuth = async (response: any) => {
    try {
      const result = await fetch("http://localhost:3001/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await result.json();
      setOauthResult(data.message || data.error);

    } catch {
      setOauthResult("Could not connect to backend.");
    }
  };

  return (
    <div>
      <ProfileNavBar />

      <section className="oauth-test">
        <h2>Test Google OAuth</h2>

        <GoogleOAuthProvider clientId={googleClientId || ""}>
          <GoogleLogin
            onSuccess={testGoogleOAuth}
            onError={() => setOauthResult("Google login failed.")}
          />
        </GoogleOAuthProvider>

        <p>{oauthResult}</p>
      </section>

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

export default App;
