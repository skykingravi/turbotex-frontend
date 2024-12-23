import React, { useEffect, useRef, useState } from "react";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/ttcn.css";
import "codemirror/mode/stex/stex.js";

import CodeMirror from "codemirror";
import { io } from "socket.io-client";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useGetUserId } from "../hooks/useGetUserId";
import { useGetURL } from "../hooks/useGetUrl";

const addWarningMarker = (line, message, editor, width = "20px") => {
    if (!editor) return;
    const marker = window.document.createElement("div");
    marker.style.width = width;
    marker.className = "warning-dot";
    marker.setAttribute("title", message);
    editor.setGutterMarker(line, "warnings", marker);
};

const addErrorMarker = (line, message, editor, width = "20px") => {
    if (!editor) return;
    const marker = window.document.createElement("div");
    marker.style.width = width;
    marker.className = "error-dot";
    marker.setAttribute("title", message);
    editor.setGutterMarker(line, "errors", marker);
};

const handleLint = async (SERVER_URL, documentId, editor) => {
    if (!editor) return;
    try {
        const res1 = await axios.post(`${SERVER_URL}/parse`, {
            id: documentId,
        });

        const res2 = await axios.post(`${SERVER_URL}/findSubmissionChecks`, {
            id: documentId,
        });

        const obj = res1.data || {};

        const captions = res2?.data.caption || [];
        let mssg = "Warning: Caption is not available.";
        captions.forEach((val) => {
            if (obj[val.line + 1] === undefined)
                obj[val.line + 1] = { type: "warning", messages: [mssg] };
            else obj[val.line + 1].messages.push(mssg);
        });

        const labels = res2?.data.label || [];
        mssg = "Warning: Label is not available.";
        labels.forEach((val) => {
            if (obj[val.line + 1] === undefined)
                obj[val.line + 1] = { type: "warning", messages: [mssg] };
            else obj[val.line + 1].messages.push(mssg);
        });

        const refs = res2?.data.ref || [];
        mssg = "Warning: Not referenced in the document.";
        refs.forEach((val) => {
            if (obj[val.line + 1] === undefined)
                obj[val.line + 1] = { type: "warning", messages: [mssg] };
            else obj[val.line + 1].messages.push(mssg);
        });

        editor.clearGutter("warnings");
        editor.clearGutter("errors");

        const elem = window.document.querySelector(
            "#ide > div > div:nth-child(3) > div > div > div > div.CodeMirror-scroll > div.CodeMirror-sizer > div > div > div > div.CodeMirror-code > div:nth-child(6) > div > div.CodeMirror-linenumber.CodeMirror-gutter-elt"
        );
        let width = "20px";
        if (elem !== null) {
            const computedStyle = window.getComputedStyle(elem);
            width = computedStyle.getPropertyValue("width") || 20;
            width = `calc(8px + ${width})`;
        }

        const vals = Object.entries(obj);
        vals.forEach((v) => {
            const line = parseInt(v[0]) || 1;
            const type = v[1].type || "warning";
            const message = v[1]?.messages?.join("\n") || "";
            if (type === "warning") {
                addWarningMarker(line - 1, message, editor, width);
            } else {
                addErrorMarker(line - 1, message, editor, width);
            }
        });
    } catch (error) {
        console.error("Error in parsing:", error);
    }
};

const Editor = ({
    messages,
    setMessages,
    setDocumentContent,
    setCurrentLine,
    jumpToLine,
    editor,
    setEditor,
}) => {
    const [socket, setSocket] = useState(null);
    const [document, setDocument] = useState(null);
    const { id: documentId } = useParams();
    const userId = useGetUserId();
    const [, SERVER_URL] = useGetURL();
    const navigate = useNavigate();
    const elementRef = useRef(null);

    const MAX_LINES = 20000;

    function debounce(func, delay) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    useEffect(() => {
        const init = async () => {
            try {
                const response = await axios.get(
                    `${SERVER_URL}/chat/${documentId}`
                );
                setMessages(response.data || []);
            } catch (error) {
                console.error(error);
            }
        };

        init();
    }, [documentId, SERVER_URL, setMessages]);

    useEffect(() => {
        const init = async () => {
            try {
                const response = await axios.get(
                    `${SERVER_URL}/documents/${documentId}/${userId}`
                );
                if (response.data) {
                    setDocument(response.data);
                } else {
                    navigate("/dashboard");
                }
            } catch (error) {
                console.error(error);
                navigate("/dashboard");
            }
        };

        init();
    }, [documentId, navigate, userId, SERVER_URL]);

    // initialize CodeMirror editor once after the document is loaded and the textarea element is rendered
    useEffect(() => {
        if (!document || editor || !elementRef.current) return;

        const e = CodeMirror.fromTextArea(elementRef.current, {
            mode: "stex",
            theme: "ttcn",
            autoCloseTags: false,
            autoCloseBrackets: false,
            lineNumbers: true,
            lineWrapping: false,
            gutters: ["CodeMirror-linenumbers", "warnings", "errors"],
        });

        e.setSize("100%", "100%");
        setEditor(e);
    }, [document, editor, setEditor]);

    // initialize socket.io connection
    useEffect(() => {
        const s = io("http://localhost:3002");
        setSocket(s);

        return () => {
            s.disconnect();
        };
    }, []);

    // load and update the document content
    useEffect(() => {
        if (!socket || !editor) return;

        socket.emit("get-document", documentId);
        socket.once("load-document", (code) => {
            if (typeof code === "string" && code.trim() !== "") {
                editor.setValue(code);
                setDocumentContent(code);
            } else {
                editor.setValue("");
            }
            handleLint(SERVER_URL, documentId, editor);
        });
    }, [socket, editor, documentId, setDocumentContent, SERVER_URL]);

    // track the cursor
    useEffect(() => {
        if (!socket || !editor) return;

        const handler = () => {
            setCurrentLine(editor.getCursor().line);
        };

        editor.on("cursorActivity", handler);

        return () => {
            editor.off("cursorActivity", handler);
        };
    }, [socket, editor, documentId, setCurrentLine]);

    // jump to line when requested
    useEffect(() => {
        if (!editor || jumpToLine < 0) return;

        const lineHeight = editor.defaultTextHeight();
        const { clientHeight } = editor.getScrollInfo();
        const scrollTarget = editor.charCoords(
            { line: jumpToLine, ch: 0 },
            "local"
        ).top;

        const centerOffset = scrollTarget - clientHeight / 2 + lineHeight / 2;

        editor.scrollTo(null, centerOffset);
        editor.setCursor(jumpToLine, 0);
        editor.focus();
    }, [editor, jumpToLine]);

    // track the line when scrolling
    useEffect(() => {
        if (!editor) return;

        const handler = () => {
            const scrollInfo = editor.getScrollInfo();
            const visibleTop = scrollInfo.top;
            const visibleBottom = scrollInfo.top + scrollInfo.clientHeight;

            const topLine = editor.lineAtHeight(visibleTop, "local");
            const bottomLine = editor.lineAtHeight(visibleBottom, "local");

            const line = Math.floor(topLine + (bottomLine - topLine) / 2);

            setCurrentLine(Math.max(0, line));
        };

        // Attach scroll listener
        editor.on("scroll", handler);

        // Cleanup listener on unmount or instance change
        return () => {
            editor.off("scroll", handler);
        };
    }, [editor, setCurrentLine]);

    // send changes to the server when code changes
    useEffect(() => {
        if (!socket || !editor) return;

        const handler = (instance, changes) => {
            const { origin } = changes;
            // console.log(origin);

            if (
                origin === "+input" ||
                origin === "+delete" ||
                origin === "redo" ||
                origin === "undo" ||
                origin === "cut" ||
                origin === "paste"
            ) {
                const { from, to, text } = changes;
                const changeData = {
                    from: from,
                    to: to,
                    text: text,
                };

                socket.emit("send-changes", changeData);
            }
        };

        editor.on("change", handler);

        return () => {
            editor.off("change", handler);
        };
    }, [socket, editor]);

    // prevent change if it exceeds the lines limit
    useEffect(() => {
        if (!editor) return;

        const handler = (instance, change) => {
            const totalLines = instance.lineCount();
            const newLines = change.text.length;
            const removedLines = change.to.line - change.from.line;

            // Prevent change if it exceeds the limit
            if (totalLines + newLines - removedLines > MAX_LINES + 1) {
                change.cancel(); // Cancel the change
                alert(`You cannot exceed ${MAX_LINES} lines.`);
            }
        };

        editor.on("beforeChange", handler);

        return () => {
            editor.off("beforeChange", handler);
        };
    }, [editor]);

    // save the document after 1 second of inactivity
    useEffect(() => {
        if (!socket || !editor) return;

        const handler = debounce((instance, change) => {
            const { origin } = change;
            if (
                origin === "+input" ||
                origin === "+delete" ||
                origin === "redo" ||
                origin === "undo" ||
                origin === "cut" ||
                origin === "paste"
            ) {
                socket.emit("save-document");
            }

            setDocumentContent(editor?.getValue() || "");
        }, 1000);

        editor.on("change", handler);

        return () => {
            editor.off("change", handler);
        };
    }, [socket, editor, setDocumentContent]);

    // parse the document after 1 second of inactivity
    useEffect(() => {
        if (!socket || !editor) return;

        const handler = debounce((instance, change) => {
            const { origin } = change;

            if (
                origin === "+input" ||
                origin === "+delete" ||
                origin === "redo" ||
                origin === "undo" ||
                origin === "cut" ||
                origin === "paste"
            ) {
                handleLint(SERVER_URL, documentId, editor);
            }
        }, 1000);

        editor.on("change", handler);

        return () => {
            editor.off("change", handler);
        };
    }, [socket, editor, SERVER_URL, documentId]);

    // Update the editor when changes are received from the server
    useEffect(() => {
        if (!socket || !editor) return;

        const handler = (changeData) => {
            editor.replaceRange(
                changeData.text,
                changeData.from,
                changeData.to
            );
        };

        socket.on("receive-changes", handler);

        return () => {
            socket.off("receive-changes", handler);
        };
    }, [socket, editor]);

    useEffect(() => {
        if (!socket || !editor) return;

        const handler = (m) => {
            setMessages((prev) => {
                const arr = [...prev, m];
                return arr;
            });
        };

        socket.on("receive-message", handler);

        return () => {
            socket.off("receive-message", handler);
        };
    }, [socket, editor, setMessages]);

    useEffect(() => {
        if (!socket || !editor) return;
        if (
            messages.length > 0 &&
            messages[messages.length - 1]._id === undefined
        ) {
            socket.emit("send-message", messages[messages.length - 1]);
        }
    }, [socket, editor, messages]);

    return (
        <>
            <div className="editor">
                <textarea ref={elementRef}></textarea>
            </div>
        </>
    );
};

export default Editor;
