import React, { useState } from "react";

const N = 10;

const TableGrid = ({ handleInsert, setShowTableGrid }) => {
    const [selected, setSelected] = useState(null);

    const handleClick = (i, j) => {
        const str = "\t\t" + "& ".repeat(j) + "\\\\\n";
        const txt = `\\begin{table}\n\t\\centering\n\t\\begin{tabular}{${"c".repeat(
            j + 1
        )}}\n${str.repeat(
            i + 1
        )}\t\\end{tabular}\n\t\\caption{Caption}\n\t\\label{tab:my_label}\n\\end{table}`;
        handleInsert(txt);
        setShowTableGrid(false);
    };

    return (
        <div className="table-grid-wrapper">
            <h4>{`Insert${
                selected === null
                    ? ""
                    : ` ${selected[0] + 1}x${selected[1] + 1}`
            } Table`}</h4>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${N}, auto)`,
                    gap: "5px",
                }}
                onMouseLeave={() => setSelected(null)}
            >
                {Array.from({ length: N }).map((_, i) =>
                    Array.from({ length: N }).map((_, j) => (
                        <span
                            key={`${i}-${j}`}
                            className={
                                selected && i <= selected[0] && j <= selected[1]
                                    ? "active"
                                    : ""
                            }
                            onMouseOver={() => setSelected([i, j])}
                            onClick={() => handleClick(i, j)}
                        ></span>
                    ))
                )}
            </div>
        </div>
    );
};

export default TableGrid;
