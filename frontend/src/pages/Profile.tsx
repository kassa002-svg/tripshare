import { useEffect, useState } from "react";
import ProfileNavbar from "../components/ProfileNavbar";
import { useSession } from "../Session";
import { API_BASE } from "../apiBase";
import ItineraryCard from "../components/IteneraryCard";
import type { Itinerary } from "backend/models/Itinerary";
import "./Profile.css";


function readPhoto(photo: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(photo);
  });
}

function EditableProfile() {
  const { user, error, signOut } = useSession();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setBio(user.bio);
      setPassword("");
    }
  }, [user]);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();

      setMessage("");

  if (photo && photo.size > 4 * 1024 * 1024) {
    setMessage("Choose a photo up to 4 MB.");
    return;
  }

    const photoData = photo ? await readPhoto(photo) : undefined;

    const response = await fetch(`${API_BASE}/api/users/me`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, bio, password, photo: photoData }),
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

              <label htmlFor="photo">Profile photo</label>
              <input
                id="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
              />
              <p>JPG, PNG, or WebP up to 4 MB.</p>

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
              <button onClick={signOut} className="signOut">Sign out</button>
            </div>

          </section>
          </>      
        )}
      </main>
    </div>
  );
}

type PublicProfile = {
  id: string;
  displayName: string;
  avatar: string | null;
  bio: string;
};

function TravelerProfile({ profileId }: { profileId: string }) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadTravelerProfile() {
      try {
        const [profileResponse, itinerariesResponse] = await Promise.all([
          fetch(`${API_BASE}/api/users/${encodeURIComponent(profileId)}`, {
            credentials: "include",
            signal: controller.signal,
          }),
          fetch(`${API_BASE}/api/itineraries?authorId=${encodeURIComponent(profileId)}`, {
            credentials: "include",
            signal: controller.signal,
          }),
        ]);

        if (!profileResponse.ok || !itinerariesResponse.ok) {
          throw new Error("Could not load profile");
        }

        const profileData: unknown = await profileResponse.json();
        const itinerariesData: unknown = await itinerariesResponse.json();
        if (!Array.isArray(itinerariesData)) {
          throw new Error("Could not load itineraries");
        }

        setProfile(profileData as PublicProfile);
        setItineraries(itinerariesData as Itinerary[]);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError(requestError instanceof Error ? requestError.message : "Could not load profile");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadTravelerProfile();
    return () => controller.abort();
  }, [profileId]);

  if (loading) {
    return <><ProfileNavbar /><main className="profilePage"><p>Loading </p></main></>;
  }

  if (error || !profile) {
    return <><ProfileNavbar /><main className="profilePage"><p role="alert">{error || "Profile not found"}</p></main></>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileNavbar />
      <main className="profilePage">
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "black" }}>{profile.displayName}&apos;s profile</h1>
        <section className="profileCard">
          <div className="profileHeader">
            {profile.avatar && <img className="profileAvatar" src={profile.avatar} alt={profile.displayName} referrerPolicy="no-referrer" />}
            <div>
              <h2>{profile.displayName}</h2>
              <p className="profileStatus">Traveler</p>
            </div>
          </div>
          <h3>About me</h3>
          <p className="profileBio">{profile.bio || "No bio yet."}</p>
        </section>

        <section className="profilePublishedTrips">
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "black" }}>Published itineraries</h2>
          {itineraries.length === 0 ? (
            <p>No published itineraries yet.</p>
          ) : (
            <div className="profileItineraryList">
              {itineraries.map((itinerary) => <ItineraryCard key={itinerary.id} itinerary={itinerary} />)}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default function Profile({ profileId }: { profileId?: string }) {
  return profileId ? <TravelerProfile profileId={profileId} /> : <EditableProfile />;
}
