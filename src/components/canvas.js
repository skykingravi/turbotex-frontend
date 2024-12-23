import React, { useEffect } from "react";
import { useCanvas } from "../hooks/useCanvas";

export function Canvas({ percentage }) {
    const { canvasRef, prepareCanvas, startDrawing, finishDrawing, draw } =
        useCanvas();

    useEffect(() => {
        prepareCanvas(percentage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [percentage]);

    return (
        <canvas
            id="canvas"
            onMouseDown={startDrawing}
            onMouseUp={finishDrawing}
            onMouseMove={draw}
            onClick={draw}
            onMouseLeave={finishDrawing}
            ref={canvasRef}
        />
    );
}
