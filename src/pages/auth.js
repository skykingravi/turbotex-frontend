import { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import Form from "../components/form.js";
import { useGetURL } from "../hooks/useGetUrl.js";
import PreLoader from "../components/preLoader.js";
import Button from "../components/button.js";
import { ReactComponent as L } from "../assets/icons/login.svg";
import { ReactComponent as R } from "../assets/icons/logout.svg";

const Login = ({ setShowPreLoader }) => {
    const [, SERVER_URL] = useGetURL();
    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setUserPassword] = useState("");

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const navigate = useNavigate();

    const [, setCookies] = useCookies(["access_token"]);

    const onSubmit = async (event) => {
        event.preventDefault();
        setShowPreLoader(true);
        try {
            const response = await axios.post(`${SERVER_URL}/auth/login`, {
                userEmail: userEmail,
                userPassword: userPassword,
            });

            alert(response.data.message);
            if (response.data.token) {
                setCookies("access_token", response.data.token);
                window.localStorage.setItem("token", response.data.token);
                window.localStorage.setItem("userId", response.data.userId);
                window.localStorage.setItem("userName", response.data.userName);
                navigate("/dashboard");
            } else {
                setShowPreLoader(false);
            }
        } catch (error) {
            console.error(error);
            setShowPreLoader(false);
        }
    };

    return (
        <Form
            userEmail={userEmail}
            setUserEmail={setUserEmail}
            userPassword={userPassword}
            setUserPassword={setUserPassword}
            label={"login"}
            onSubmit={onSubmit}
        />
    );
};

const Register = ({ setShowPreLoader, handleMoving }) => {
    const [, SERVER_URL] = useGetURL();
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setUserPassword] = useState("");

    const onSubmit = async (event) => {
        event.preventDefault();
        setShowPreLoader(true);
        try {
            const response = await axios.post(`${SERVER_URL}/auth/register`, {
                userName: userName,
                userEmail: userEmail,
                userPassword: userPassword,
            });

            alert(response.data.message);
            if (response.data.message === "Registration complete! Now login.") {
                handleMoving();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setShowPreLoader(false);
        }
    };

    return (
        <Form
            userName={userName}
            setUserName={setUserName}
            userEmail={userEmail}
            setUserEmail={setUserEmail}
            userPassword={userPassword}
            setUserPassword={setUserPassword}
            label={"register"}
            onSubmit={onSubmit}
        />
    );
};

export const Auth = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [move, setMove] = useState(false);
    const [showPreLoader, setShowPreLoader] = useState(false);

    return (
        <>
            {showPreLoader && <PreLoader />}
            <section className="page auth-page">
                <div className={"auth-container" + (move ? " move" : "")}>
                    <div className="auth-wrapper">
                        <Login setShowPreLoader={setShowPreLoader} />
                        <Register
                            setShowPreLoader={setShowPreLoader}
                            handleMoving={() => setMove(false)}
                        />
                    </div>
                    <div className="login-text">
                        <h3>Already have an Account!</h3>
                        <Button
                            Icon={L}
                            handleButtonClick={() => setMove(false)}
                            name="Login"
                        />
                    </div>
                    <div className="register-text">
                        <h3>Are you a New User?</h3>
                        <Button
                            Icon={R}
                            handleButtonClick={() => setMove(true)}
                            name="Register"
                        />
                    </div>
                </div>
            </section>
        </>
    );
};

export default Auth;
