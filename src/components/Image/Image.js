import PropTypes from "prop-types";
import { forwardRef, useState } from "react";
import images from "~/assets/images";
import classNames from "classnames";
import styles from "./Image.module.scss";

const Image = forwardRef(
    (
        {
            className,
            src,
            alt,
            fallback: customFallback = images.noImage,
            ...props
        },
        ref
    ) => {
        const [fallback, setFallback] = useState("");

        const handleError = () => {
            setFallback(customFallback);
        };
        return (
            <img
                className={classNames(styles.wrapper, className)}
                src={fallback || src}
                alt={alt}
                ref={ref}
                {...props}
                onError={handleError}
            />
        );
    }
);

Image.propTypes = {
    className: PropTypes.string,
    src: PropTypes.string,
    alt: PropTypes.string,
    fallback: PropTypes.string,
};

export default Image;
