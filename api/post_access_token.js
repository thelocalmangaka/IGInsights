import {PERSONAL_INFO} from "../constants/personal_info.js";
import {DOMAINS} from "../constants/domains.js";

function getRequestUrl() {
    return DOMAINS.INSTAGRAM_API + `oauth/access_token`;
}

function getRequestBody(code) {
    return new URLSearchParams({
        "grant_type": "authorization_code",
        "client_id": PERSONAL_INFO.CLIENT_ID,
        "client_secret": PERSONAL_INFO.CLIENT_SECRET,
        "redirect_uri": PERSONAL_INFO.WEBSITE_URL,
        "code": code
    });
}

/**
 * @property {{access_token:string}} data
 */
export async function postAccessToken(code) {
    const requestUrl = getRequestUrl();
    const requestBody = getRequestBody(code);
    const response = await fetch(requestUrl, {
        method: "POST",
        body: requestBody
    });
    const data = await response.json();
    if (data == null || data.access_token == null) {
        console.log("Access token not found.");
        process.exit(0);
    }
    return data.access_token;
}