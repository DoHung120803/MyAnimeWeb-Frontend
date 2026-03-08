const { override, useBabelRc, addWebpackAlias } = require("customize-cra");
const path = require("path");
const CompressionPlugin = require("compression-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const optimizeChunks = () => (config) => {
    if (config.mode === "production") {
        // ─── Disable source maps in production for smaller bundles ───────────────
        config.devtool = false;

        // ─── Terser: aggressive minification ─────────────────────────────────────
        config.optimization.minimizer = [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true,   // remove console.* calls
                        drop_debugger: true,
                        pure_funcs: ["console.log", "console.info", "console.warn"],
                    },
                    mangle: true,
                    format: {
                        comments: false,      // strip all comments
                    },
                },
                extractComments: false,
            }),
        ];

        // ─── Code splitting ───────────────────────────────────────────────────────
        config.optimization = {
            ...config.optimization,
            splitChunks: {
                chunks: "all",
                maxInitialRequests: 30,
                minSize: 20000,
                maxSize: 200000,
                cacheGroups: {
                    // React core — rarely changes → long-lived cache
                    react: {
                        test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
                        name: "vendor-react",
                        chunks: "all",
                        priority: 50,
                        enforce: true,
                    },
                    // Swiper — large library, separated so it can be loaded lazily
                    swiper: {
                        test: /[\\/]node_modules[\\/](swiper)[\\/]/,
                        name: "vendor-swiper",
                        chunks: "all",
                        priority: 40,
                        enforce: true,
                    },
                    // FontAwesome SVG icons — tree-shaken but still sizeable
                    fontawesome: {
                        test: /[\\/]node_modules[\\/](@fortawesome)[\\/]/,
                        name: "vendor-fontawesome",
                        chunks: "all",
                        priority: 35,
                        enforce: true,
                    },
                    // WebSocket / chat — only needed for authenticated users
                    websocket: {
                        test: /[\\/]node_modules[\\/](@stomp|sockjs-client)[\\/]/,
                        name: "vendor-websocket",
                        chunks: "all",
                        priority: 30,
                        enforce: true,
                    },
                    // Axios + other small utilities
                    utils: {
                        test: /[\\/]node_modules[\\/](axios|classnames|clsx|normalize\.css)[\\/]/,
                        name: "vendor-utils",
                        chunks: "all",
                        priority: 20,
                        enforce: true,
                    },
                    // Remaining vendor code
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        name: "vendor-misc",
                        chunks: "all",
                        priority: 10,
                        reuseExistingChunk: true,
                    },
                },
            },
            // Keep runtime separate so vendor hash stays stable across app changes
            runtimeChunk: "single",
        };

        // ─── Gzip compression for all text assets ────────────────────────────────
        config.plugins.push(
            new CompressionPlugin({
                algorithm: "gzip",
                test: /\.(js|css|html|svg|json)$/,
                threshold: 10240,   // only compress files > 10 KB
                minRatio: 0.8,
                filename: "[path][base].gz",
                deleteOriginalAssets: false,
            })
        );
    }
    return config;
};

module.exports = override(
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useBabelRc(),
    addWebpackAlias({
        "~": path.resolve(__dirname, "src"),
        // Deduplicate: resolve clsx → classnames (both are in use; avoid shipping both)
        "clsx": path.resolve(__dirname, "node_modules/classnames"),
    }),
    optimizeChunks()
);
