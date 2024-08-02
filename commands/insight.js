import {INSIGHTS, INSIGHTS_ELEMENT_ID_PREFIX, INSIGHTS_UNAVAILABLE_TEXT} from "../constants/insights.js";

import fs from "fs";
import { Builder, By, until } from 'selenium-webdriver';
import {PATHS} from "../constants/paths.js";
import {login, LOGIN_TIMEOUT, TIMEOUT} from "../constants/timeouts.js";

const INSIGHT_URL = "https://www.instagram.com/insights/media/";

let driver = await new Builder().forBrowser("chrome").build();

function extractText(elementText) {
    let insightText = {};
    // Some old posts will have no insights available
    // (or will only be viewable on the mobile app, which this program does not support)
    if (elementText.includes(INSIGHTS_UNAVAILABLE_TEXT)) {
        insightText.ERROR = INSIGHTS_UNAVAILABLE_TEXT;
        return insightText;
    }
    const textArray = elementText.split('\n');
    for (let i = 0; i+1 < textArray.length; i++) {
        const text = textArray[i];
        // The value for each insight stat is on the next line within the element text body
        if (Object.values(INSIGHTS).includes(text)) {
            insightText[text] = textArray[i+1];
        }
    }
    return insightText;
}

async function getInsightText(insightUrl) {
    let count = 0;
    const maxTries = 3;
    while (true) {
        try {
            console.log(`Reading contents of ${insightUrl}`);
            await driver.get(insightUrl);

            const elements = await driver.findElements(By.xpath('//*[@id]'));
            let text = "";
            for (const element of elements) {
                const id = await element.getAttribute('id');
                if (id.includes(INSIGHTS_ELEMENT_ID_PREFIX)) {
                    text = await element.getText();
                    break;
                } else if (id === "main-frame-error" && (await element.getText()).includes("HTTP ERROR 429")) {
                    console.log("HTTP 429 Error encountered. Aborting program. Do not try again until error disappears when manually accessing page. (This can take a few days)");
                    console.log("1) You can save the current contents of out/insights.csv to a different location.");
                    console.log("2) Edit files/insights.csv to only contain the insight ID's that have not yet been read. (The order ID's are read in insights.csv is identical to insights.csv)");
                    console.log("3) You can run 'node .' at a later time to continue where you left off.")
                    console.log("Optional: Increasing the TIMEOUT variable inside constants/timeouts.js may also help prevent future errors.")
                    process.exit(1);
                }
            }
            return extractText(text);
        } catch (e) {
            console.error(e);
            if (count++ >= maxTries) {
                console.log(`Insights not found for ${insightUrl}, abandoning.`);
                return null;
            } else {
                console.log(`Insights not found for ${insightUrl}, retrying...`);
            }
        }
    }
}

function parseWatchTime(text) {
    // TO-DO: Does it eventually measure in days or even years?
    // None of my posts offer days, but maybe that's because my account isn't large enough.

    // text is of format: "XX hr YY min ZZ sec"
    let hoursString = "0";
    let minutesString = "0";
    let secondsString = "0";
    let isHour = false;
    let isMinute = false;
    let isSeconds = false;
    // determine the largest unit of time available
    for (let i = 0; i < text.length; i++) {
        const c = text.charAt(i);
        if (c === 'h') {
            isHour = true;
            break;
        } else if (c === 'm') {
            isMinute = true;
            break;
        } else if (c === 's') {
            isSeconds = true;
            break;
        }
    }
    // iterate through string to parse units of time
    for (let i = 0; i < text.length; i++) {
        const c = text.charAt(i);
        if (c >= '0' && c <= '9') {
            if (isHour) {
                hoursString += c;
            } else if (isMinute) {
                minutesString += c;
            } else if (isSeconds) {
                secondsString += c;
            }
        } else if (c === 'h') {
            isHour = false;
            isMinute = true;
        } else if (c === 'm') {
            isMinute = false;
            isSeconds = true;
        }
    }

    // return result in hours
    const hours = parseInt(hoursString);
    const minutes = parseInt(minutesString);
    const seconds = parseInt(secondsString);

    return hours + (minutes / 60.0) + (seconds / 3600.0);
}

function extractNumbers(insightText) {
    const insightNumbers = {};

    for (const KEY of Object.values(INSIGHTS)) {
        // In case of error, simply mark metric as 0 (for adding purposes) and move on.
        if (insightText === null || insightText === undefined
            || insightText[KEY] === null || insightText[KEY] === undefined) {
            insightNumbers[KEY] = 0;
            continue;
        } else if (insightText[KEY] === "--") {
            // For some old posts, metrics are not tracked and marked with --
            insightNumbers[KEY] = 0;
            continue;
        } else if (KEY === INSIGHTS.WATCH_TIME) {
            // Watch time has special handling case due to format: "XX hr YY min ZZ sec"
            insightNumbers[KEY] = parseWatchTime(insightText[KEY]);
            continue;
        }
        // Convert string to number and remove commas
        insightNumbers[KEY] = parseInt(insightText[KEY].replace(/,/g, ''))
    }

    return insightNumbers;
}

function extractErrors(insightText) {
    if (insightText === null || insightText === undefined ) {
        return "ERROR retrieving any information.";
    } else if (insightText.ERROR === INSIGHTS_UNAVAILABLE_TEXT) {
        return "Insights unavailable.";
    }

    let error = "";
    for (const KEY of Object.values(INSIGHTS)) {
        // For some old posts, metrics are not tracked and marked with --
        if (insightText[KEY] === "--") {
            if (error.length > 0) {
                error += `, "${KEY}"`;
            } else {
                error = `Has deprecated field(s): "${KEY}"`;
            }
        }
    }
    return error;
}

async function main() {
    // Add headers to csv file
    fs.writeFileSync(PATHS.OUTPUT, 'ID,' + Object.values(INSIGHTS).join(",") + ',Timestamp,Media Type,ERROR\n');
    // Initialize total stats as 0
    let totalNumbers = {};
    for (const KEY of Object.values(INSIGHTS)) {
        totalNumbers[KEY] = 0;
    }
    // Read insights.csv file into array
    const insights = fs.readFileSync(PATHS.INSIGHTS).toString('utf-8').split('\n');
    const firstUrl = INSIGHT_URL + insights[0].split(',')[2];
    await login(driver, firstUrl, firstUrl);
    // Scrape every insight URL for stats
    for (const insight of insights) {
        // Read row info into array
        const insightInfo = insight.split(',');
        const timestamp = insightInfo[0];
        const mediaType = insightInfo[1];
        const insightID = insightInfo[2];

        const insightUrl = INSIGHT_URL + insightID;
        const insightText = await getInsightText(insightUrl);
        const insightNumbers = extractNumbers(insightText, insightInfo);
        // Insert individual row into csv file
        fs.appendFileSync(PATHS.OUTPUT,
            `${insightID},`
            + Object.values(insightNumbers).join(",")
            + `,${mediaType},${timestamp},`
            + extractErrors(insightText)
            + `\n`);
        // Sum to total
        for (const KEY of Object.values(INSIGHTS)) {
            totalNumbers[KEY] = totalNumbers[KEY] + insightNumbers[KEY];
        }
    }

    // Write totals to csv
    // fs.appendFileSync(PATHS.OUTPUT, 'Totals:,' + Object.values(totalNumbers).join(",") + '\n');
    console.log("Your results were successfully written to out/insights.csv !");
}

await main();
await driver.quit();