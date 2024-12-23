import React, { useEffect, useRef, useState } from "react";
import { ReactComponent as Send } from "../assets/icons/send.svg";
import { useGetUserId } from "../hooks/useGetUserId";

const Chat = ({ messages, setMessages, documentId, showNames }) => {
    const [message, setMessage] = useState("");
    const userId = useGetUserId();
    const chatContainerRef = useRef(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);

        const options = {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        };

        const formattedDate = date
            .toLocaleString("en-GB", options)
            .replace(",", "")
            .replace(/\//g, "/");

        return formattedDate;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message === "") return;
        const mssg = {
            userId: userId,
            name: userId,
            timestamp: Date.now(),
            documentId: documentId,
            message: message,
        };
        setMessages((prev) => [...prev, mssg]);
        setMessage("");
    };

    return (
        <div id="chat-wrapper">
            <div id="chats" ref={chatContainerRef}>
                {messages.map((val, indx) => {
                    return (
                        <div
                            key={indx}
                            className={
                                val.userId === userId ? "chat active" : "chat"
                            }
                        >
                            {showNames && <p className="name">{val.name}</p>}
                            <p className="message">{val.message}</p>
                            <p className="date">{formatDate(val.timestamp)}</p>
                        </div>
                    );
                })}
            </div>
            <form onSubmit={handleSubmit} id="chat-bar">
                <input
                    type="text"
                    placeholder="Type something here..."
                    onChange={(e) => setMessage(e.target.value)}
                    value={message}
                    required
                />
                <Send />
            </form>
        </div>
    );
};

export default Chat;
