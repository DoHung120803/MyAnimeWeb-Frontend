import FormSubmit from "~/components/FormSubmit/FormSubmit";

function Upload() {
    return (
        <FormSubmit
            title="Upload Anime"
            path={`${process.env.REACT_APP_BASE_URL}/upload/store`}
        />
    );
}

export default Upload;
