import {postAccessToken} from "../api/post_access_token.js";
import {getLongLivedToken} from "../api/get_long_lived_token.js";
import {PATHS} from "../constants/paths.js";

import fs from 'fs';

async function main() {
    const code = fs.readFileSync(PATHS.CODE);
    const accessToken = await postAccessToken(code);
    const longLivedToken = await getLongLivedToken(accessToken);

    fs.writeFileSync(PATHS.TOKEN, longLivedToken);

    console.log(`Token successfully generated: ${longLivedToken}`);
}

await main();