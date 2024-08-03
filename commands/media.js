import {getListOfMediaInfo, getNextListOfMediaInfo} from "../api/get_list_of_media_info.js";
import {PATHS} from "../constants/paths.js";

import fs from "fs";

/**
 * @property {{paging:object}} response
 * @property {{permalink:string, media_type:string}} media
 */
async function main() {
    const token = fs.readFileSync(PATHS.TOKEN);

    // Use access token to get list of all media
    let response = await getListOfMediaInfo(token);
    let mediaList = [];
    mediaList.push(...response.data);
    // If there is more media to retrieve, continue making API calls
    while (response.paging !== null
        && response.paging.next !== null
        && response.paging.next !== undefined) {
        response = await getNextListOfMediaInfo(response.paging.next);
        mediaList.push(...response.data);
    }

    // Erase existing content
    fs.writeFileSync(PATHS.MEDIA, '');
    // Add every permalink to file, separated by newlines.
    for (const media of mediaList) {
        fs.appendFileSync(PATHS.MEDIA, media.timestamp + ',');
        fs.appendFileSync(PATHS.MEDIA, media.media_type + ',');
        fs.appendFileSync(PATHS.MEDIA, media.permalink + '\n');
    }
    console.log(`Media info obtained and written to file.`);
}

await main();