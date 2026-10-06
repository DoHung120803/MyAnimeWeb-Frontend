import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

const TIKTOK_AUDIO_PREFERENCE_KEY = "anitube-tiktok-audio-enabled";

const getTikTokAudioPreference = () => {
    try {
        return window.localStorage.getItem(TIKTOK_AUDIO_PREFERENCE_KEY) === "true";
    } catch (error) {
        return false;
    }
};

const setTikTokAudioPreference = (enabled) => {
    try {
        window.localStorage.setItem(TIKTOK_AUDIO_PREFERENCE_KEY, String(enabled));
    } catch (error) {
        // Ignore storage failures; the player still works for the current video.
    }
};

// Load TikTok embed script once
const loadTikTokScript = () => {
    return new Promise((resolve) => {
        if (window.tiktokEmbedLoaded) {
            resolve();
            return;
        }
        if (document.getElementById("tiktok-embed-script")) {
            resolve();
            return;
        }
        const script = document.createElement("script");
        script.id = "tiktok-embed-script";
        script.src = "https://www.tiktok.com/embed.js";
        script.async = true;
        script.onload = () => {
            window.tiktokEmbedLoaded = true;
            resolve();
        };
        document.body.appendChild(script);
    });
};

function VideoEmbed({ video, isDetail = false, isActive = false }) {
    const { id, videoId, provider = "TIKTOK", videoUrl } = video || {};
    const containerRef = useRef(null);
    const iframeRef = useRef(null);
    const [loaded, setLoaded] = useState(false);
    const audioEnabledRef = useRef(getTikTokAudioPreference());

    const actualId = videoId || id;
    const normProvider = (provider || "TIKTOK").toUpperCase();

    useEffect(() => {
        if (normProvider === "TIKTOK") {
            const sendCommand = (type) => {
                if (iframeRef.current && iframeRef.current.contentWindow) {
                    iframeRef.current.contentWindow.postMessage(
                        {
                            "x-tiktok-player": true,
                            type,
                        },
                        "*"
                    );
                }
            };

            const handleMessage = (event) => {
                const data = event.data;
                if (!data || !data["x-tiktok-player"] || event.source !== iframeRef.current?.contentWindow) {
                    return;
                }

                if (data.type === "onMute") {
                    audioEnabledRef.current = data.value !== true;
                    setTikTokAudioPreference(audioEnabledRef.current);
                } else if (data.type === "onVolumeChange" && typeof data.value === "number") {
                    audioEnabledRef.current = data.value > 0;
                    setTikTokAudioPreference(audioEnabledRef.current);
                } else if (data.type === "onPlayerReady" || data.type === "ready") {
                    sendCommand("play");
                    if (audioEnabledRef.current) {
                        sendCommand("unMute");
                    }
                }
            };

            window.addEventListener("message", handleMessage);
            return () => window.removeEventListener("message", handleMessage);
        }
    }, [normProvider]);

    // const handleIframeLoad = () => {
    //     if (normProvider === "TIKTOK") {
    //         const sendPlay = () => {
    //             if (iframeRef.current && iframeRef.current.contentWindow) {
    //                 iframeRef.current.contentWindow.postMessage(
    //                     {
    //                         "x-tiktok-player": true,
    //                         type: "play",
    //                     },
    //                     "*"
    //                 );
    //             }
    //         };
    //         sendPlay();
    //         const playTimeouts = [300, 800, 1500].map((delay) => setTimeout(sendPlay, delay));
    //         if (audioEnabledRef.current) {
    //             const sendUnMute = () => {
    //                 if (iframeRef.current && iframeRef.current.contentWindow) {
    //                     iframeRef.current.contentWindow.postMessage(
    //                         {
    //                             "x-tiktok-player": true,
    //                             type: "unMute",
    //                         },
    //                         "*"
    //                     );
    //                 }
    //             };
    //             sendUnMute();
    //             playTimeouts.push(setTimeout(sendUnMute, 300), setTimeout(sendUnMute, 800));
    //         }
    //     }
    // };

    // Render YouTube Short / Video embed
    if (normProvider === "YOUTUBE") {
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#000",
                    position: "relative",
                    borderRadius: isDetail ? 12 : 8,
                    overflow: "hidden",
                }}
            >
                <iframe
                    src={`https://www.youtube.com/embed/${actualId}?autoplay=${isActive ? 1 : 0}&loop=1&playlist=${actualId}&modestbranding=1&rel=0`}
                    title={`youtube-${actualId}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                    }}
                />
            </div>
        );
    }

    // Render Facebook Reel embed
    if (normProvider === "FACEBOOK") {
        const encodedUrl = encodeURIComponent(videoUrl || `https://www.facebook.com/reel/${actualId}`);
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#000",
                    borderRadius: isDetail ? 12 : 8,
                    overflow: "hidden",
                }}
            >
                <iframe
                    src={`https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=0&width=350`}
                    width="100%"
                    height="100%"
                    style={{ border: "none", overflow: "hidden" }}
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen={true}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    title={`fb-${actualId}`}
                />
            </div>
        );
    }

    // Render User uploaded video (direct mp4/webm)
    if (normProvider === "CUSTOM" || normProvider === "USER") {
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#000",
                    borderRadius: isDetail ? 12 : 8,
                    overflow: "hidden",
                }}
            >
                <video
                    src={videoUrl || actualId}
                    controls
                    autoPlay={isActive}
                    loop
                    playsInline
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                    }}
                />
            </div>
        );
    }

    // Default TikTok Embed
    // We use TikTok standard iframe embed for responsive video player
    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#000",
                borderRadius: isDetail ? 12 : 8,
                overflow: "hidden",
                position: "relative",
            }}
        >
            <iframe
                ref={iframeRef}
                // onLoad={handleIframeLoad}
                src={`https://www.tiktok.com/player/v1/${actualId}?autoplay=1&lang=vi-VN`}
                title={`tiktok-${actualId}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                scrolling="no"
                loading="eager"
                fetchPriority="high"
                style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    borderRadius: isDetail ? 12 : 8,
                }}
            />
        </div>
    );
}

VideoEmbed.propTypes = {
    video: PropTypes.object.isRequired,
    isDetail: PropTypes.bool,
    isActive: PropTypes.bool,
};

export default VideoEmbed;
