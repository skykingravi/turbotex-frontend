import React from "react";

const PDFViewer = ({ url }) => {
    return (
        <div className="pdf">
            {url ? (
                <object
                    data={url}
                    type="application/pdf"
                    width="100%"
                    height="100%"
                >
                    <p>No PDF Found</p>
                </object>
            ) : (
                <p>No PDF Found</p>
            )}
        </div>
    );
};

export default PDFViewer;
