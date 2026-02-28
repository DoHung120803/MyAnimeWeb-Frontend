import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { publicRoutes } from "~/routes";
import DefaultLayout from "~/layouts";
import { Fragment, Suspense, lazy } from "react";
import { ChatProvider } from "~/contexts/ChatContext";
import { AuthProvider } from "~/contexts/AuthContext";
import ProtectedRoute from "~/components/ProtectedRoute";
import AdminRoute from "~/components/AdminRoute";

// Lazy load non-critical components
const ToastContainer = lazy(() =>
    import("react-toastify").then((mod) => ({ default: mod.ToastContainer }))
);

// Deferred CSS import for react-toastify
import("react-toastify/dist/ReactToastify.css");

// Page loading fallback
function PageLoader() {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                background: "#0F0F0F",
            }}
        >
            <div
                style={{
                    width: 48,
                    height: 48,
                    border: "4px solid rgba(255,255,255,0.1)",
                    borderTopColor: "#E50914",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <ChatProvider>
                    <Suspense fallback={<PageLoader />}>
                        <Routes>
                            {publicRoutes.map((route, index) => {
                                const Page = route.component;

                                let Layout = DefaultLayout;

                                if (route.layout) {
                                    Layout = route.layout;
                                } else if (route.layout === null) {
                                    Layout = Fragment;
                                }

                                const element = (
                                    <Layout>
                                        <Page />
                                    </Layout>
                                );

                                // Nếu route cần admin, wrap bằng AdminRoute (đã bao gồm cả check auth)
                                // Nếu chỉ cần auth, wrap bằng ProtectedRoute
                                // Nếu không cần gì, trả về element
                                let wrappedElement = element;

                                if (route.requireAdmin) {
                                    wrappedElement = (
                                        <AdminRoute>
                                            {element}
                                        </AdminRoute>
                                    );
                                } else if (route.requireAuth) {
                                    wrappedElement = (
                                        <ProtectedRoute>
                                            {element}
                                        </ProtectedRoute>
                                    );
                                }

                                return (
                                    <Route
                                        key={index}
                                        path={route.path}
                                        element={wrappedElement}
                                    />
                                );
                            })}
                        </Routes>
                    </Suspense>
                    <Suspense fallback={null}>
                        <ToastContainer
                            position="top-right"
                            autoClose={3000}
                            hideProgressBar={false}
                            newestOnTop={false}
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                            theme="light"
                        />
                    </Suspense>
                </ChatProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
