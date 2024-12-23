import React, { useState } from "react";
import { Canvas } from "./canvas";
import { ClearCanvasButton } from "./clearCanvasButton";
import axios from "axios";
import Latex from "react-latex";
import Button from "./button";
import { ReactComponent as Insert } from "../assets/icons/insert.svg";
import { ReactComponent as Generate } from "../assets/icons/recompile.svg";
import { ReactComponent as Clear } from "../assets/icons/clear.svg";
import { ReactComponent as Upload } from "../assets/icons/upload.svg";
import { ReactComponent as Copy } from "../assets/icons/copy-paste.svg";

const MathToTex = ({ canDraw, canView, percentage, handleInsert }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [latexCode, setLatexCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [dragged, setDragged] = useState(false);
    const [imageUrl, setImageUrl] = useState("none");

    const handleFileChange = (event) => {
        if (event.target.files.length === 0) return;
        setSelectedFile(event.target.files[0]);
        setImageUrl(`url("${URL.createObjectURL(event.target.files[0])}")`);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLatexCode("");

        if (!canDraw && !selectedFile) {
            alert("Please select an image file.");
            return;
        }

        try {
            const formData = new FormData();
            if (canDraw) {
                const elem = document.getElementById("canvas");
                if (!elem) return;

                const dataURL = elem.toDataURL();
                formData.append("file", dataURLtoBlob(dataURL), "drawing.png");
            } else {
                formData.append("file", selectedFile);
            }

            setLoading(true);

            const response = await axios.post(
                "http://localhost:8000/predict/",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            console.log(response);
            setLatexCode(response.data.latex_code);
        } catch (error) {
            alert("Failed to fetch LaTeX code. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const dataURLtoBlob = (dataUrl) => {
        const [header, data] = dataUrl.split(",");
        const mime = header.match(/:(.*?);/)[1];
        const byteString = atob(data);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uintArray = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
            uintArray[i] = byteString.charCodeAt(i);
        }
        return new Blob([arrayBuffer], { type: mime });
    };

    return (
        <div id="math2tex-container">
            <div className="interaction-wrapper">
                {canView && (
                    <div id="math-latex">
                        <Latex>{latexCode}</Latex>
                    </div>
                )}
                {canDraw ? (
                    <Canvas percentage={percentage} />
                ) : (
                    <div
                        className={
                            selectedFile
                                ? "input-wrapper active"
                                : dragged
                                ? "input-wrapper dragged"
                                : "input-wrapper"
                        }
                        style={{
                            backgroundImage: imageUrl,
                            border: selectedFile
                                ? "none"
                                : "2px dashed var(--black)",
                            height:
                                (window.innerWidth * (1 - percentage) * 0.9 -
                                    40) *
                                0.5,
                        }}
                    >
                        {selectedFile && (
                            <p id="file-name">
                                {selectedFile.name
                                    ? selectedFile.name
                                    : "File without name"}
                            </p>
                        )}
                        <Upload />
                        <p>Choose an image file or drag & drop it here.</p>
                        <div
                            className="input-btn"
                            style={{
                                borderRadius: "10px",
                            }}
                        >
                            Browse File
                        </div>
                        <input
                            id="file-inp"
                            type="file"
                            accept="image/*"
                            onInput={handleFileChange}
                            onChange={handleFileChange}
                            onDragEnter={() => setDragged(true)}
                            onDragLeave={() => setDragged(false)}
                            onDragOver={() => setDragged(true)}
                        />
                    </div>
                )}
            </div>

            <textarea
                spellCheck={false}
                id="math-latex-code"
                value={latexCode}
                onChange={(e) => setLatexCode(e.target.value)}
            ></textarea>

            <div className="btns-wrapper">
                <div className="btns">
                    <Button
                        name={copied ? "Copied" : "Copy"}
                        handleButtonClick={() => {
                            navigator.clipboard.writeText(latexCode);
                            setCopied(true);
                            setTimeout(() => {
                                setCopied(false);
                            }, 1000);
                        }}
                        disabled={!latexCode || copied}
                        Icon={Copy}
                        radius={"10px"}
                        fontSize="16px"
                    />
                    <Button
                        name="Insert"
                        Icon={Insert}
                        radius={"10px"}
                        fontSize="16px"
                        disabled={!latexCode}
                        handleButtonClick={() => {
                            handleInsert(latexCode);
                        }}
                    />
                    {canDraw ? (
                        <ClearCanvasButton />
                    ) : (
                        <Button
                            radius={"10px"}
                            name="Clear"
                            handleButtonClick={() => {
                                setSelectedFile(null);
                                setDragged(false);
                                setImageUrl("none");
                            }}
                            Icon={Clear}
                            fontSize="16px"
                        />
                    )}
                </div>

                <Button
                    radius={"10px"}
                    disabled={loading}
                    name={loading ? "Generating..." : "Generate"}
                    handleButtonClick={handleSubmit}
                    Icon={Generate}
                    fontSize="16px"
                />
            </div>
        </div>
    );
};

export default MathToTex;
