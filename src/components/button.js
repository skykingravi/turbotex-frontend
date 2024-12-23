import React from "react";

const Button = ({
    name = "",
    disabled = false,
    handleButtonClick = () => {},
    type = "button",
    Icon,
    fontSize = "20px",
    onlyIcon = false,
    radius = "25px",
}) => {
    return (
        <button
            className={onlyIcon ? "btn only-icon" : "btn"}
            onClick={handleButtonClick}
            type={type}
            title={onlyIcon ? name : ""}
            disabled={disabled}
            style={{
                borderRadius: onlyIcon ? "50%" : radius,
            }}
        >
            <span className="icon" style={{ fontSize: fontSize }}>
                {Icon && <Icon />}
                <span>{!onlyIcon && name}</span>
            </span>
        </button>
    );
};

export default Button;
