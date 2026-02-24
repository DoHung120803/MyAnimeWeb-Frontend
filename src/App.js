import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { publicRoutes } from "~/routes";
import DefaultLayout from "~/layouts";
import { Fragment } from "react";
import Modal from "./components/Modal";
import { ChatProvider } from "~/contexts/ChatContext";
import { AuthProvider } from "~/contexts/AuthContext";
import ProtectedRoute from "~/components/ProtectedRoute";
import AdminRoute from "~/components/AdminRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
    return (
        <Router>
            <AuthProvider>
                <ChatProvider>
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
                </ChatProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
