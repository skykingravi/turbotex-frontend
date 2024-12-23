import React, { useEffect, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
// import * as d3 from "d3-scale-chromatic";
import { findBibItems } from "../helpers/findBibItems";
import { findCitations } from "../helpers/findCitations";

const uniqueColors = [
    "#FFC107",
    "#FF5722",
    "#8BC34A",
    "#CDDC39",
    "#03A9F4",
    "#00BCD4",
    "#9C27B0",
    "#E91E63",
    "#FF9800",
    "#F44336",
    "#607D8B",
    "#9E9E9E",
    "#3F51B5",
    "#2196F3",
    "#009688",
    "#4CAF50",
    "#FFEB3B",
    "#795548",
    "#673AB7",
    "#AED581",
    "#FFB300",
    "#F06292",
    "#7C4DFF",
    "#26A69A",
    "#FFA000",
    "#5C6BC0",
    "#42A5F5",
    "#039BE5",
    "#0097A7",
    "#8E24AA",
    "#D32F2F",
    "#388E3C",
    "#C0CA33",
    "#F57C00",
    "#6D4C41",
    "#78909C",
    "#BF360C",
    "#4E342E",
    "#1E88E5",
    "#43A047",
    "#C2185B",
    "#FBC02D",
    "#8D6E63",
    "#9575CD",
    "#9CCC65",
    "#558B2F",
    "#00796B",
    "#0277BD",
    "#512DA8",
    "#FF7043",
];

// Function to transform items to graph data
const transformCitationsToGraph = (items) => {
    const nodes = {};
    const links = [];

    Object.entries(items).forEach((item, index) => {
        const paperId = item[0];
        const { title, author: authors } = item[1];

        // Add paper as a square node
        nodes[paperId] = {
            id: paperId,
            title: title,
            // color: d3.schemeCategory10[index % 10],
            color: uniqueColors[index % uniqueColors.length],
            shape: "square",
        };

        // Add authors to nodes as circular nodes
        authors?.forEach((author) => {
            nodes[author] = { id: author, color: "black", shape: "circle" };
            links.push({
                source: author,
                target: paperId,
                // color: d3.schemeCategory10[index % 10],
                color: uniqueColors[index % uniqueColors.length],
            });
        });
    });

    return {
        nodes: Object.values(nodes),
        links,
    };
};

const transformSectionsToGraph = (sections, BIBITEMS) => {
    const nodes = {};
    const links = [];

    const len = sections.length;
    const rows = Math.floor(Math.sqrt(len));
    const cols = Math.ceil(len / rows);

    sections.forEach((sv, index) => {
        const slen = Object.keys(sv[1].citations).length;
        const sid = sv[0];

        const sectionNode = {
            id: sid,
            name: sv[1].title,
            type: "section",
            group: "section",
            radius: 50 + slen * 5,
            x: 300 + (index % cols) * 400,
            y: 300 + Math.floor(index / cols) * 400,
        };
        nodes[sid] = sectionNode;

        Object.entries(sv[1].citations).forEach((cv, idx) => {
            const cid = `${sv[0]}-${cv[0]}`;
            const citationNode = {
                id: cid,
                name: cv[0],
                type: "citation",
                group: "citation",
                year: BIBITEMS[cv[0]] && BIBITEMS[cv[0]]["year"],
                times: cv[1],
            };
            nodes[cid] = citationNode;
            links.push({
                color: BIBITEMS[cv[0]] !== undefined ? "black" : "red",
                source: sid,
                target: cid,
            });
        });
    });

    return {
        nodes: Object.values(nodes),
        links,
    };
};

const CitationMesh = ({
    percentage,
    showLegend,
    showInformation,
    showCitations,
    url,
    documentId,
}) => {
    const [selectedNode, setSelectedNode] = useState(null);
    const [BIBITEMS, SETBIBITEMS] = useState({});
    const [AUTHORS, SETAUTHORS] = useState({});
    const [CITATIONS, SETCITATIONS] = useState({});
    const [bibItemsGraphData, setBibItemsGraphData] = useState({
        nodes: [],
        links: [],
    });
    const [citationsGraphData, setCitationsGraphData] = useState({
        nodes: [],
        links: [],
    });

    const fetchData = async (URL) => {
        try {
            const [b, a] = await findBibItems(URL);
            SETBIBITEMS(b);
            SETAUTHORS(a);

            const [c, s] = await findCitations(documentId, URL);
            SETCITATIONS(c);

            setBibItemsGraphData(transformCitationsToGraph(b));
            setCitationsGraphData(transformSectionsToGraph(s, b));
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData(url);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, documentId]);

    const paintNode = (node, ctx) => {
        const { x, y, color, shape } = node;
        const r = 4; // radius for circular nodes
        const squareSize = 8; // size for square nodes

        ctx.fillStyle = color;
        ctx.font = "4px Arial";

        if (shape === "circle") {
            ctx.fillStyle = "black";
            // Draw circular node
            ctx.beginPath();
            ctx.arc(x, y, r, 0, 2 * Math.PI, false);
            ctx.fill();

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(node.id, x, y - r - 1);
        } else if (shape === "square") {
            // Draw square node
            ctx.fillRect(
                x - squareSize / 2,
                y - squareSize / 2,
                squareSize,
                squareSize
            );

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(node.id, x, y - squareSize / 2 - 2);
        }
    };

    const paintBubble = (node, ctx) => {
        const r = 4; // Radius for citation nodes
        ctx.font = "12px Arial"; // Adjusted font size for better visibility

        if (node.type === "section") {
            ctx.fillStyle = "rgba(100, 150, 250)";
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = "rgba(100, 150, 250, 0.3)";
            ctx.fill();
            ctx.strokeStyle = "rgba(100, 150, 250, 0.8)";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw section title
            const label = node.name || "Section";
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(label, node.x, node.y - node.radius - 10); // Offset label above the bubble
        } else if (node.type === "citation") {
            // Draw citation node
            ctx.fillStyle = BIBITEMS[node.name] !== undefined ? "black" : "red";
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
            ctx.fill();

            // Draw citation info
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            let txt = `${node.name}`;
            if (node.year) txt += ` - ${node.year}`;
            txt += ` (${node.times})`;
            ctx.fillText(txt, node.x, node.y - 6); // Place label below the bubble
        }
    };

    return (
        <div className="citations-map-wrapper">
            {showCitations ? (
                <ForceGraph2D
                    className="fg-wrapper"
                    width={window.innerWidth * (1 - percentage)}
                    height={undefined}
                    graphData={citationsGraphData}
                    nodeAutoColorBy="group"
                    linkColor={(link) => link.color}
                    nodeCanvasObject={paintBubble}
                    nodeLabel={(node) => node.name}
                    onNodeClick={(node) => {
                        if (node.type === "citation") setSelectedNode(node);
                    }}
                    linkWidth={(link) =>
                        selectedNode &&
                        !(
                            link.source.id === selectedNode.id ||
                            link.target.id === selectedNode.id
                        )
                            ? 1
                            : 2
                    }
                    linkLineDash={(link) =>
                        selectedNode &&
                        !(
                            link.source.id === selectedNode.id ||
                            link.target.id === selectedNode.id
                        )
                            ? [1, 2]
                            : null
                    }
                    minZoom={0.1}
                    maxZoom={100}
                />
            ) : (
                <ForceGraph2D
                    className="fg-wrapper"
                    width={window.innerWidth * (1 - percentage)}
                    height={undefined}
                    graphData={bibItemsGraphData}
                    nodeAutoColorBy="color"
                    linkColor={(link) => link.color}
                    linkWidth={(link) =>
                        selectedNode &&
                        !(
                            link.source.id === selectedNode.id ||
                            link.target.id === selectedNode.id
                        )
                            ? 1
                            : 2
                    }
                    linkLineDash={(link) =>
                        selectedNode &&
                        !(
                            link.source.id === selectedNode.id ||
                            link.target.id === selectedNode.id
                        )
                            ? [1, 2]
                            : null
                    }
                    nodeCanvasObject={paintNode}
                    nodeLabel={(node) => node.id}
                    onNodeClick={(node) => setSelectedNode(node)}
                    minZoom={0.1}
                    maxZoom={100}
                />
            )}
            {showLegend && !showCitations && (
                <div id="legend-box">
                    {bibItemsGraphData.nodes
                        .filter((val) => val.shape === "square")
                        .map((val, indx) => {
                            return (
                                <p key={indx}>
                                    <strong
                                        style={{
                                            borderLeft: `5px solid ${val.color}`,
                                            paddingLeft: "5px",
                                        }}
                                    >
                                        {val.id}:
                                    </strong>{" "}
                                    {val.title}
                                </p>
                            );
                        })}
                </div>
            )}
            {selectedNode &&
                showInformation &&
                (BIBITEMS[selectedNode.name || selectedNode.id] ||
                    AUTHORS[selectedNode.id]) && (
                    <div id="node-info">
                        {selectedNode.type !== "citation" &&
                        selectedNode.color === "black" ? (
                            <div>
                                <p>
                                    <strong>{selectedNode.id}</strong> has
                                    contributed in{" "}
                                    <strong>
                                        {AUTHORS[selectedNode.id]?.length || 0}
                                    </strong>{" "}
                                    studies.
                                </p>
                                {AUTHORS[selectedNode.id]?.length > 0 && (
                                    <div>
                                        <strong>Studies: </strong>
                                        {AUTHORS[selectedNode.id].map((val) => {
                                            return (
                                                <p key={val}>
                                                    <em>{val}</em>
                                                </p>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <p>
                                    <strong>Citation Key: </strong>
                                    {selectedNode.name || selectedNode.id}
                                </p>
                                {Object.entries(
                                    BIBITEMS[
                                        selectedNode.name || selectedNode.id
                                    ]
                                )
                                    .filter(
                                        (val) =>
                                            val[0] !== "author" &&
                                            val[0] !== "missing"
                                    )
                                    .map((val, indx) => {
                                        return (
                                            <div key={indx}>
                                                <p>
                                                    <strong
                                                        style={{
                                                            textTransform:
                                                                "capitalize",
                                                        }}
                                                    >
                                                        {val[0]}:{" "}
                                                    </strong>
                                                    {val[1]?.toString()}
                                                </p>
                                            </div>
                                        );
                                    })}
                                <p>
                                    - The study has{" "}
                                    <strong>
                                        {BIBITEMS[
                                            selectedNode.name || selectedNode.id
                                        ]["author"]?.length || 0}
                                    </strong>{" "}
                                    authors.
                                </p>
                                <p>
                                    - It is cited{" "}
                                    <strong>
                                        {CITATIONS[
                                            selectedNode.name || selectedNode.id
                                        ]?.length || 0}
                                    </strong>{" "}
                                    times in the document.
                                </p>
                                {BIBITEMS[selectedNode.name || selectedNode.id][
                                    "missing"
                                ]?.length > 0 && (
                                    <>
                                        <strong>
                                            Missing Fields
                                            <sup style={{ color: "red" }}>
                                                *
                                            </sup>
                                        </strong>
                                        <p>
                                            {BIBITEMS[
                                                selectedNode.name ||
                                                    selectedNode.id
                                            ]["missing"].join(", ")}
                                            .
                                        </p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
        </div>
    );
};

export default CitationMesh;
