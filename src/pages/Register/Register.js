import AuthLayout from "~/layouts/AuthLayout";
import RegisterForm from "~/layouts/AuthLayout/components/RegisterForm/";

function Register() {
    return (
        <AuthLayout>
            <RegisterForm />
        </AuthLayout>
    );
}

export default Register;
