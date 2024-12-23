import React, { useEffect, useState } from "react";
import { useGetURL } from "../hooks/useGetUrl";
import axios from "axios";

const SubmissionChecks = ({ editor, documentId }) => {
    const [items, setItems] = useState({
        caption: [],
        label: [],
        ref: [],
    });
    const [indx, setIndx] = useState({
        caption: 0,
        label: 0,
        ref: 0,
    });
    const [, SERVER_URL] = useGetURL();

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await axios.post(
                    `${SERVER_URL}/findSubmissionChecks`,
                    {
                        id: documentId,
                    }
                );
                setItems(response.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchItems();
    }, [SERVER_URL, documentId]);

    const handleJump = (direction, type) => {
        if (!editor || items[type] === undefined || items[type].length === 0)
            return;
        let newIndx = indx[type] + direction;
        if (newIndx < 0) newIndx = items[type].length - 1;
        if (newIndx >= items[type].length) newIndx = 0;
        setIndx({ ...indx, type: newIndx });
        editor.setCursor(items[type][newIndx]);
        editor.focus();
    };

    return (
        <div id="submission-checks">
            <div>
                <h4>
                    You have {items.caption.length} figures/tables that do not
                    have any caption.
                </h4>
                <div>
                    <button
                        disabled={!items.caption || items.caption.length === 0}
                        onClick={() => handleJump(-1, "caption")}
                        type="button"
                    >
                        ⬆️
                    </button>
                    <button
                        disabled={!items.caption || items.caption.length === 0}
                        onClick={() => handleJump(1, "caption")}
                        type="button"
                    >
                        ⬇️
                    </button>
                </div>
            </div>
            <div>
                <h4>
                    You have {items.label.length} figures/tables that do not
                    have any label.
                </h4>
                <div>
                    <button
                        disabled={!items.label || items.label.length === 0}
                        onClick={() => handleJump(-1, "label")}
                        type="button"
                    >
                        ⬆️
                    </button>
                    <button
                        disabled={!items.label || items.label.length === 0}
                        onClick={() => handleJump(1, "label")}
                        type="button"
                    >
                        ⬇️
                    </button>
                </div>
            </div>
            <div>
                <h4>
                    You have {items.ref.length} figures/tables that are not
                    referenced in the document.
                </h4>
                <div>
                    <button
                        disabled={!items.ref || items.ref.length === 0}
                        onClick={() => handleJump(-1, "ref")}
                        type="button"
                    >
                        ⬆️
                    </button>
                    <button
                        disabled={!items.ref || items.ref.length === 0}
                        onClick={() => handleJump(1, "ref")}
                        type="button"
                    >
                        ⬇️
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubmissionChecks;
