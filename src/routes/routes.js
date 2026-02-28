import { lazy } from "react";
import config from "~/config";

// Layouts - keep static since they're needed immediately
import { NoSidebarLayout } from "~/layouts";

// Pages - lazy loaded for code splitting
const Home = lazy(() => import("~/pages/Home"));
const Following = lazy(() => import("~/pages/Following"));
const Profile = lazy(() => import("~/pages/Profile"));
const Upload = lazy(() => import("~/pages/Upload"));
const Search = lazy(() => import("~/pages/Search"));
const Live = lazy(() => import("~/pages/Live"));
const AnimeList = lazy(() => import("~/pages/AnimeStore"));
const Update = lazy(() => import("~/pages/Update/Update"));
const AnimePlayer = lazy(() => import("~/pages/AnimePlayer"));
const Login = lazy(() => import("~/pages/Login"));
const Register = lazy(() => import("~/pages/Register"));

// Public routes - Ai cũng có thể truy cập
// requireAuth: true → cần đăng nhập, nếu chưa sẽ hiện modal login
// requireAdmin: true → cần quyền admin, nếu không có sẽ hiện "Không có quyền truy cập"
const publicRoutes = [
    { path: config.routes.home, component: Home },
    { path: config.routes.search, component: Search, layout: null },
    { path: config.routes.anime, component: AnimePlayer },
    { path: config.routes.animes, component: AnimeList },
    { path: config.routes.login, component: Login, layout: null },
    { path: config.routes.register, component: Register, layout: null },

    // Routes cần đăng nhập
    { path: config.routes.following, component: Following, requireAuth: true },
    { path: config.routes.live, component: Live, requireAuth: true },
    { path: config.routes.profile, component: Profile, layout: NoSidebarLayout, requireAuth: true },
    
    // Routes cần quyền admin
    { path: config.routes.upload, component: Upload, requireAuth: true, requireAdmin: true },
    { path: config.routes.update, component: Update, requireAuth: true, requireAdmin: true },
];

const privateRoutes = [];

export { publicRoutes, privateRoutes };
