const { override, useBabelRc, addWebpackAlias } = require("customize-cra");
const path = require("path");

const optimizeChunks = () => (config) => {
    if (config.mode === "production") {
        // Optimize chunk splitting for better caching and smaller initial bundles
        config.optimization = {
            ...config.optimization,
            splitChunks: {
                chunks: "all",
                maxInitialRequests: 25,
                minSize: 20000,
                maxSize: 244000,
                cacheGroups: {
                    // React core - rarely changes, cache aggressively
                    react: {
                        test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
                        name: "react-vendor",
                        chunks: "all",
                        priority: 40,
                    },
                    // Swiper - large library, separate chunk
                    swiper: {
                        test: /[\\/]node_modules[\\/](swiper)[\\/]/,
                        name: "swiper",
                        chunks: "all",
                        priority: 35,
                    },
                    // FontAwesome - icons library
                    fontawesome: {
                        test: /[\\/]node_modules[\\/](@fortawesome)[\\/]/,
                        name: "fontawesome",
                        chunks: "all",
                        priority: 30,
                    },
                    // Chat/WebSocket libraries
                    websocket: {
                        test: /[\\/]node_modules[\\/](@stomp|sockjs-client)[\\/]/,
                        name: "websocket",
                        chunks: "all",
                        priority: 25,
                    },
                    // Other vendor libraries
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        name: "vendors",
                        chunks: "all",
                        priority: 10,
                        reuseExistingChunk: true,
                    },
                },
            },
            // Keep runtime chunk separate for better caching
            runtimeChunk: "single",
        };
    }
    return config;
};

module.exports = override(
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useBabelRc(),
    addWebpackAlias({
        "~": path.resolve(__dirname, "src"),
    }),
    optimizeChunks()
);
