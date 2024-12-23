import React, { useState } from "react";
import axios from "axios";

const TableGenerator = () => {
    const [latexCode, setLatexCode] = useState("");
    const [error, setError] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            setIsProcessing(true);
            setError("");
            setLatexCode("");

            // Update to FastAPI endpoint
            const response = await axios.post(
                "http://127.0.0.1:8000/convert/",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.latex_code) {
                setLatexCode(response.data.latex_code); // Update based on FastAPI response
            } else {
                setError("Failed to process the file. Please try again.");
            }
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                    "An error occurred during file processing."
            );
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="excel-to-latex-container">
            <h1>Excel to LaTeX Converter</h1>

            <div className="upload-section">
                <label htmlFor="file-upload" className="upload-label">
                    Choose an Excel file
                </label>
                <input
                    type="file"
                    id="file-upload"
                    accept=".xls,.xlsx"
                    onChange={handleFileUpload}
                    className="file-input"
                />
            </div>

            {isProcessing && (
                <p className="status-message">Processing your file...</p>
            )}

            {error && <p className="error-message">{error}</p>}

            {latexCode && (
                <div className="output-section">
                    <h2>Generated LaTeX Code</h2>
                    <pre className="latex-output">{latexCode}</pre>
                    <button
                        onClick={() => navigator.clipboard.writeText(latexCode)}
                        className="copy-button"
                    >
                        Copy to Clipboard
                    </button>
                </div>
            )}
        </div>
    );
};

export default TableGenerator;
