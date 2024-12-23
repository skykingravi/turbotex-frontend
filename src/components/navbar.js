import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useState } from "react";
import Button from "./button";
import { ReactComponent as Logo } from "../assets/icons/latex.svg";
import { ReactComponent as Login } from "../assets/icons/login.svg";
import { ReactComponent as Logout } from "../assets/icons/logout.svg";

export const Navbar = () => {
    const [cookies, setCookies] = useCookies(["access_token"]);
    const navigate = useNavigate();
    const [showNavbar, setShowNavbar] = useState(false);

    const location = useLocation();

    const logOut = (e) => {
        e.preventDefault();
        setCookies("access_token", "");
        window.localStorage.removeItem("token");
        window.localStorage.removeItem("userId");
        window.localStorage.removeItem("userName");
        navigate("/auth");
    };

    return (
        <header id="navbar-header">
            <nav className={showNavbar ? "navbar" : "navbar hidden"}>
                <div id="logo">
                    <Link to="/">
                        <Logo />
                    </Link>
                </div>
                <ul>
                    <li
                        onClick={() => {
                            setShowNavbar(false);
                            window.scrollTo(0, 0);
                        }}
                        className={location.pathname === "/" ? "selected" : ""}
                    >
                        <Link to="/">home</Link>
                    </li>
                    {cookies.access_token && (
                        <li
                            className={
                                location.pathname === "/dashboard"
                                    ? "selected"
                                    : ""
                            }
                        >
                            <Link to="/dashboard">Dashboard</Link>
                        </li>
                    )}
                    <li
                        className={
                            location.pathname === "/templates" ? "selected" : ""
                        }
                    >
                        <Link to="/templates">templates</Link>
                    </li>
                    <li
                        className={
                            location.pathname === "/about" ? "selected" : ""
                        }
                    >
                        <Link to="/about">about</Link>
                    </li>
                    <li
                        className={
                            location.pathname === "/contact" ? "selected" : ""
                        }
                    >
                        <Link to="/contact">contact</Link>
                    </li>
                </ul>
                {cookies.access_token ? (
                    <Button
                        handleButtonClick={logOut}
                        fontSize={"16px"}
                        name="Log out"
                        Icon={Logout}
                    />
                ) : (
                    <Link onClick={() => setShowNavbar(false)} to="/auth">
                        <Button
                            fontSize={"16px"}
                            name="Register"
                            Icon={Login}
                        />
                    </Link>
                )}
            </nav>
        </header>
    );
};
