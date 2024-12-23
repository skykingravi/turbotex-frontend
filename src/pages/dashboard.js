import React, { useCallback, useEffect, useState } from "react";
import { useGetURL } from "../hooks/useGetUrl";
import { useNavigate } from "react-router-dom";
import { useGetUserId } from "../hooks/useGetUserId";
import axios from "axios";
import { ReactComponent as Search } from "../assets/icons/search.svg";
import { ReactComponent as Sort } from "../assets/icons/sort.svg";
import { ReactComponent as Add } from "../assets/icons/add.svg";
import { ReactComponent as Download } from "../assets/icons/download.svg";
import { ReactComponent as PDF } from "../assets/icons/pdf.svg";
import { ReactComponent as Delete } from "../assets/icons/delete.svg";
import { ReactComponent as Cancel } from "../assets/icons/close.svg";
import Button from "../components/button";

const Dashboard = () => {
    const [documents, setDocuments] = useState([]);
    const [dname, setDname] = useState("");
    const [description, setDescription] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [searchFilter, setSearchFilter] = useState("");
    const userId = useGetUserId();
    const [, SERVER_URL] = useGetURL();
    const navigate = useNavigate();

    const fetchDocuments = useCallback(async () => {
        try {
            const response = await axios.get(
                `${SERVER_URL}/documents/${userId}`
            );
            setDocuments(response.data || []);
        } catch (error) {
            console.error(error);
        }
    }, [userId, SERVER_URL]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleClick = (id) => {
        navigate(`/document/${id}`);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (dname === "") return;
        try {
            const response = await axios.post(`${SERVER_URL}/documents/`, {
                id: userId,
                dname: dname,
                description: description,
            });

            fetchDocuments();
            setDname("");
            setDescription("");
            alert(response.data.message);
        } catch (error) {
            console.error(error);
        } finally {
            setShowForm(false);
        }
    };

    const handleDelete = async (documentId) => {
        try {
            const response = await axios.delete(
                `${SERVER_URL}/documents/${documentId}`
            );
            fetchDocuments();
            alert(response.data.message);
        } catch (error) {
            console.error(error);
        }
    };

    const handlePdfDownload = async (id) => {
        let pdfUrl = null;

        try {
            const res = await axios.get(
                `${SERVER_URL}/output?documentId=${id}&userId=${userId}&type=pdf`,
                {
                    responseType: "blob",
                }
            );
            const pdfBlobUrl = URL.createObjectURL(res.data);
            pdfUrl = pdfBlobUrl;
        } catch (err) {
            console.error(err);
        }

        if (pdfUrl) {
            const link = document.createElement("a");
            link.href = pdfUrl;
            link.download = `${id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleZipDownload = async (documentId) => {
        try {
            const response = await axios.get(
                `${SERVER_URL}/documents/download-zip/${documentId}/${userId}`,
                {
                    responseType: "blob", // Important to handle binary data
                }
            );

            // Create a URL for the downloaded file
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${documentId}.zip`); // Specify file name
            document.body.appendChild(link);
            link.click();

            // Clean up
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading file:", error);
        }
    };

    return (
        <section className="page" id="dashboard">
            <div className="filters">
                <div className="search-wrapper">
                    <Search />
                    <input
                        type="text"
                        placeholder="Search in projects..."
                        spellCheck={false}
                        onChange={(e) =>
                            setSearchFilter(
                                (e.target.value || "").toLowerCase()
                            )
                        }
                    />
                </div>
                <div className="btns">
                    <Button name="Sort By" Icon={Sort} fontSize="16px" />
                    <Button
                        name="Add Project"
                        Icon={Add}
                        fontSize="16px"
                        handleButtonClick={() => setShowForm((prev) => !prev)}
                    />
                </div>
            </div>

            {document === undefined ||
            documents.filter((val) =>
                val.documentName.toLowerCase().includes(searchFilter)
            ).length === 0 ? (
                <div>
                    <h2>Empty</h2>
                </div>
            ) : (
                <table id="table">
                    <thead>
                        <tr>
                            <th>
                                <input type="checkbox" />
                            </th>
                            <th>Title</th>
                            <th>Owner</th>
                            <th>Created</th>
                            <th>Modified</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents
                            .filter((val) =>
                                val.documentName
                                    .toLowerCase()
                                    .includes(searchFilter)
                            )
                            .map((val) => {
                                return (
                                    <tr
                                        key={val._id}
                                        onClick={() => handleClick(val._id)}
                                    >
                                        <td>
                                            <input
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                                type="checkbox"
                                            />
                                        </td>
                                        <td>{val.documentName}</td>
                                        <td>
                                            {val.documentOwnerId === userId
                                                ? "You"
                                                : val.documentOwnerName}
                                        </td>
                                        <td>{val.documentCreationDetails}</td>
                                        <td>{val.documentLastUpdate}</td>
                                        <td>
                                            <div className="action-btns">
                                                <Button
                                                    onlyIcon={true}
                                                    Icon={Download}
                                                    fontSize="12px"
                                                    name="Download"
                                                    handleButtonClick={(e) => {
                                                        e.stopPropagation();
                                                        handleZipDownload(
                                                            val._id
                                                        );
                                                    }}
                                                />
                                                <Button
                                                    onlyIcon={true}
                                                    Icon={PDF}
                                                    fontSize="12px"
                                                    name="PDF"
                                                    handleButtonClick={async (
                                                        e
                                                    ) => {
                                                        e.stopPropagation();
                                                        await handlePdfDownload(
                                                            val._id
                                                        );
                                                    }}
                                                />
                                                <Button
                                                    onlyIcon={true}
                                                    Icon={Delete}
                                                    fontSize="12px"
                                                    name="Delete"
                                                    handleButtonClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(val._id);
                                                    }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            )}

            {showForm && (
                <form onSubmit={handleAdd} className="add-document-wrapper">
                    <div>
                        <label htmlFor="dname">-Title-</label>
                        <input
                            id="dname"
                            name="dname"
                            type="text"
                            placeholder="Type the title here..."
                            maxLength="50"
                            value={dname}
                            required
                            onChange={(e) => setDname(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="description">-Description-</label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="Type a description here..."
                            rows="5"
                            value={description}
                            required
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>
                    <div className="btns">
                        <Button
                            Icon={Cancel}
                            fontSize="16px"
                            name="Cancel"
                            handleButtonClick={() => setShowForm(false)}
                        />
                        <Button
                            Icon={Add}
                            fontSize="16px"
                            name="Add"
                            type="submit"
                        />
                    </div>
                </form>
            )}
        </section>
    );
};

export default Dashboard;
