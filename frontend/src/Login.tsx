import "./index.css"

export function LoginUI() {
    return (
        <div className="loginPage">
            <div className = "groupingLogin">
                <p className="loginText">
                    Username: 
                </p>
                <div className="textInput"> </div>
            </div>
            <div className ="groupingLogin">
                <p className="loginText">
                    Password: 
                </p>
                <div className="textInput"></div>
            </div>
            <div className="groupingLogin">
                <p className ="loginText">
                    Create Account
                </p>
                <div className="loginAlign"></div>
            </div>
            <div className="loginButton">
                Login
            </div>
        </div>
    )
}

export default LoginUI;