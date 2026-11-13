import "../index.css";
// @ts-ignore
import googleIcon from "../Google_Favicon_2025.svg.webp";
import {
  useState,
  type ChangeEvent,
  type Dispatch,
  type KeyboardEvent,
  type KeyboardEventHandler,
  type SetStateAction,
} from "react";

export function LoginUI() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const updateState =
    (setter: Dispatch<SetStateAction<string>>) =>
    (e: KeyboardEvent<HTMLInputElement>) => {
      setter((e.target as HTMLInputElement)?.value);
    };

  return (
    <div className="loginPage">
      <div className="groupingLogin">
        <p className="loginText">Username</p>
        <input
          className="textInput"
          type="text"
          name="username"
          onKeyDown={updateState(setUsername)}
        />
      </div>
      <div className="groupingLogin">
        <p className="loginText">Password</p>
        <input
          className="textInput"
          type="password"
          name="password"
          onKeyDown={updateState(setPassword)}
        />
      </div>
      <div className="groupingLogin">
        <a href="/signup" className="loginText">
          Create Account
        </a>
        <div className="loginAlign"></div>
      </div>
      <button className="loginButton">Login</button>
      <div className="googleLogin">
        <img src={googleIcon} alt="G"></img>
      </div>
    </div>
  );
}

export default LoginUI;
