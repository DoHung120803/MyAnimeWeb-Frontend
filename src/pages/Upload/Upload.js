import classNames from "classnames/bind";
import styles from "./Upload.module.scss";

const cx = classNames.bind(styles);

function Upload() {
    return (
        <div>
            <form>
                <label for="email">Email address</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Email address"
                />
                <p>We'll never share your email with anyone else.</p>
                <label for="password">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Password"
                />
                <input type="checkbox" id="check-me-out" name="check-me-out" />
                <label for="check-me-out">Check me out</label>
                <input type="submit" value="Submit" />
            </form>
        </div>
    );
}

export default Upload;
