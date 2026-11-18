import "../index.css"
import {useState} from "react";
import {useSession} from "../Session.tsx";

export function DropDown({ avatar }: { avatar: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useSession();

  async function handleSignOut() {
    await signOut();
    setIsOpen(false);
  }

  return (
    <div className="profileDropdown">
      <button onClick={() => setIsOpen(!isOpen)} className="profileCircle">
        {avatar && <img src={avatar} alt="Profile" />}
      </button>
      {isOpen && (
        <div className="loginDropdown">
          <a href="/profile" className="loginDropdownItem">
            My Profile
          </a>

          <button onClick={handleSignOut} className="loginDropdownItem">
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export function DropDownLogin () {
    const [isShow, setIsShow] = useState(false);

    const changeState = (state: boolean) => {
        setIsShow(state);
    }
    return (
        <div className="profileDropdown">
            <button onClick={() => changeState(!isShow)} className="profileCircle">
            </button>

            {isShow && <div className="loginDropdown">
                <a href="/auth/login" className="loginDropdownItem">
                    Sign In
                </a>
                <a href="/auth/signup" className="loginDropdownItem">
                    Sign Up
                </a>
            </div>}
        </div>
    )
}

export default DropDown;
