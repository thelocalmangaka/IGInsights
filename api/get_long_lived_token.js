import {PERSONAL_INFO} from "../constants/personal_info.js";
import {DOMAINS} from "../constants/domains.js";

function getRequestUrl(accessToken) {
    return DOMAINS.INSTAGRAM_GRAPH
        + `access_token?grant_type=ig_exchange_token`
        + `&client_secret=${PERSONAL_INFO.CLIENT_SECRET}`
        + `&access_token=${accessToken}`;
}

/**
 * @property {{access_token:string}} data
 */
export async function getLongLivedToken(accessToken) {
    const requestUrl = getRequestUrl(accessToken);
    const response = await fetch(requestUrl, {
        method: "GET"
    });
    const data = await response.json();
    if (data == null || data.access_token == null) {
        console.log("Failed to create long-lived token.");
        process.exit(0);
    }
    return data.access_token;
}