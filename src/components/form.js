import React from "react";
import Button from "./button";
import { ReactComponent as Login } from "../assets/icons/login.svg";
import { ReactComponent as Register } from "../assets/icons/logout.svg";

const Form = ({
    userName,
    setUserName,
    userEmail,
    setUserEmail,
    userPassword,
    setUserPassword,
    label,
    onSubmit,
}) => {
    return (
        <form
            onSubmit={onSubmit}
            className={
                label === "register" ? "register-wrapper" : "login-wrapper"
            }
        >
            <h1>{label === "login" ? "WELCOME BACK" : "NEW ACCOUNT"}</h1>
            {label === "register" && (
                <div>
                    <label htmlFor="userName">-Name-</label>
                    <br />
                    <input
                        autoComplete="name"
                        placeholder="Ravi"
                        required
                        type="text"
                        name="userName"
                        id="userName"
                        value={userName}
                        onChange={(event) => setUserName(event.target.value)}
                    />
                </div>
            )}
            <div>
                <label htmlFor={label + "-userEmail"}>-Email-</label>
                <br />
                <input
                    autoComplete="email"
                    placeholder="r3@gmail.com"
                    required
                    type="email"
                    name={label + "-userEmail"}
                    id={label + "-userEmail"}
                    value={userEmail}
                    onChange={(event) => setUserEmail(event.target.value)}
                />
            </div>
            <div>
                <label htmlFor={label + "-userPassword"}>-Password-</label>
                <br />
                <input
                    autoComplete="password"
                    placeholder="****"
                    required
                    type="password"
                    name={label + "-userPassword"}
                    id={label + "-userPassword"}
                    value={userPassword}
                    onChange={(event) => setUserPassword(event.target.value)}
                />
            </div>
            <Button
                Icon={label === "login" ? Login : Register}
                type="submit"
                name={label === "login" ? "Login" : "Register"}
            />
        </form>
    );
};

export default Form;
