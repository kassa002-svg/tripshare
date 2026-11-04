import "../index.css"
'use client';
import {useState} from "react";

export function DropDown () {
    const [isShow, changeState] = useState(false);
    return (
        <div>
            <button onClick={() => changeState(!isShow)} className="profileCircle">
            </button>

            {isShow && <a href="/" className="loginDropdown">
                Sign Out
            </a>}
        </div>
    )
}

export default DropDown;
