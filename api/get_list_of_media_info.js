import {DOMAINS} from "../constants/domains.js";

async function get(requestUrl) {
    const response = await fetch(requestUrl, {
        method: "GET"
    });
    const data = await response.json();
    if (data == null || !Array.isArray(data.data)) {
        console.log("Failed to retrieve media info.");
        process.exit(0);
    }
    return data;
}

function getRequestUrl(accessToken) {
    return DOMAINS.INSTAGRAM_GRAPH
        + `me/media?limit=100&fields=id,media_type,permalink,timestamp`
        + `&access_token=${accessToken}`;
}

export async function getListOfMediaInfo(accessToken) {
    const requestUrl = getRequestUrl(accessToken);
    return await get(requestUrl);
}

export async function getNextListOfMediaInfo(requestUrl) {
    return await get(requestUrl);
}