import classNames from "classnames/bind";
import { useState } from "react";
import styles from "./FormSubmit.module.scss";
import httpRequest from "~/utils/httpRequest";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const cx = classNames.bind(styles);

function FormSubmit({ title, path, putMethod = "", anime = {} }) {
    const [name, setName] = useState(anime.name);
    const [iframe, setIframe] = useState(anime.iframe);
    const [thumbnailUrl, setThumbnailUrl] = useState(anime.thumbnailUrl);
    const [description, setDescription] = useState(anime.description);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = {
            name,
            description,
            iframe,
            thumbnailUrl
        };

        try {
            if (putMethod === "put") {
                await httpRequest.put(path, formData);
                toast.success("Cập nhật thành công!");
            } else {
                await httpRequest.post(path, formData);
                toast.success("Thêm mới thành công!");
            }
            // Optional: navigate back or clear form
            // navigate('/'); 
        } catch (error) {
            console.error(error);
            toast.error("Đã có lỗi xảy ra!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className={cx("title")}>{title}</h2>
            <form onSubmit={handleSubmit}>
                <label className={cx("label")} htmlFor="name">
                    Name
                </label>
                <input
                    className={cx("input")}
                    id="name"
                    name="name"
                    placeholder="Name..."
                    value={name || ""}
                    onChange={(e) => {
                        setName(e.target.value);
                    }}
                />
                <label className={cx("label")} htmlFor="description">
                    Description
                </label>
                <input
                    className={cx("input")}
                    id="description"
                    name="description"
                    placeholder="Description"
                    value={description || ""}
                    onChange={(e) => {
                        setDescription(e.target.value);
                    }}
                />
                <label className={cx("label")} htmlFor="iframe">
                    Iframe
                </label>
                <input
                    className={cx("input")}
                    id="iframe"
                    name="iframe"
                    placeholder="Iframe..."
                    value={iframe || ""}
                    onChange={(e) => {
                        setIframe(e.target.value);
                    }}
                />
                <label className={cx("label")} htmlFor="thumbnail">
                    Thumbnail
                </label>
                <input
                    className={cx("input")}
                    id="thumbnail"
                    name="thumbnailUrl"
                    placeholder="Thumbnail..."
                    value={thumbnailUrl || ""}
                    onChange={(e) => {
                        setThumbnailUrl(e.target.value);
                    }}
                />
                <button
                    className={cx("submit-btn")}
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Processing..." : "Submit"}
                </button>
            </form>
        </div>
    );
}

export default FormSubmit;
