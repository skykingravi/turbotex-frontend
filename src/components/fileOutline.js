import React, { useState, useEffect, useRef } from "react";
import { findFileOutline } from "../helpers/findFileOutline";
import { ReactComponent as Right } from "../assets/icons/right.svg";
import { ReactComponent as Down } from "../assets/icons/down.svg";

// Recursive component to display nested hierarchy
const OutlineList = ({ hierarchy, highlightedLine, setJumpToLine }) => {
    return (
        <ul className="outline-list">
            {hierarchy.map(([item, children], index) => (
                <OutlineListItem
                    key={index}
                    item={item}
                    childrenData={children}
                    isHighlighted={item.line === highlightedLine} // Highlight based on the precomputed line
                    highlightedLine={highlightedLine}
                    setJumpToLine={setJumpToLine}
                />
            ))}
        </ul>
    );
};

const OutlineListItem = ({
    item,
    childrenData,
    isHighlighted,
    highlightedLine,
    setJumpToLine,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const itemRef = useRef(null);

    useEffect(() => {
        if (isHighlighted && itemRef.current) {
            itemRef.current.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "nearest",
            });
        }
    }, [isHighlighted]);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <li ref={itemRef} className="outline-wrapper">
            <div className="outline-item">
                <span
                    style={{
                        cursor: childrenData.length > 0 ? "pointer" : "default",
                        userSelect: "none",
                    }}
                    className="expand-toggle"
                    onClick={childrenData.length > 0 ? toggleExpand : undefined}
                >
                    {childrenData.length > 0 &&
                        (isExpanded ? <Down /> : <Right />)}
                </span>
                <span
                    className={`${isHighlighted ? "active" : ""}`}
                    onClick={() => setJumpToLine(item.line)}
                >
                    {item.text.length > 20
                        ? item.text.slice(0, 21) + "..."
                        : item.text}
                </span>
            </div>
            {isExpanded && childrenData.length > 0 && (
                <OutlineList
                    hierarchy={childrenData}
                    highlightedLine={highlightedLine}
                    setJumpToLine={setJumpToLine}
                />
            )}
        </li>
    );
};

// Main component
const FileOutline = ({ documentContent, currentLine, setJumpToLine }) => {
    const [highlightedLine, setHighlightedLine] = useState(null);

    // Preprocess the closest item
    useEffect(() => {
        const outlineData = findFileOutline(documentContent);

        // Find the closest item
        const findClosestLine = (hierarchy, targetLine) => {
            let closestItem = null;
            let closestDistance = Infinity;

            const traverseHierarchy = (items) => {
                items.forEach(([item, children]) => {
                    const distance = Math.abs(item.line - targetLine);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestItem = item.line; // Only store the line
                    }

                    // Recursively traverse children
                    if (children.length > 0) {
                        traverseHierarchy(children);
                    }
                });
            };

            traverseHierarchy(hierarchy);
            return closestItem;
        };

        if (outlineData.length > 0) {
            const closest = findClosestLine(outlineData, currentLine);
            setHighlightedLine(closest); // Update the highlighted line
        }
    }, [documentContent, currentLine]);

    const outlineData = findFileOutline(documentContent);

    return (
        <div id="file-outline-wrapper">
            {outlineData && outlineData.length > 0 && (
                <OutlineList
                    hierarchy={outlineData}
                    highlightedLine={highlightedLine}
                    setJumpToLine={setJumpToLine}
                />
            )}
        </div>
    );
};

export default FileOutline;
