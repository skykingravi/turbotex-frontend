import axios from "axios";
import React, { useState } from "react";
import Button from "./button";
import { ReactComponent as Add } from "../assets/icons/add.svg";
import { ReactComponent as Minus } from "../assets/icons/minus.svg";

const Share = ({ SERVER_URL, documentId, userId }) => {
    const [userEmail, setUserEmail] = useState("");

    const handleAddCollaborator = async (e) => {
        e.preventDefault();
        if (!userEmail) return;
        try {
            const response = await axios.post(
                `${SERVER_URL}/documents/addCollaborator`,
                {
                    documentId,
                    userEmail,
                    userId,
                }
            );
            console.log(response.data.message);
        } catch (error) {
            console.error(error);
        } finally {
            setUserEmail("");
        }
    };

    const handleRemoveCollaborator = async (e) => {
        e.preventDefault();
        if (!userEmail) return;
        try {
            const response = await axios.post(
                `${SERVER_URL}/documents/removeCollaborator`,
                {
                    documentId,
                    userEmail,
                    userId,
                }
            );
            console.log(response.data.message);
        } catch (error) {
            console.error(error);
        } finally {
            setUserEmail("");
        }
    };

    return (
        <div className="share-wrapper">
            <label htmlFor="user-email">-Email-</label>
            <input
                type="email"
                id="user-email"
                name="user-email"
                placeholder="example123@gmail.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
            />
            <div className="btns">
                <Button
                    disabled={!userEmail}
                    handleButtonClick={handleAddCollaborator}
                    name="Add"
                    Icon={Add}
                    fontSize="16px"
                />
                <Button
                    disabled={!userEmail}
                    handleButtonClick={handleRemoveCollaborator}
                    name="Remove"
                    Icon={Minus}
                    fontSize="16px"
                />
            </div>
        </div>
    );
};

export default Share;
