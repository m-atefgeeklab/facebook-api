const { launchBrowserAndLogin } = require("../utils/browser");
const { delay } = require("../utils/delay");
const logger = require("../utils/logger");
const Post = require("../models/SocialMediaPosts");
const Account = require("../models/SocialMediaAccount");
const Group = require("../models/SocialMediaGroups");
const Campaign = require("../models/CampaignModel");

async function scrapeAndPostData(
  config,
  brandId,
  groupId,
  postContent,
  campaignId
) {
  let browser, page, group, account, selectors;

  try {
    ({ browser, page, group, account, selectors } = await setupBrowserAndGroup(
      config,
      brandId,
      groupId
    ));

    await handlePost(page, selectors, postContent);
    await savePostToDatabase(
      brandId,
      groupId,
      postContent,
      group.group_name,
      account.platform
    );

    // Increment posts_shared count in the Campaign
    await Campaign.updateOne(
      { _id: campaignId },
      { $inc: { posts_shared: 1 } }
    );
  } catch (error) {
    logger.error(`Error during scraping and posting: ${error.message}`);

    // Update campaign status to 'failed' if an error occurs
    await Campaign.updateOne({ _id: campaignId }, { status: "failed" });

    throw error; // Re-throw the error to indicate job failure
  } finally {
    if (browser) await browser.close();
  }
}

async function scrapeAndGetGroupMembers(config, brandId, groupId) {
  let browser, page, group, account, selectors;

  try {
    ({ browser, page, group, account, selectors } = await setupBrowserAndGroup(
      config,
      brandId,
      groupId
    ));

    const membersCount = await getMembersCount(page);
    logger.info(`Members count for group ${group.group_id}: ${membersCount}`);

    await updateGroupMembers(group.group_id, membersCount);
  } catch (error) {
    logger.error(`Error scraping group members: ${error.message}`);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

async function setupBrowserAndGroup(config, brandId, groupId) {
  const { facebookUrl, groupUrl, loginUrl, selectors } = config;
  let browser, page;

  const account = await Account.findOne({
    brand: brandId,
    platform: "FACEBOOK",
  });
  const group = await Group.findOne({
    group_id: groupId,
    brand: brandId,
    platform: "FACEBOOK",
  });

  if (!account || !group) {
    throw new Error("Account or Group not found.");
  }

  ({ browser, page } = await launchBrowserAndLogin(
    account,
    facebookUrl,
    loginUrl,
    selectors
  ));

  await delay(1000, 2000);

  await page.goto(`${groupUrl}${group.group_id}`, {
    waitUntil: "networkidle2",
  });

  await delay(1000, 2000);

  return { browser, page, group, account, selectors };
}

async function handlePost(page, selectors, postContent) {
  try {
    await page.waitForSelector(selectors.createPostButton, {
      visible: true,
      timeout: 10000,
    });
    await page.click(selectors.createPostButton);
    await delay(2000, 4000);

    // Wait for the post box to appear (using your provided selector)
    await page.waitForSelector(
      'div[aria-label="Create a public post…"][role="textbox"]',
      {
        visible: true,
        timeout: 10000,
      }
    );

    // Click on the post box to focus on it
    await page.click('div[aria-label="Create a public post…"][role="textbox"]');

    // Type the new content into the post box
    await page.focus('div[aria-label="Create a public post…"][role="textbox"]');
    for (let char of postContent) {
      await page.keyboard.type(char, { delay: 100 });
    }

    await delay(1000, 2000);
    await page.waitForSelector(selectors.postButton, { visible: true });
    await delay(500, 1500);
    await page.click(selectors.postButton);
    await delay(1000, 2000);

    logger.info("Post created successfully");
  } catch (error) {
    logger.error(`Error during post creation: ${error.message}`);
    throw error;
  }
}

async function getMembersCount(page) {
  await page.waitForSelector(
    'a.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x1sur9pj.xkrqix3.xi81zsa.x1s688f[href*="/members/"][role="link"][tabindex="0"]',
    { visible: true }
  );

  return await page.evaluate(() => {
    const membersAnchor = document.querySelector(
      'a.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x1sur9pj.xkrqix3.xi81zsa.x1s688f[href*="/members/"][role="link"][tabindex="0"]'
    );

    if (membersAnchor) {
      const text = membersAnchor.innerText;
      const match = text.match(/(\d+) member/);
      return match ? parseInt(match[1]) : 0;
    } else {
      throw new Error("Members count anchor not found.");
    }
  });
}

async function updateGroupMembers(groupId, membersCount) {
  const group = await Group.findOne({ group_id: groupId });
  if (group) {
    group.subscribers = membersCount;
    await group.save();
    logger.info(`Group members updated for ID: ${groupId}`);
  } else {
    logger.error(`Group not found: ${groupId}`);
  }
}

async function savePostToDatabase(
  brandId,
  groupId,
  postContent,
  groupName,
  platform
) {
  const newPost = new Post({
    brand: brandId,
    group_id: groupId,
    content: postContent,
    group_name: groupName,
    platform,
    timestamp: Date.now(),
  });
  await newPost.save();
  logger.info("Post saved to database successfully!");
}

module.exports = { scrapeAndPostData, scrapeAndGetGroupMembers };
