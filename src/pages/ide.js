import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ReactComponent as Home } from "../assets/icons/home.svg";
import { ReactComponent as Edit } from "../assets/icons/edit.svg";
import { ReactComponent as File } from "../assets/icons/file.svg";
import { ReactComponent as Folder } from "../assets/icons/folder.svg";
import { ReactComponent as Upload } from "../assets/icons/upload.svg";
import { ReactComponent as Delete } from "../assets/icons/delete.svg";
import { ReactComponent as Undo } from "../assets/icons/undo.svg";
import { ReactComponent as Redo } from "../assets/icons/redo.svg";
import { ReactComponent as Bold } from "../assets/icons/bold.svg";
import { ReactComponent as Italic } from "../assets/icons/italic.svg";
import { ReactComponent as MathIcon } from "../assets/icons/math.svg";
import { ReactComponent as Symbol } from "../assets/icons/symbol.svg";
import { ReactComponent as Link } from "../assets/icons/link.svg";
import { ReactComponent as Ref } from "../assets/icons/ref.svg";
import { ReactComponent as Cite } from "../assets/icons/cite.svg";
import { ReactComponent as Figure } from "../assets/icons/figure.svg";
import { ReactComponent as Table } from "../assets/icons/table.svg";
import { ReactComponent as BulletList } from "../assets/icons/bullet-list.svg";
import { ReactComponent as NumberedList } from "../assets/icons/numbered-list.svg";
import { ReactComponent as Recompile } from "../assets/icons/recompile.svg";
import { ReactComponent as Logs } from "../assets/icons/logs.svg";
import { ReactComponent as Download } from "../assets/icons/download.svg";
import { ReactComponent as Up } from "../assets/icons/up.svg";
import { ReactComponent as Down } from "../assets/icons/down.svg";
import { ReactComponent as Add } from "../assets/icons/add.svg";
import { ReactComponent as Minus } from "../assets/icons/minus.svg";
import { ReactComponent as DropDown } from "../assets/icons/drop-down.svg";
import Editor from "./editor";
import PDFViewer from "../components/pdfViewer";
import axios from "axios";
import { useGetURL } from "../hooks/useGetUrl";
import { useGetUserId } from "../hooks/useGetUserId";
import MathToTex from "../components/mathToTex";
import CitationMesh from "../components/citationMesh";
import LogsViewer from "../components/logsViewer";
import FileOutline from "../components/fileOutline";
import Chat from "../components/chat";
import ExcelToLatex from "../components/excelToLatex";
import TableGrid from "../components/table";
import MathSymbolSearch from "../components/mathSymbolSearch";
import FilesList from "../components/filesList";
import Share from "../components/share";

const IDE = () => {
    const [resizeBarPositions, setResizeBarPositions] = useState([
        0.5, 0.16, 0.62,
    ]);
    const [moving, setMoving] = useState(0);
    const [loading, setLoading] = useState(0);
    const [extra, setExtra] = useState("pdf");
    const [showLegend, setShowLegend] = useState(false);
    const [showInformation, setShowInformation] = useState(false);
    const [showCitations, setShowCitations] = useState(false);
    const [showLogs, setShowLogs] = useState(false);
    const [canDraw, setCanDraw] = useState(false);
    const [canView, setCanView] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [logs, setLogs] = useState("");
    const [errors, setErrors] = useState([]);
    const [warnings, setWarnings] = useState([]);
    const [compilationTime, setCompilationTime] = useState(0);
    const [documentContent, setDocumentContent] = useState("");
    const [documentName, setDocumentName] = useState("");
    const [currentLine, setCurrentLine] = useState(0);
    const [jumpToLine, setJumpToLine] = useState(0);
    const [messages, setMessages] = useState([]);
    const [editor, setEditor] = useState(null);
    const [showTableGrid, setShowTableGrid] = useState(false);
    const [showMathSymbols, setShowMathSymbols] = useState(false);
    const [showNames, setShowNames] = useState(true);
    const [nameValue, setNameValue] = useState("");
    const [editing, setEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [structure, setStructure] = useState({});

    const windowsRef = useRef(null);
    const navigate = useNavigate();
    const { id: documentId } = useParams();
    const userId = useGetUserId();
    const [, SERVER_URL] = useGetURL();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(
                    `${SERVER_URL}/files/${documentId}`
                );
                setStructure({ ...res.data });
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, [SERVER_URL, documentId]);

    const fetchDetails = async () => {
        try {
            const res = await axios.get(
                `${SERVER_URL}/documents/${documentId}/${userId}`
            );
            setDocumentName(res.data.documentName || "");
            setNameValue(res.data.documentName || "");
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPDF = async () => {
        try {
            const res = await axios.get(
                `${SERVER_URL}/output?documentId=${documentId}&userId=${userId}&type=pdf`,
                {
                    responseType: "blob",
                }
            );
            const pdfBlobUrl = URL.createObjectURL(res.data);
            setPdfUrl(pdfBlobUrl);
        } catch (err) {
            console.error(err);
            setPdfUrl(null);
        }
    };

    const fetchLogs = async () => {
        try {
            const res1 = await axios.get(
                `${SERVER_URL}/output?documentId=${documentId}&userId=${userId}&type=log`,
                {
                    responseType: "blob",
                }
            );
            setLogs(await res1.data.text());

            const res2 = await axios.get(
                `${SERVER_URL}/output?documentId=${documentId}&userId=${userId}&type=texlogfilter`,
                {
                    responseType: "blob",
                }
            );
            const txt = await res2.data.text();
            const lines = txt.split("\n");
            const errs = [];
            const warns = [];
            lines.forEach((line) => {
                if (errs.length < 10 && line.startsWith("\x1b[31m"))
                    errs.push(line.slice(5));
                if (warns.length < 10 && line.startsWith("\x1b[33m"))
                    warns.push(line.slice(5));
            });
            setErrors(errs);
            setWarnings(warns);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchDetails();
        fetchPDF();
        fetchLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCompile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setShowLogs(false);

        const dt = Date.now();
        try {
            const response = await axios.post(`${SERVER_URL}/compile`, {
                id: documentId,
            });
            console.log(response.data.message);
            await fetchPDF();
        } catch (error) {
            console.error("Error compiling LaTeX:", error);
            if (error.response && error.response.data.logs) {
                console.error(error.response.data.message);
            }
        } finally {
            setCompilationTime(Date.now() - dt);
            setTimeout(async () => {
                await fetchPDF();
                await fetchLogs();
            }, 200);
        }

        setLoading(false);
    };

    const handleDownload = () => {
        if (pdfUrl) {
            const link = document.createElement("a");
            link.href = pdfUrl;
            link.download = `${documentId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleInsert = (text) => {
        if (!editor) return;
        editor.replaceRange(
            text,
            editor.getCursor("from"),
            editor.getCursor("to"),
            "paste"
        );
        editor.focus();
    };

    const handleSubmit = async (e) => {
        if (!nameValue) return;
        e.preventDefault();
        try {
            const response = await axios.put(
                `${SERVER_URL}/documents/${documentId}`,
                {
                    newName: nameValue,
                }
            );
            console.log(response.data.message);
            setDocumentName(nameValue);
        } catch (err) {
            console.error(err);
        } finally {
            setEditing(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setUploading(true);

        const files = e.target.files;
        if (!files || !documentId) return;

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
        }
        formData.append("documentId", documentId);

        try {
            const response = await axios.post(
                `${SERVER_URL}/upload`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            console.log(response.data);

            const res = await axios.get(`${SERVER_URL}/files/${documentId}`);
            setStructure({ ...res.data });
        } catch (error) {
            console.error("Error uploading files:", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div id="ide">
            <header className="ide-header">
                <ul>
                    <li onClick={() => navigate("/dashboard")}>
                        <Home style={{ width: "28px", height: "28px" }} />
                    </li>
                    <li className="title-wrapper">
                        {editing ? (
                            <form onSubmit={handleSubmit}>
                                <input
                                    type="text"
                                    required
                                    value={nameValue}
                                    onChange={(e) =>
                                        setNameValue(e.target.value)
                                    }
                                    autoFocus
                                />
                            </form>
                        ) : (
                            <div onDoubleClick={() => setEditing(true)}>
                                {documentName.length > 20
                                    ? documentName.substring(0, 21) + "..."
                                    : documentName}{" "}
                                <Edit />
                            </div>
                        )}
                    </li>
                    <li
                        className={extra === "math2tex" ? "active" : ""}
                        onClick={() =>
                            setExtra((prev) =>
                                prev === "math2tex" ? "pdf" : "math2tex"
                            )
                        }
                    >
                        Math2Tex
                    </li>
                    <li
                        className={extra === "citations-map" ? "active" : ""}
                        onClick={() =>
                            setExtra((prev) =>
                                prev === "citations-map"
                                    ? "pdf"
                                    : "citations-map"
                            )
                        }
                    >
                        Citations Map
                    </li>
                    <li
                        className={extra === "table-generator" ? "active" : ""}
                        onClick={() =>
                            setExtra((prev) =>
                                prev === "table-generator"
                                    ? "pdf"
                                    : "table-generator"
                            )
                        }
                    >
                        Table Generator
                    </li>
                    <li
                        className={extra === "share" ? "active" : ""}
                        onClick={() =>
                            setExtra((prev) =>
                                prev === "share" ? "pdf" : "share"
                            )
                        }
                    >
                        Share
                    </li>
                    <li
                        className={extra === "chat" ? "active" : ""}
                        onClick={() =>
                            setExtra((prev) =>
                                prev === "chat" ? "pdf" : "chat"
                            )
                        }
                    >
                        Chat
                    </li>
                </ul>
            </header>
            <div
                className={moving === 0 ? "windows" : "windows moving"}
                ref={windowsRef}
                style={{
                    cursor:
                        moving === 0
                            ? "initial"
                            : moving === 1
                            ? "ns-resize"
                            : "ew-resize",
                }}
                onMouseMove={(e) => {
                    e.preventDefault();
                    if (moving === 0 || windowsRef.current === null) return;
                    const rect = windowsRef.current.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width;
                    const y = (e.clientY - rect.top) / rect.height;
                    let arr = [...resizeBarPositions];
                    if (moving === 1) arr[0] = y > 0.95 ? 1 : Math.max(y, 0.3);
                    else if (moving === 2)
                        arr[1] = x < 0.02 ? 0 : Math.min(x, 0.3);
                    else arr[2] = x > 0.98 ? 1 : Math.max(x, 0.4);
                    setResizeBarPositions(arr);
                }}
                onMouseUp={(e) => {
                    e.preventDefault();
                    if (moving === 0) return;
                    setMoving(0);
                }}
                onMouseLeave={(e) => {
                    e.preventDefault();
                    setMoving(0);
                }}
            >
                <div
                    className={
                        resizeBarPositions[1] < 0.02
                            ? "window left-window-minimized"
                            : "window"
                    }
                    style={{
                        width: `${resizeBarPositions[1] * 100}%`,
                    }}
                >
                    <div
                        className="sub-window"
                        style={{
                            height: `${resizeBarPositions[0] * 100}%`,
                        }}
                    >
                        <header className="window-header">
                            <File title="File" />
                            <Folder title="Folder" />
                            <Upload
                                title="Upload"
                                className={uploading ? "active" : ""}
                            />
                            <input
                                id="upload"
                                type="file"
                                multiple
                                onMouseOver={() => setUploading(true)}
                                onMouseOut={() => setUploading(false)}
                                onChange={handleUpload}
                            />
                            <Edit title="Edit" />
                            <Delete title="Delete" />
                        </header>
                        <FilesList
                            structure={structure}
                            SERVER_URL={SERVER_URL}
                            documentId={documentId}
                        />
                    </div>
                    <span
                        className={
                            moving === 1
                                ? resizeBarPositions[0] > 0.95
                                    ? "resize-bar horizontal horizontal-minimized active"
                                    : "resize-bar horizontal active"
                                : resizeBarPositions[0] > 0.95
                                ? "resize-bar horizontal horizontal-minimized"
                                : "resize-bar horizontal"
                        }
                        onDoubleClick={(e) => {
                            e.preventDefault();
                            let arr = [...resizeBarPositions];
                            arr[0] = arr[0] > 0.95 ? 0.5 : 1;
                            setResizeBarPositions(arr);
                        }}
                        style={{
                            top: `${resizeBarPositions[0] * 100}%`,
                        }}
                        onMouseDown={(e) => {
                            if (moving !== 0) return;
                            e.preventDefault();
                            setMoving(1);
                        }}
                        onMouseUp={(e) => {
                            e.preventDefault();
                            setMoving(0);
                        }}
                    ></span>
                    <div
                        className={
                            resizeBarPositions[0] > 0.95
                                ? "sub-window sub-window-minimized"
                                : "sub-window"
                        }
                        style={{
                            height: `calc(100% - ${
                                resizeBarPositions[0] * 100
                            }%)`,
                        }}
                    >
                        <header className="window-header">
                            <span className="heading">File Outline</span>
                        </header>
                        <FileOutline
                            documentContent={documentContent}
                            currentLine={currentLine}
                            setJumpToLine={setJumpToLine}
                        />
                    </div>
                </div>
                <span
                    className={
                        moving === 2
                            ? resizeBarPositions[1] < 0.02
                                ? "resize-bar left-minimized active"
                                : "resize-bar active"
                            : resizeBarPositions[1] < 0.02
                            ? "resize-bar left-minimized"
                            : "resize-bar"
                    }
                    onDoubleClick={(e) => {
                        e.preventDefault();
                        let arr = [...resizeBarPositions];
                        arr[1] = arr[1] < 0.02 ? 0.16 : 0;
                        setResizeBarPositions(arr);
                    }}
                    style={{
                        top: 0,
                        left: `${resizeBarPositions[1] * 100}%`,
                    }}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        if (moving !== 0) return;
                        setMoving(2);
                    }}
                    onMouseUp={(e) => {
                        e.preventDefault();
                        setMoving(0);
                    }}
                ></span>
                <div
                    className="window"
                    style={{
                        width: `calc(${resizeBarPositions[2] * 100}% - ${
                            resizeBarPositions[1] * 100
                        }%)`,
                    }}
                >
                    <header className="window-header">
                        <Undo
                            title="Undo"
                            style={{
                                marginLeft: "8px",
                            }}
                            onClick={() => {
                                if (editor) editor.getDoc().undo();
                            }}
                        />
                        <Redo
                            title="Redo"
                            onClick={() => {
                                if (editor) editor.getDoc().redo();
                            }}
                        />
                        <Bold
                            title="Bold"
                            onClick={() => handleInsert("\\textbf{}")}
                        />
                        <Italic
                            title="Italic"
                            onClick={() => handleInsert("\\textit{}")}
                        />
                        <MathIcon
                            title="Math"
                            onClick={() => handleInsert("\\[\\]")}
                        />
                        <Symbol
                            title="Symbol"
                            className={showMathSymbols ? "active" : ""}
                            onClick={() => setShowMathSymbols((prev) => !prev)}
                        />
                        <Link
                            title="Link"
                            onClick={() => handleInsert("\\href{}{}")}
                        />
                        <Ref
                            title="Ref"
                            onClick={() => handleInsert("\\ref{}")}
                        />
                        <Cite
                            title="Cite"
                            onClick={() => handleInsert("\\cite{}")}
                        />
                        <Figure
                            title="Figure"
                            onClick={() =>
                                handleInsert(
                                    "\n\n\\begin{figure}[h]\n\t\\centering\n\t\\includegraphics[width=\\textwidth]{}\n\t\\caption{}\n\t\\label{}\n\\end{figure}\n\n"
                                )
                            }
                        />
                        <Table
                            className={showTableGrid ? "active" : ""}
                            title="Table"
                            onClick={() => setShowTableGrid((prev) => !prev)}
                        />
                        <BulletList
                            title="Bullet List"
                            onClick={() =>
                                handleInsert(
                                    "\n\n\\begin{itemize}\n\t\\item\n\\end{itemize}\n\n"
                                )
                            }
                        />
                        <NumberedList
                            title="Numbered List"
                            onClick={() =>
                                handleInsert(
                                    "\n\n\\begin{enumerate}\n\t\\item\n\\end{enumerate}\n\n"
                                )
                            }
                        />
                    </header>
                    <div className="editor-wrapper">
                        {showTableGrid && (
                            <TableGrid
                                handleInsert={handleInsert}
                                setShowTableGrid={setShowTableGrid}
                            />
                        )}
                        {showMathSymbols && (
                            <MathSymbolSearch
                                setShowMathSymbols={setShowMathSymbols}
                                handleInsert={handleInsert}
                            />
                        )}
                        <Editor
                            messages={messages}
                            setMessages={setMessages}
                            setDocumentContent={setDocumentContent}
                            setCurrentLine={setCurrentLine}
                            jumpToLine={jumpToLine}
                            editor={editor}
                            setEditor={setEditor}
                        />
                    </div>
                </div>
                <span
                    className={
                        moving === 3
                            ? resizeBarPositions[2] > 0.98
                                ? "resize-bar right-minimized active"
                                : "resize-bar active"
                            : resizeBarPositions[2] > 0.98
                            ? "resize-bar right-minimized"
                            : "resize-bar"
                    }
                    onDoubleClick={(e) => {
                        e.preventDefault();
                        let arr = [...resizeBarPositions];
                        arr[2] = arr[2] > 0.92 ? 0.62 : 1;
                        setResizeBarPositions(arr);
                    }}
                    style={{
                        top: 0,
                        left: `${resizeBarPositions[2] * 100}%`,
                    }}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        if (moving !== 0) return;
                        setMoving(3);
                    }}
                    onMouseUp={(e) => {
                        e.preventDefault();
                        setMoving(0);
                    }}
                ></span>
                <div
                    className={
                        resizeBarPositions[2] > 0.98
                            ? "window right-window-minimized"
                            : "window"
                    }
                    style={{
                        width: `calc(100% - ${resizeBarPositions[2] * 100}%)`,
                    }}
                >
                    {(!extra || extra === "pdf") && (
                        <>
                            <header className="window-header">
                                <Recompile
                                    title="Recompile"
                                    style={{
                                        marginLeft: "8px",
                                    }}
                                    className={
                                        loading
                                            ? "compile-icon loading"
                                            : "compile-icon"
                                    }
                                    onClick={handleCompile}
                                />
                                <Logs
                                    className={
                                        showLogs
                                            ? "logs-icon active"
                                            : "logs-icon"
                                    }
                                    title="Logs"
                                    onClick={() => setShowLogs((prev) => !prev)}
                                />
                                <Download
                                    title="Download"
                                    onClick={handleDownload}
                                />
                                <Up title="Previous" />
                                <Down title="Next" />
                                <Add title="Zoom In" />
                                <Minus title="Zoom Out" />
                                <DropDown title="Extra" />
                            </header>
                            <div className="extra-wrapper">
                                <PDFViewer url={pdfUrl} />
                                {showLogs && (
                                    <LogsViewer
                                        errors={errors}
                                        warnings={warnings}
                                        logs={logs}
                                        time={compilationTime}
                                    />
                                )}
                            </div>
                        </>
                    )}
                    {extra === "math2tex" && (
                        <>
                            <header className="window-header">
                                <span className="helper">
                                    <input
                                        id="canvas-check"
                                        name="canvas-check"
                                        type="checkbox"
                                        checked={canDraw}
                                        onChange={() => {
                                            setCanDraw((prev) => !prev);
                                        }}
                                    />
                                    <label htmlFor="canvas-check">Canvas</label>
                                </span>
                                <span className="helper">
                                    <input
                                        id="inline-math"
                                        name="inline-math"
                                        type="checkbox"
                                    />
                                    <label htmlFor="inline-math">
                                        Inline Math
                                    </label>
                                </span>
                                <span className="helper">
                                    <input
                                        id="viewer"
                                        name="viewer"
                                        type="checkbox"
                                        checked={canView}
                                        onChange={() => {
                                            setCanView((prev) => !prev);
                                        }}
                                    />
                                    <label htmlFor="viewer">Viewer</label>
                                </span>
                            </header>
                            <div className="extra-wrapper">
                                <MathToTex
                                    handleInsert={handleInsert}
                                    canDraw={canDraw}
                                    canView={canView}
                                    percentage={resizeBarPositions[2]}
                                />
                            </div>
                        </>
                    )}
                    {extra === "citations-map" && (
                        <>
                            <header className="window-header">
                                <span className="helper">
                                    <input
                                        id="legend"
                                        name="legend"
                                        type="checkbox"
                                        checked={showLegend}
                                        onChange={() =>
                                            setShowLegend((prev) => !prev)
                                        }
                                    />
                                    <label htmlFor="legend">Legend</label>
                                </span>
                                <span className="helper">
                                    <input
                                        id="information"
                                        name="information"
                                        type="checkbox"
                                        checked={showInformation}
                                        onChange={() =>
                                            setShowInformation((prev) => !prev)
                                        }
                                    />
                                    <label htmlFor="information">
                                        Information
                                    </label>
                                </span>
                                <span className="helper">
                                    <input
                                        id="citations"
                                        name="citations"
                                        type="checkbox"
                                        checked={showCitations}
                                        onChange={() =>
                                            setShowCitations((prev) => !prev)
                                        }
                                    />
                                    <label htmlFor="citations">Citations</label>
                                </span>
                            </header>
                            <div className="extra-wrapper">
                                <CitationMesh
                                    percentage={resizeBarPositions[2]}
                                    showLegend={showLegend}
                                    url={SERVER_URL}
                                    documentId={documentId}
                                    showInformation={showInformation}
                                    showCitations={showCitations}
                                />
                            </div>
                        </>
                    )}
                    {extra === "table-generator" && (
                        <>
                            <header className="window-header"></header>
                            <div className="extra-wrapper">
                                <ExcelToLatex />
                            </div>
                        </>
                    )}
                    {extra === "share" && (
                        <>
                            <header className="window-header"></header>
                            <div className="extra-wrapper">
                                <Share
                                    SERVER_URL={SERVER_URL}
                                    documentId={documentId}
                                    userId={userId}
                                />
                            </div>
                        </>
                    )}
                    {extra === "chat" && (
                        <>
                            <header className="window-header">
                                <span className="helper">
                                    <input
                                        id="names"
                                        name="names"
                                        type="checkbox"
                                        checked={showNames}
                                        onChange={() =>
                                            setShowNames((prev) => !prev)
                                        }
                                    />
                                    <label htmlFor="names">Names</label>
                                </span>
                                <span className="helper">
                                    <input
                                        id="profiles"
                                        name="profiles"
                                        type="checkbox"
                                    />
                                    <label htmlFor="profiles">Profiles</label>
                                </span>
                            </header>
                            <div className="extra-wrapper">
                                <Chat
                                    showNames={showNames}
                                    documentId={documentId}
                                    messages={messages}
                                    setMessages={setMessages}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IDE;
