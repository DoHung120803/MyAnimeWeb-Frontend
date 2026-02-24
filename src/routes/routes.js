import config from "~/config";

// Layouts
import { NoSidebarLayout } from "~/layouts";

// Pages
import Home from "~/pages/Home";
import Following from "~/pages/Following";
import Profile from "~/pages/Profile";
import Upload from "~/pages/Upload";
import Search from "~/pages/Search";
import Live from "~/pages/Live";
import AnimeList from "~/pages/AnimeStore";
import Update from "~/pages/Update/Update";
import AnimePlayer from "~/pages/AnimePlayer";
import Login from "~/pages/Login";
import Register from "~/pages/Register";

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
