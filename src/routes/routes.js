import config from "~/config";

// Layouts
// import { HeaderOnly } from "~/layouts";

// Pages
import Home from "~/pages/Home";
import Following from "~/pages/Following";
import Profile from "~/pages/Profile";
import Upload from "~/pages/Upload";
import Search from "~/pages/Search";
import Live from "~/pages/Live";
import AnimeList from "~/pages/AnimeListPage";
import UpdateAnimePage from "~/pages/UpdateAnimePage/UpdateAnimePage";

// Public routes
const publicRoutes = [
    { path: config.routes.home, component: Home },
    { path: config.routes.following, component: Following },
    { path: config.routes.live, component: Live },
    { path: config.routes.profile, component: Profile },
    { path: config.routes.upload, component: Upload },
    { path: config.routes.search, component: Search, layout: null },
    { path: config.routes.animes, component: AnimeList },
    { path: config.routes.update, component: UpdateAnimePage },
];

const privateRoutes = [];

export { publicRoutes, privateRoutes };
