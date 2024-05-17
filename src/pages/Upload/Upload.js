import FormSubmit from "~/components/FormSubmit/FormSubmit";

function Upload() {
    return (
        <FormSubmit
            title="Upload Anime"
            path="http://localhost:8080/upload/store"
        />
    );
}

export default Upload;
