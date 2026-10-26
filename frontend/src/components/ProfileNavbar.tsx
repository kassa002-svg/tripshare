export default function ProfileNavbar() {
  const loggedIn = true;

  if (!loggedIn) {
    return (
      <div className="profileNavBar">
        <h2 className="text-xl font-semibold">TripShare</h2>
        <a href="/auth/signup" className="hover:underline">
          Sign up
        </a>
      </div>
    );
  }

  return (
    <div className="profileNavBar">
      <h2 className="text-xl font-semibold">TripShare</h2>
      <div className="flex flex-row items-center gap-4">
        <a href="/" className="hover:underline">
          Home
        </a>
        <a href="/" className="hover:underline">
          Friends
        </a>
        <div className="profileCircle"></div>
      </div>
    </div>
  );
}
