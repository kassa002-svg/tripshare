import { useEffect, useState } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import ProfileNavbar from "../components/ProfileNavbar";
import { API_BASE } from "../apiBase";
import { useSession } from "../Session";

const googleClientId =
  "193727342680-2rm8o1lojootujg6cvccdfbb3mvnv3le.apps.googleusercontent.com";

export default function Login() {
  const { user } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) window.location.href = "/profile";
  }, [user]);

  async function login(event: React.FormEvent) {
    event.preventDefault();

    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      window.location.href = "/profile";
    } else {
      setMessage(data.error);
    }
  }

  async function googleLogin(response: any) {
    const result = await fetch(`${API_BASE}/api/auth/google`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: response.credential }),
    });

    const data = await result.json();

    if (result.ok) {
      window.location.href = "/profile";
    } else {
      setMessage(data.error);
    }
  }

  return (
    <div>
      <ProfileNavbar />
      <main className="loginPage">
        <form onSubmit={login} className="loginForm">
          <h1>Log in to TripShare</h1>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button type="submit" className="loginButton">Log in</button>
          <a href="/signup">Create account</a>
          {message && <p>{message}</p>}
        </form>
        <div className="googleLoginButton">
          <GoogleOAuthProvider clientId={googleClientId}>
            <GoogleLogin
              onSuccess={googleLogin}
              onError={() => setMessage("Google login failed.")}
            />
          </GoogleOAuthProvider>
        </div>
      </main>
    </div>
  );
}
