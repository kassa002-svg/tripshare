import Dropdown from "./DropdownLogin.tsx";
import {useSession} from "../Session.tsx";

export default function ProfileNavbar() {
  const { user } = useSession();

  if (!user) {
    return (
      <div className="profileNavBar">
        <h2 className="text-xl font-semibold">TripShare</h2>
        <a href="/signup" className="hover:underline">
          Sign up
        </a>
      </div>
    );
  }

  return (
    <div className="profileNavBar">
      <h2 className="text-xl font-semibold">TripShare</h2>
      <div className="flex flex-row items-center gap-4">
        <a href="/feed" className="hover:underline">
          Feed
        </a>
        <a href="/" className="hover:underline">
          Friends
        </a>
        {/*<button type="button" className="profileCircle"></button>*/}
        <Dropdown avatar={user.avatar} />
      </div>
    </div>
  );
}
