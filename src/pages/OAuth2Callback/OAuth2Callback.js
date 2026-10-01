import { useEffect } from "react";

const OAUTH2_MESSAGE_TYPE = "myanime:oauth2-callback";

function OAuth2Callback() {
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const code = params.get("code");
		const error = params.get("error");

		if (window.opener && !window.opener.closed) {
			window.opener.postMessage(
				{
					type: OAUTH2_MESSAGE_TYPE,
					code,
					error,
				},
				window.location.origin
			);
			window.close();
		}
	}, []);

	return <div>Đang hoàn tất đăng nhập...</div>;
}

export default OAuth2Callback;
