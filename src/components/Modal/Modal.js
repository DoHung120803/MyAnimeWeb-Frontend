import React from "react";

function Modal() {
    return (
        <div>
            {/* Button trigger modal */}
            <button
                type="button"
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#myModal"
            >
                Open Modal
            </button>

            {/* Modal */}
            <div
                className="modal fade"
                id="myModal"
                tabIndex="-1"
                aria-labelledby="myModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="myModalLabel">
                                Modal Title
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            This is the modal content.
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                            >
                                Close
                            </button>
                            <button type="button" className="btn btn-primary">
                                Save changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Modal;
