import { useLocation } from "react-router-dom";
import classNames from "classnames/bind";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faPlay, 
    faHeart, 
    faShare, 
    faStar,
    faEye,
    faClock,
    faThumbsUp,
    faPaperPlane
} from "@fortawesome/free-solid-svg-icons";

import styles from "./AnimePlayer.module.scss";
import * as getTopAnimesService from "~/services/getTopAnimesService";

const cx = classNames.bind(styles);

function AnimePlayer() {
    const { state } = useLocation();
    const { name, description, iframe, rate, views } = state;
    const [isPlaying, setIsPlaying] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [suggestedAnimes, setSuggestedAnimes] = useState([]);
    const [comment, setComment] = useState("");
    
    // Fake comments data
    const [comments, setComments] = useState([
        {
            id: 1,
            user: "Hùng",
            avatar: "https://i.pravatar.cc/150?img=1",
            text: "Anime quá là hay, tôi không thể nào dừng xem lại được 🔥",
            time: "2 hours ago",
            likes: 234
        },
        {
            id: 2,
            user: "Quanh",
            avatar: "https://i.pravatar.cc/150?img=2",
            text: "Tôi rất mong chờ tập tiếp theo! Cốt truyện trong tập này thật điên rồ 😱",
            time: "5 hours ago",
            likes: 156
        },
        {
            id: 3,
            user: "Vanh",
            avatar: "https://i.pravatar.cc/150?img=3",
            text: "Phát triển nhân vật thật tuyệt vời. Anime hay nhất mùa này!",
            time: "1 day ago",
            likes: 89
        },
        {
            id: 4,
            user: "Akira",
            avatar: "https://i.pravatar.cc/150?img=4",
            text: "Nhạc nền trong tập này làm tôi nổi da gà! 🎵",
            time: "1 day ago",
            likes: 67
        }
    ]);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchSuggestedAnimes();
    }, []);

    const fetchSuggestedAnimes = async () => {
        try {
            const response = await getTopAnimesService.get("api/v1/animes/top-animes");
            setSuggestedAnimes(response.slice(0, 10));
        } catch (error) {
            console.error("Error fetching suggested animes:", error);
        }
    };

    const togglePlay = () => setIsPlaying(!isPlaying);
    const toggleFavorite = () => setIsFavorite(!isFavorite);
    
    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (comment.trim()) {
            const newComment = {
                id: comments.length + 1,
                user: "You",
                avatar: "https://i.pravatar.cc/150?img=5",
                text: comment,
                time: "Just now",
                likes: 0
            };
            setComments([newComment, ...comments]);
            setComment("");
        }
    };

    return (
        <div className={cx("page-container")}>
            <div className={cx("main-content")}>
                {/* PRIMARY SECTION - VIDEO + DETAILS */}
                <div className={cx("primary-section")}>
                    {/* Video Player */}
                    <div className={cx("player-wrapper")}>
                        <iframe
                            className={cx("video-player")}
                            src={`https://www.youtube.com/embed/${iframe}`}
                            title={name}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        ></iframe>
                    </div>

                    {/* Video Details */}
                    <div className={cx("video-details")}>
                        <h1 className={cx("title")}>{name}</h1>
                        
                        <div className={cx("stats")}>
                            <div className={cx("stat-item")}>
                                <FontAwesomeIcon icon={faStar} />
                                <span>{rate}/10</span>
                            </div>
                            <span className={cx("separator")}>•</span>
                            <div className={cx("stat-item")}>
                                <FontAwesomeIcon icon={faEye} />
                                <span>{views} views</span>
                            </div>
                        </div>

                        <p className={cx("description")}>{description}</p>

                        <div className={cx("actions")}>
                            <button className={cx("action-btn", "primary")}>
                                <FontAwesomeIcon icon={faPlay} />
                                <span>Xem tiếp</span>
                            </button>
                            <button 
                                className={cx("action-btn", "outline", { favorited: isFavorite })}
                                onClick={toggleFavorite}
                            >
                                <FontAwesomeIcon icon={faHeart} />
                                <span>{isFavorite ? "Đã yêu thích" : "Yêu thích"}</span>
                            </button>
                            <button className={cx("action-btn", "outline")}>
                                <FontAwesomeIcon icon={faShare} />
                                <span>Chia sẻ</span>
                            </button>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className={cx("comments-section")}>
                        <div className={cx("comments-header")}>
                            <h2 className={cx("comments-title")}>
                                {comments.length} Comments
                            </h2>
                        </div>

                        {/* Comment Input */}
                        <form className={cx("comment-input-wrapper")} onSubmit={handleCommentSubmit}>
                            <div className={cx("input-container")}>
                                <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className={cx("comment-input")}
                                />
                                <button 
                                    type="submit" 
                                    className={cx("comment-submit")}
                                    disabled={!comment.trim()}
                                >
                                    <FontAwesomeIcon icon={faPaperPlane} />
                                </button>
                            </div>
                        </form>

                        {/* Comments List */}
                        <div className={cx("comments-list")}>
                            {comments.map((commentItem) => (
                                <div key={commentItem.id} className={cx("comment-item")}>
                                    <div className={cx("comment-avatar")}>
                                        <img src={commentItem.avatar} alt={commentItem.user} />
                                    </div>
                                    <div className={cx("comment-content")}>
                                        <div className={cx("comment-header")}>
                                            <span className={cx("comment-user")}>{commentItem.user}</span>
                                            <span className={cx("comment-time")}>{commentItem.time}</span>
                                        </div>
                                        <p className={cx("comment-text")}>{commentItem.text}</p>
                                        <div className={cx("comment-actions")}>
                                            <button className={cx("like-btn")}>
                                                <FontAwesomeIcon icon={faThumbsUp} />
                                                <span>{commentItem.likes > 0 ? commentItem.likes : ""}</span>
                                            </button>
                                            <button className={cx("reply-btn")}>Reply</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnimePlayer;
