import React from "react";
import Button from "../components/button";
import { ReactComponent as Start } from "../assets/icons/start.svg";
import { useGetUserName } from "../hooks/useGetUserName.js";
import { useNavigate } from "react-router-dom";

export const Home = () => {
    const userName = useGetUserName();
    const navigate = useNavigate();

    const getGreetings = () => {
        const dt = new Date();
        const hours = dt.getHours();
        if (hours >= 6 && hours < 12) return "Good Morning";
        if (hours >= 12 && hours < 18) return "Good Afternoon";
        return "Good Evening";
    };

    return (
        <section className="page" id="home">
            <h4>
                {getGreetings()}, <strong>{userName || "User"}</strong>
            </h4>
            <h6>Welcome to</h6>
            <h1>TurboTex</h1>
            <p>A collaborative LaTeX platform for researchers.</p>
            <Button
                Icon={Start}
                handleButtonClick={() =>
                    navigate(userName ? "/dashboard" : "/auth")
                }
                name="Get Started"
                fontSize="22px"
            />
        </section>
    );
};
