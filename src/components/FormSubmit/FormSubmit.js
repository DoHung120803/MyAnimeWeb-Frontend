import classNames from "classnames/bind";
import { useState } from "react";
import styles from "./FormSubmit.module.scss";

const cx = classNames.bind(styles);

function FormSubmit({ title, path, putMethod = "", anime = {} }) {
    const [name, setName] = useState(anime.name);
    const [iframe, setIframe] = useState(anime.iframe);
    const [thumbnailUrl, setThumbnailUrl] = useState(anime.thumbnailUrl);
    const [description, setDescription] = useState(anime.description);

    return (
        <div>
            <h2 className={cx("title")}>{title}</h2>
            <form action={path} method="POST">
                {putMethod && (
                    <input type="hidden" name="_method" value={putMethod} />
                )}
                <label className={cx("label")} for="name">
                    Name
                </label>
                <input
                    className={cx("input")}
                    id="name"
                    name="name"
                    placeholder="Name..."
                    value={name || anime.name}
                    onChange={(e) => {
                        setName(e.target.value);
                    }}
                />
                <label className={cx("label")} for="description">
                    Description
                </label>
                <input
                    className={cx("input")}
                    id="description"
                    name="description"
                    placeholder="Description"
                    value={description || anime.description}
                    onChange={(e) => {
                        setDescription(e.target.value);
                    }}
                />
                <label className={cx("label")} for="iframe">
                    Iframe
                </label>
                <input
                    className={cx("input")}
                    id="iframe"
                    name="iframe"
                    placeholder="Iframe..."
                    value={iframe || anime.iframe}
                    onChange={(e) => {
                        setIframe(e.target.value);
                    }}
                />
                <label className={cx("label")} for="thumbnail">
                    Thumbnail
                </label>
                <input
                    className={cx("input")}
                    id="thumbnail"
                    name="thumbnailUrl"
                    placeholder="Thumbnail..."
                    value={thumbnailUrl || anime.thumbnailUrl}
                    onChange={(e) => {
                        setThumbnailUrl(e.target.value);
                    }}
                />
                <input
                    className={cx("submit-btn")}
                    type="submit"
                    value="Submit"
                />
            </form>
        </div>
    );
}

export default FormSubmit;
