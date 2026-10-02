import * as httpRequest from "~/utils/httpRequest";
import config from "~/config";

const aniTubeService = {
    /**
     * Lấy danh sách video embedded (TikTok, YouTube, Reels, ...)
     * @param {Object} payload { provider: "TIKTOK" | "YOUTUBE" | "FACEBOOK" | "CUSTOM" }
     * @param {string} context "home" hoặc "detail"
     */
    getEmbeddedVideos: async ({ provider = "TIKTOK", context = "home" } = {}) => {
        try {
            const response = await httpRequest.post(
                config.endpoints.aniTubeEmbedded,
                { provider },
                {
                    params: { context },
                }
            );
            return response;
        } catch (error) {
            console.error("Error fetching embedded videos:", error);
            throw error;
        }
    },
};

export default aniTubeService;
