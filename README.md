# Overview
This project aims to help Instagram users with public profiles and without businesses view aggregate insights on their posts and reels.

The current analytics tool provided by Instagram only allows users to view aggregate stats for up to the past 90 days, and does not include an option to see lifetime totals. It also does not include aggregate statistics for some metrics such as total watch-time.

Additionally, the [current APIs available](https://developers.facebook.com/docs/instagram-api) to view insights via Instagram APIs only grant permissions to users who can complete the Business Verification step, and thus will not work for users who do not own a business.

**The current list of supported statistics are:**

1. Likes
2. Comments
3. Saves
4. Shares
5. Profile activity
6. Profile visits
7. External link taps
8. Follows

(Exclusive to reels):

9. Plays
10. Initial plays
11. Replays
12. Watch time
13. Reels interactions

(Exclusive to posts):

14. Post interactions
15. Impressions
16. Impressions from home
17. Impressions from profile
18. Impressions from other

# IMPORTANT ADVISORY
**WARNING: This program uses Selenium, which is intended for automated testing, and Instagram advises against using bots to scrape their website. Using this tool may result in HTTP 429 errors ("Too Many Requests" errors), which may result in a temporary block in access from viewing your insights, and Instagram issuing a warning to your account.**

**Use at your own risk, and I will not be held responsible for potential actions taken against your account.**

I attempt to bypass this issue by setting a timer of 5 seconds between every URL visit to view insights for each post. This amount can be adjusted in constants/timeouts.js in the TIMEOUT variable.

```
// You may adjust this value in milliseconds.
export const TIMEOUT = 5000;
```

5 seconds was enough to read every insight without issue for my account (@thelocalmangaka). But I can not make any guarantees for larger accounts with higher number of posts (my account had 129 posts at the time of testing).

**Additional Warning: Scraping/Text-based analysis is not nearly as future-proof as grabbing data directly from APIs, as Instagram changing any wording or formatting of their insights pages will compromise the functionality of this program. It also limits the use of this program to only the English language.**

Ideally, I would have liked to avoid using Selenium and relied solely on APIs, but due to the issues mentioned above, this was the only solution I could find for now.

# Setup
### Create an Instagram Basic Display Application
Follow the steps listed here to create an application with which you can access Instagram's Basic Display APIs: https://developers.facebook.com/docs/instagram-basic-display-api/getting-started

### Modify fields inside constants/personal_info.js
```
export const PERSONAL_INFO = {
    CLIENT_ID: "${your_client_id_here}",
    CLIENT_SECRET: "${your_client_secret_here}",
    WEBSITE_URL: "${your_website_url_here}"
}
```

Modify the fields in this file based on your application information created in the above step.

### Install nvm
If you are new to programming and don't have nvm installed yet, go to your terminal and type in the following commands to install nvm:
```
# installs nvm (Node Version Manager)
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# download and install Node.js (you may need to restart the terminal)
$ nvm install 20

# installs package dependencies for this program, namely selenium-webdriver
$ npm install
```

# How to Use
### Part 1: Code Generation

1. Make sure you are logged into your Instagram account on your browser.
2. **[USER ACTION REQUIRED: COMMAND LINE]** Run either of the following commands inside your terminal (they will do the same thing):
```
$ ./insight.sh -ctm

OR

$ npm run start
```
3. This will first run the following command:
```
$ npm run code
```
4. **[USER ACTION REQUIRED: LOGIN]** This will open your browser and prompt for your login. Enter your credentials and follow steps to accept permissions accordingly. **You will have 60 seconds to login, or else the process will be cancelled.**

**I did not want to handle or store any Instagram login credentials inside this program, and wanted to leave it up to the user to safely and manually input their credentials into Instagram's official login windows.**

5. This will generate a code that will be copied into **files/code.txt**.

```
Code successfully retrieved: {your_code_here}
```

### PART 2: Token Generation
7. The next command will be run:

```
$ npm run token
```
8. Doing so will execute an API call to first generate a short-lived access token, and then a second API call will be made to retrieve a long-lived token, which will be stored into **files/token.txt**.

```
Token successfully generated: {your_token_here}
```

### PART 3: Retrieving Media URLs and Insight IDs

9. The next command will be run:

```
$ npm run media
```

10. This will call Instagram's Basic Display API so that it can print the list of all media to **files/permalinks.txt**.

```
Media permalinks obtained and written to file.
```

11. Due to a CORS issue, certain data will be omitted from fetch() calls within NodeJs, and so the program switches to a bash script to do curl calls on every media object listed in permalinks.txt, and in effect generate a list of every media's insight ID, written to **files/insights.csv**.

```
Insight ID's retrieved and written to file.
```

### PART 4: Calculating Insights

12. Lastly, the final command will be run:

```
$ npm run insight
```

13. **[USER ACTION REQUIRED: LOGIN]** This will trigger a Selenium script to run, which will open a browser leading to Instagram's login page. You will again have 60 seconds to enter your credentials accordingly.
14. After logging in, the Selenium script will scrape every insight URL for statistics, and output the findings into **out/insights.csv**.

```
Your results were successfully written to out/insights.csv !
```

### (Optional) Short-cut #1

**The token from Step 8 will last for 60 days.**

**And thus generating a code request URL or access token before the following steps do not need to be repeated so long as the token is still valid.**

This can be achieved by running the following command:

```
# Runs the main command, but -c and -t flags are omitted, skipping code and token generation steps.

$ ./insight.sh -m
```

This will skip straight to step 9.

### (Optional) Short-cut #2

If you ran "npm run start" once already and would like to re-calculate your statistics (provided you haven't made any new posts since your last run), you can trigger the calculation again but save time on having to retrieve insight ID's again by running any of the following commands:

```
$ ./insight.sh

OR

$ npm run insight

OR

$ node .
```

This will skip straight to Step 12. **This will not retrieve any data from new posts you made since your last "npm run start", so if you have made new posts, begin from "npm run start" again.**