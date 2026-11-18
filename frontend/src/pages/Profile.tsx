import { useEffect, useState } from "react";
import ProfileNavbar from "../components/ProfileNavbar";
import { useSession } from "../Session";
import { API_BASE } from "../apiBase";
import "./Profile.css";


export default function Profile() {
  const { user, error, signOut } = useSession();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setBio(user.bio);
      setPassword("");
    }
  }, [user]);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();

    const response = await fetch(`${API_BASE}/api/users/me`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, bio, password }),
    });

    const data = await response.json();

    if (response.ok) {
      window.location.reload();
    } else {
      setMessage(data.error);
    }
  }

  function cancelEdit() {
    setDisplayName(user?.displayName || "");
    setBio(user?.bio || "");
    setMessage("");
    setEditing(false);
  }

  return (
      <div className="min-h-screen bg-gray-50">
      <ProfileNavbar />
      <main className="profilePage">
        <h1>My profile</h1>
        <p className="profileSubtitle">A little about you and your trips!</p>

        {error && <p role="alert">{error}</p>}

        {!user && !error && (
          <div>
            <p>You are not logged in.</p>
            <a href="/">Sign in</a>
          </div>
        )}

        {user && (
        <>
          <section className="profileCard">
            <div className="profileHeader">
              {user.avatar && (
                <img className="profileAvatar" src={user.avatar} alt="Your profile" referrerPolicy="no-referrer" />
              )}
              <div>
                <h2>{user.displayName}</h2>
                <p className="profileStatus">Logged in</p>
              </div>
            </div>

            {editing ? (
              <form onSubmit={saveProfile} className="profileEditForm">
                <label htmlFor="displayName">Name</label>
                <input
                  id="displayName"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  required
                />

                <label htmlFor="bio">About me</label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                />

                <label htmlFor="password">New password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />

                <p className="profilePasswordNote">Leave empty to keep your current password</p>

                <div className="profileActions">
                  <button type="submit">Save</button>
                  <button type="button" onClick={cancelEdit}>Cancel</button>
                </div>
                {message && <p role="alert">{message}</p>}
              </form>
            ) : (
              <>
                <h3>About me</h3>
                <p className="profileBio">{user.bio || "No bio yet."}</p>              
              </>
            )}

            <div className="profileInfo">
              <p>Account role: {user.role}</p>
              <p>Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
              <p>Last updated: {new Date(user.updatedAt).toLocaleDateString()}</p>
            </div>

            <div className="profileActions">
              <a href="/feed">Explore Itineraries</a>
              <a onClick={() => setEditing(true)}>Edit Profile</a>
              <button onClick={signOut}>Sign out</button>
            </div>

          </section>
          </>      
        )}
      </main>
    </div>
  );
}
