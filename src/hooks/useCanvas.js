import React, { useContext, useRef, useState } from "react";

const CanvasContext = React.createContext();

export const CanvasProvider = ({ children }) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    const prepareCanvas = (percentage) => {
        const canvas = canvasRef.current;
        const WIDTH = window.innerWidth * (1 - percentage) * 0.9 - 40;
        canvas.width = WIDTH;
        canvas.height = WIDTH * 0.5;

        const context = canvas.getContext("2d");
        context.lineCap = "round";
        context.strokeStyle = "#1c1c1c";
        context.lineWidth = 3;
        contextRef.current = context;

        context.fillStyle = "#f2f2f2";
        context.fillRect(0, 0, canvas.width, canvas.height);
    };

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const finishDrawing = () => {
        contextRef.current.closePath();
        setIsDrawing(false);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) {
            return;
        }
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context.fillStyle = "#f2f2f2";
        context.fillRect(0, 0, canvas.width, canvas.height);
    };

    return (
        <CanvasContext.Provider
            value={{
                canvasRef,
                contextRef,
                prepareCanvas,
                startDrawing,
                finishDrawing,
                clearCanvas,
                draw,
            }}
        >
            {children}
        </CanvasContext.Provider>
    );
};

export const useCanvas = () => useContext(CanvasContext);
