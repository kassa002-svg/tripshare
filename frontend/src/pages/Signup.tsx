import { useEffect, useState } from "react";
import ProfileNavbar from "../components/ProfileNavbar";
import { API_BASE } from "../apiBase";
import { useSession } from "../Session";

export default function Signup() {
  const { user } = useSession();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) window.location.href = "/profile";
  }, [user]);

  async function signup(event: React.FormEvent) {
    event.preventDefault();

    const response = await fetch(`${API_BASE}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "user",
        googleId: null,
        displayName,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      window.location.href = "/login";
    } else {
      setMessage(data.error);
    }
  }

  return (
    <div>
      <ProfileNavbar />
      <main className="loginPage">
        <form onSubmit={signup} className="loginForm">
          <h1>Create your TripShare account</h1>

          <label htmlFor="displayName">Name</label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            required
          />

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

          <button type="submit" className="loginButton">Sign up</button>
          <a href="/login">Already have an account?</a>
          {message && <p>{message}</p>}
        </form>
      </main>
    </div>
  );
}
