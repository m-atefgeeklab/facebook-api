const puppeteer = require("puppeteer");
const mongoose = require('mongoose');
const { fillInput, clickButton, navigateToPage } = require("../utils/scraping");
const { delay } = require("../utils/delay");
const logger = require("../utils/logger");
const Post = require("../models/GroupPost");
const Group = require("../models/Group");

async function scrapeAndPostData(config, data) {
  const { loginUrl, groupUrl, selectors } = config;
  const { email, password, groupId, postContent, images } = data;

  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 10,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(1000000);

  try {
    // Navigate to the login page and log in
    await navigateToPage(page, loginUrl);
    await fillInput(page, selectors.email, email);
    await fillInput(page, selectors.password, password);
    await clickButton(page, selectors.loginButton);
    await page.waitForNavigation({ waitUntil: "domcontentloaded" });
    await delay(1000, 3000); // Random delay after login

    // Handle notification
    await page.waitForSelector(selectors.notificationButton, {
      visible: true,
      timeout: 10000,
    });
    await page.click(selectors.notificationButton);
    await delay(500, 1500); // Random delay before post area activation

    // Navigate to the group page after login
    await navigateToPage(page, `${groupUrl}${groupId}`);
    await delay(1000, 3000); // Random delay after navigation

    // Handle notification
    await page.waitForSelector(selectors.notificationButton, {
      visible: true,
      timeout: 10000,
    });
    await page.click(selectors.notificationButton);
    await delay(500, 1500); // Random delay before post area activation

    await page.waitForSelector(
      'a[href*="/members/"][role="link"][tabindex="0"]',
      { visible: true, timeout: 10000 }
    );

    const members = await page.evaluate(() => {
      const anchor = document.querySelector(
        'a[href*="/members/"][role="link"][tabindex="0"]'
      );
      return anchor ? anchor.innerText : null;
    });

    // Open the post area
    await page.waitForSelector(selectors.createPostButton, {
      visible: true,
      timeout: 10000,
    });
    await page.click(selectors.createPostButton);
    await delay(2000, 4000); // Random delay before post box appears

    // Fill in the post content
    await page.waitForSelector(selectors.postBox, {
      visible: true,
      timeout: 10000,
    });
    await page.click(selectors.postBox);

    // Type the post message with random delay to mimic human behavior
    await page.keyboard.type(postContent, {
      delay: Math.floor(Math.random() * 200) + 50,
    });

    // Optional: If images are provided, attach them to the post
    if (images && images.length > 0) {
      for (let imagePath of images) {
        const [fileChooser] = await Promise.all([
          page.waitForFileChooser(),
          page.click(selectors.mediaAttachmentButton), // Use the new selector from config
        ]);
        await fileChooser.accept([imagePath]); // Pass the image path from Multer upload
        await delay(3000);
      }
    }

    // Click on the 'Post' button with a random delay
    await page.waitForSelector(selectors.postButton, { visible: true });
    await delay(500, 1500); // Random delay before clicking post button
    await page.click(selectors.postButton);
    await delay(1000, 2000); // Random delay after post

    logger.info("Post created successfully!");

    // Check if the group exists
    let group = await Group.findOne({ _id: groupId });
    if (!group) {
      // If group doesn't exist, create a new one
      group = new Group({
        _id: groupId,
        members: members,
      });
      await group.save();
      logger.info(`New group created with ID: ${groupId}`);
    } else {
      // Update members count for existing group
      await group.updateMembers(members);
      logger.info(`Group members updated for ID: ${groupId}`);
    }

     // Save post under the group
    const newPost = new Post({
      groupId: group._id,
      postContent: postContent,
      images: images,
      postedBy: email,
    });
    await newPost.save();

    await delay(1000, 2000);

    logger.info("Post saved to database successfully!");
  } catch (error) {
    logger.error(`Error during scraping and posting: ${error.message}`);
    throw error;
  } finally {
    await browser.close();
    await mongoose.connection.close();
  }
}

module.exports = { scrapeAndPostData };
