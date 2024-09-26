const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const downloadFromS3 = require("../utils/getImagesS3");
const { fillInput, clickButton, navigateToPage } = require("../utils/scraping");
const { delay } = require("../utils/delay");
const logger = require("../utils/logger");
const Post = require("../models/GroupPost");
const Group = require("../models/Group");
const Account = require("../models/Account");

async function scrapeAndPostData(config, data) {
  const { loginUrl, groupUrl, selectors } = config;
  const { email, password, groupId, postContent, imageKeys } = data;

  let browser;
  try {
    // Check if account exists, if not, create it
    let account = await Account.findOne({ email });
    if (!account) {
      // Create a new account if none exists with the provided email
      account = new Account({ email, password });
      await account.save(); // This will trigger the brand assignment in the pre-save hook
    }

    // Use the account's email and password for scraping
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(1000000);

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

    // Check if group exists
    await page.waitForSelector(
      'a.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x1heor9g.x1sur9pj.xkrqix3.x1pd3egz[role="link"][tabindex="0"]',
      { visible: true, timeout: 10000 }
    );

    // Extract group name
    const groupName = await page.evaluate(() => {
      const groupAnchor = document.querySelector(
        'a.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x1heor9g.x1sur9pj.xkrqix3.x1pd3egz[role="link"][tabindex="0"]'
      );
      return groupAnchor ? groupAnchor.innerText : null;
    });

    await delay(500, 1000);

    await page.waitForSelector(
      'a[href*="/members/"][role="link"][tabindex="0"]',
      { visible: true, timeout: 10000 }
    );

    const members = await page.evaluate(() => {
      const membersAnchor = document.querySelector(
        'a[href*="/members/"][role="link"][tabindex="0"]'
      );
      return membersAnchor ? membersAnchor.innerText : null;
    });

    await delay(500, 1500);

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

    for (let char of postContent) {
      await page.keyboard.type(char);
      await delay(50, 200);
    }

    await delay(1000, 2000);

    // Attach images to the post from S3
    if (imageKeys.length > 0) {
      for (let key of imageKeys) {
        const localFilePath = await downloadFromS3(
          process.env.AWS_BUCKET_NAME,
          key
        );

        // Puppeteer logic to upload images to Facebook
        const [fileChooser] = await Promise.all([
          page.waitForFileChooser(),
          page.click(selectors.mediaAttachmentButton),
        ]);
        await fileChooser.accept([localFilePath]);
      }
    }

    // Click on the 'Post' button with a random delay
    await page.waitForSelector(selectors.postButton, { visible: true });
    await delay(500, 1500); // Random delay before clicking post button
    await page.click(selectors.postButton);
    await delay(1000, 2000); // Random delay after post

    logger.info("Post created successfully");

    // Check if the group exists
    let group = await Group.findOne({ _id: groupId });
    if (!group) {
      // If group doesn't exist, create a new one
      group = new Group({
        _id: groupId,
        name: groupName,
        members: members,
        brand: account.brand,
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
      images: imageKeys,
      postedBy: email,
    });
    await newPost.save();

    await delay(1500, 3000);

    // Log database save success only after post is saved to the database
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

// const puppeteer = require("puppeteer");
// const mongoose = require("mongoose");
// const downloadFromS3 = require("../utils/getImagesS3");
// const { fillInput, clickButton, navigateToPage } = require("../utils/scraping");
// const { delay } = require("../utils/delay");
// const logger = require("../utils/logger");
// const Post = require("../models/GroupPost");
// const Group = require("../models/Group");
// const Account = require("../models/Account");

// async function scrapeAndPostData(config, data, imageKeys = []) {
//   const { loginUrl, groupUrl, selectors } = config;
//   const { email, password, groupId, postContent } = data;

//   let browser;
//   try {
//     // Check if account exists, if not, create it
//     let account = await Account.findOne({ email });
//     if (!account) {
//       // Create a new account if none exists with the provided email
//       account = new Account({ email, password });
//       await account.save(); // This will trigger the brand assignment in the pre-save hook
//     }

//     // Use the account's email and password for scraping
//     browser = await puppeteer.launch({
//       headless: true,
//       args: ["--no-sandbox", "--disable-setuid-sandbox"],
//     });
//     const page = await browser.newPage();
//     page.setDefaultNavigationTimeout(1000000);

//     // Navigate to the login page and log in
//     await navigateToPage(page, loginUrl);
//     await fillInput(page, selectors.email, email);
//     await fillInput(page, selectors.password, password);
//     await clickButton(page, selectors.loginButton);
//     await page.waitForNavigation({ waitUntil: "domcontentloaded" });
//     await delay(1000, 3000); // Random delay after login

//     // Handle notification
//     await page.waitForSelector(selectors.notificationButton, {
//       visible: true,
//       timeout: 10000,
//     });
//     await page.click(selectors.notificationButton);
//     await delay(500, 1500); // Random delay before post area activation

//     // Navigate to the group page after login
//     await navigateToPage(page, `${groupUrl}${groupId}`);
//     await delay(1000, 3000); // Random delay after navigation

//     // Handle notification
//     await page.waitForSelector(selectors.notificationButton, {
//       visible: true,
//       timeout: 10000,
//     });
//     await page.click(selectors.notificationButton);
//     await delay(500, 1500); // Random delay before post area activation

//     // Check if group exists
//     await page.waitForSelector(
//       'a.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x1heor9g.x1sur9pj.xkrqix3.x1pd3egz[role="link"][tabindex="0"]',
//       { visible: true, timeout: 10000 }
//     );

//     // Extract group name
//     const groupName = await page.evaluate(() => {
//       const groupAnchor = document.querySelector(
//         'a.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x1heor9g.x1sur9pj.xkrqix3.x1pd3egz[role="link"][tabindex="0"]'
//       );
//       return groupAnchor ? groupAnchor.innerText : null;
//     });

//     await delay(500, 1000);

//     await page.waitForSelector(
//       'a[href*="/members/"][role="link"][tabindex="0"]',
//       { visible: true, timeout: 10000 }
//     );

//     const members = await page.evaluate(() => {
//       const membersAnchor = document.querySelector(
//         'a[href*="/members/"][role="link"][tabindex="0"]'
//       );
//       return membersAnchor ? membersAnchor.innerText : null;
//     });

//     await delay(500, 1500);

//     // Open the post area
//     await page.waitForSelector(selectors.createPostButton, {
//       visible: true,
//       timeout: 10000,
//     });
//     await page.click(selectors.createPostButton);
//     await delay(2000, 4000); // Random delay before post box appears

//     // Fill in the post content
//     await page.waitForSelector(selectors.postBox, {
//       visible: true,
//       timeout: 10000,
//     });
//     await page.click(selectors.postBox);

//     for (let char of postContent) {
//       await page.keyboard.type(char);
//       await delay(50, 200);
//     }

//     await delay(1000, 2000);

//     // Attach images to the post from S3
//     if (imageKeys.length > 0) {
//       for (let key of imageKeys) {
//         const localFilePath = await downloadFromS3(
//           process.env.AWS_BUCKET_NAME,
//           key
//         );

//         // Puppeteer logic to upload images to Facebook
//         const [fileChooser] = await Promise.all([
//           page.waitForFileChooser(),
//           page.click(selectors.mediaAttachmentButton),
//         ]);
//         await fileChooser.accept([localFilePath]);
//       }
//     }

//     // Click on the 'Post' button with a random delay
//     await page.waitForSelector(selectors.postButton, { visible: true });
//     await delay(500, 1500); // Random delay before clicking post button
//     await page.click(selectors.postButton);
//     await delay(1000, 2000); // Random delay after post

//     logger.info("Post created successfully");

//     // Check if the group exists
//     let group = await Group.findOne({ _id: groupId });
//     if (!group) {
//       // If group doesn't exist, create a new one
//       group = new Group({
//         _id: groupId,
//         name: groupName,
//         members: members,
//         brand: account.brand,
//       });
//       await group.save();
//       logger.info(`New group created with ID: ${groupId}`);
//     } else {
//       // Update members count for existing group
//       await group.updateMembers(members);
//       logger.info(`Group members updated for ID: ${groupId}`);
//     }

//     // Save post under the group
//     const newPost = new Post({
//       groupId: group._id,
//       postContent: postContent,
//       images: imageKeys,
//       postedBy: email,
//     });
//     await newPost.save();

//     await delay(1500, 3000);

//     // Log database save success only after post is saved to the database
//     logger.info("Post saved to database successfully!");
//   } catch (error) {
//     logger.error(`Error during scraping and posting: ${error.message}`);
//     throw error;
//   } finally {
//     await browser.close();
//     await mongoose.connection.close();
//   }
// }

// module.exports = { scrapeAndPostData };
