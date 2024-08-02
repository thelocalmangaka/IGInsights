import {PERSONAL_INFO} from "../constants/personal_info.js";
import {DOMAINS} from "../constants/domains.js";
import {Builder} from "selenium-webdriver";
import {login} from "../constants/timeouts.js";
import fs from "fs";
import {PATHS} from "../constants/paths.js";

let driver = await new Builder().forBrowser("chrome").build();

async function main() {
    /* This will prompt a login on your browser.
     * Enter in your credentials, and then the browser shall close.
     * This program will copy the contents of the generated code into files/codes.txt
     */
    const requestUrl = DOMAINS.INSTAGRAM_API
        + `oauth/authorize?scope=user_profile,user_media&response_type=code`
        + `&client_id=${PERSONAL_INFO.CLIENT_ID}`
        + `&redirect_uri=${PERSONAL_INFO.WEBSITE_URL}`;
    await login(driver, requestUrl, PERSONAL_INFO.WEBSITE_URL);

    // Parse code from url
    let code = await driver.getCurrentUrl();
    const prefix = PERSONAL_INFO.WEBSITE_URL + "?code=";
    code = code.slice(prefix.length);
    // Remove last two characters: #_
    code = code.slice(0, -2);

    fs.writeFileSync(PATHS.CODE, code);
    console.log(`Code successfully retrieved: ${code}`)
}

await main();
await driver.quit();