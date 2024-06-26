import LoginForm from "~/layouts/AuthLayout/components/LoginForm";
import AuthLayout from "~/layouts/AuthLayout";

function Login() {
    return (
        <AuthLayout>
            <LoginForm />
        </AuthLayout>
    );
}

export default Login;
