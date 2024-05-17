import classNames from "classnames/bind";
import styles from "./Upload.module.scss";

const cx = classNames.bind(styles);

function Upload() {
    return (
        <div>
            <form
                action="http://localhost:8080/myanime/upload/store"
                method="POST"
                enctype="application/x-www-form-urlencoded"
            >
                <label className={cx("label")} for="name">
                    Name
                </label>
                <input
                    className={cx("input")}
                    id="name"
                    name="name"
                    placeholder="Name..."
                />
                <label className={cx("label")} for="description">
                    Description
                </label>
                <input
                    className={cx("input")}
                    id="description"
                    name="description"
                    placeholder="Description"
                />
                <label className={cx("label")} for="iframe">
                    Iframe
                </label>
                <input
                    className={cx("input")}
                    id="iframe"
                    name="iframe"
                    placeholder="Iframe..."
                />
                <label className={cx("label")} for="thumbnail">
                    Thumbnail
                </label>
                <input
                    className={cx("input")}
                    id="thumbnail"
                    name="thumbnailUrl"
                    placeholder="Thumbnail..."
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

export default Upload;
