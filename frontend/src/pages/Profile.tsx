import ProfileNavbar from "../components/ProfileNavbar";
import { useSession } from "../Session";
import Friend from "../components/Friend";

export default function Profile() {
  const { user, error, signOut } = useSession();

  return (
    <div>
      <ProfileNavbar />
      <main className="profileDetails">
        <h1>My profile</h1>
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

            <h3>About me</h3>
            <p className="profileBio">{user.bio || "No bio yet."}</p>

            <div className="profileInfo">
              <p>Email: {user.email}</p>
              <p>Account role: {user.role}</p>
              <p>Following: {user.following.length}</p>
              <p>Saved itineraries: {user.savedItineraries.length}</p>
              <p>Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
              <p>Last updated: {new Date(user.updatedAt).toLocaleDateString()}</p>
            </div>

            <button className="profileSignOut" onClick={signOut}>
              Sign out
            </button>
          </section>
          <Friend />    
          </>      
        )}
      </main>
    </div>
  );
}
