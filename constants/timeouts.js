// You may adjust this value in milliseconds.
import {until} from "selenium-webdriver";

export const TIMEOUT = 5000;

export const LOGIN_TIMEOUT = 60000;

async function setDriverTimeout(driver, timeout) {
    await driver.manage().setTimeouts({
        implicit: timeout,
        pageLoad: timeout,
        script: timeout
    });
}

export async function login(driver, url, redirect_url) {
    // User is given 60 seconds to login to Instagram with username/password
    await setDriverTimeout(driver, LOGIN_TIMEOUT);
    await driver.get(url);
    await new Promise(r => setTimeout(r, TIMEOUT));
    console.log(url);
    await driver.wait(until.urlMatches(new RegExp(redirect_url)));
    // Program is given 5 seconds to find elements
    await setDriverTimeout(driver, TIMEOUT);
}