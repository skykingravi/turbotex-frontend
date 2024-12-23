import React from "react";
import { useCanvas } from "../hooks/useCanvas";
import { ReactComponent as Clear } from "../assets/icons/clear.svg";
import Button from "./button";

export const ClearCanvasButton = () => {
    const { clearCanvas } = useCanvas();

    return (
        <Button
            radius={"10px"}
            name="Clear"
            Icon={Clear}
            handleButtonClick={clearCanvas}
            fontSize="16px"
        />
    );
};
