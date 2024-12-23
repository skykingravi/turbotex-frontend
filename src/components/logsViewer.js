import React from "react";

const LogsViewer = ({ errors, warnings, logs, time }) => {
    return (
        <div id="logs">
            <h4 id="time">Last compilation took {time}ms</h4>
            {errors?.map((error, indx) => {
                return (
                    <div key={indx} className="error-box">
                        <p>{error}</p>
                    </div>
                );
            })}
            {warnings?.map((warning, indx) => {
                return (
                    <div key={indx} className="warning-box">
                        <p>{warning}</p>
                    </div>
                );
            })}
            {logs && (
                <div id="raw-logs">
                    <h4>Raw Logs</h4>
                    <pre>{logs}</pre>
                </div>
            )}
        </div>
    );
};

export default LogsViewer;
