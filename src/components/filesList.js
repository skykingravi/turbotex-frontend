import React from "react";
import { ReactComponent as FolderOpen } from "../assets/icons/folder-open.svg";
import { ReactComponent as FilesLines } from "../assets/icons/file-lines.svg";

const ListItem = ({ item }) => {
    return (
        <li>
            <p>
                {item.type !== "file" ? <FolderOpen /> : <FilesLines />}{" "}
                {item.name}
            </p>
            {item.type !== "file" && <NestedList items={item.children} />}
        </li>
    );
};

const NestedList = ({ items }) => {
    return (
        items && (
            <ul>
                {items.map((val, indx) => {
                    return <ListItem key={indx} item={val} />;
                })}
            </ul>
        )
    );
};

const FilesList = ({ structure, SERVER_URL, documentId }) => {
    return (
        <div className="files-list-wrapper">
            <NestedList items={structure.children} />
        </div>
    );
};

export default FilesList;
