import * as httpRequest from '~/utils/httpRequest';
import config from '~/config';

/**
 * Service để upload files lên server (Cloudinary)
 */
const uploadService = {
    /**
     * Upload một file lên server
     * @param {File} file - File object
     * @param {string} prefix - Prefix cho đường dẫn file trên Cloudinary (optional)
     * @param {function} onUploadProgress - Callback nhận progress (optional)
     * @returns {Promise<{url: string, size: number, fileName: string, type: number}>}
     */
    uploadFile: async (file, prefix = 'chat', onUploadProgress = null) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('prefix', prefix);

        const response = await httpRequest.post(
            config.endpoints.uploadFile,
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
                ...(onUploadProgress && { onUploadProgress }),
            },
        );
        return response.data; // { url, size, fileName, type }
    },

    /**
     * Upload nhiều files cùng lúc
     * @param {File[]} files - Mảng File objects
     * @param {string} prefix - Prefix cho đường dẫn file
     * @param {function} onProgress - Callback nhận tổng progress (0-100)
     * @returns {Promise<Array<{url: string, size: number, fileName: string, type: number}>>}
     */
    uploadMultipleFiles: async (files, prefix = 'chat', onProgress = null) => {
        let completedCount = 0;

        const uploadPromises = Array.from(files).map((file) =>
            uploadService.uploadFile(file, prefix, (progressEvent) => {
                if (onProgress) {
                    const fileProgress = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total,
                    );
                    if (fileProgress === 100) completedCount++;
                    const totalProgress = Math.round(
                        ((completedCount + (fileProgress < 100 ? fileProgress / 100 : 0)) /
                            files.length) *
                            100,
                    );
                    onProgress(totalProgress);
                }
            }),
        );

        return Promise.all(uploadPromises);
    },
};

export default uploadService;
