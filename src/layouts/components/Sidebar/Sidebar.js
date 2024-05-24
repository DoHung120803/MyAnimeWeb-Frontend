import classNames from "classnames/bind";
import styles from "./Sidebar.module.scss";
import config from "~/config";
import Menu, { MenuItem } from "./Menu";
import {
    HomeIcon,
    UserGroupIcon,
    LiveIcon,
    HomeActiveIcon,
    UserGroupActiveIcon,
    LiveActiveIcon,
    AccountIcon,
    AccountActiveIcon,
    NewsIcon,
    NewsActiveIcon,
} from "~/components/Icons";
import SuggestedAnimes from "~/components/SuggestedAnimes";
import Image from "~/components/Image";

const cx = classNames.bind(styles);

function Sidebar() {
    return (
        <aside className={cx("wrapper")}>
            <Menu>
                <MenuItem
                    title="For You"
                    to={config.routes.home}
                    icon={<HomeIcon />}
                    activeIcon={<HomeActiveIcon />}
                />
                <MenuItem
                    title="Account"
                    to={config.routes.profile}
                    icon={<AccountIcon />}
                    activeIcon={<AccountActiveIcon />}
                />
                <MenuItem
                    title="Top Member"
                    to={config.routes.following}
                    icon={<UserGroupIcon />}
                    activeIcon={<UserGroupActiveIcon />}
                />
                <MenuItem
                    title="News"
                    to={config.routes.live}
                    icon={<NewsIcon />}
                    activeIcon={<NewsActiveIcon />}
                />
                <MenuItem
                    title="Live"
                    to={config.routes.live}
                    icon={<LiveIcon />}
                    activeIcon={<LiveActiveIcon />}
                />
            </Menu>

            <div className={cx("intro")}>
                <Image
                    className={cx("intro-img")}
                    src="https://preview.redd.it/ao-no-sumika-and-specialz-made-it-on-the-top-10-best-anime-v0-eu73owmu8itb1.jpg?auto=webp&s=eadd52d4b9a2f54bb50e297dc88c4b8de3d8344b"
                    fallback="https://scontent.fhan17-1.fna.fbcdn.net/v/t1.6435-9/165522424_2918152984976671_8163564996395443930_n.jpg?stp=dst-jpg_p526x296&_nc_cat=103&ccb=1-7&_nc_sid=5f2048&_nc_ohc=kiJ63jVPyAcQ7kNvgEih3Ut&_nc_ht=scontent.fhan17-1.fna&oh=00_AYBJyFpMi2Mg1Qk5ZOyE0WDmMBaX9lVmqOAVjrSpAP8LaA&oe=6673BB9C"
                />
                <h2 className={cx("intro-title")}>Top 10 Highest Views</h2>
            </div>

            <SuggestedAnimes getBy="top-views" />
        </aside>
    );
}

export default Sidebar;
