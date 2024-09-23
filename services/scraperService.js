const puppeteer = require("puppeteer");
const { fillInput, clickButton, navigateToPage } = require("../utils/scraping");
const { delay } = require("../utils/delay");

async function scrapeAndPostData(config, data) {
  const { loginUrl, groupUrl, selectors } = config;
  const { email, password, groupId, postContent, images } = data;

  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 20,
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(1000000);
  await page.setViewport({ width: 800, height: 1200 });

  try {
    // Navigate to the login page and log in
    await navigateToPage(page, loginUrl);
    await fillInput(page, selectors.email, email);
    await fillInput(page, selectors.password, password);
    await clickButton(page, selectors.loginButton);
    await page.waitForNavigation({ waitUntil: "domcontentloaded" });
    await delay(3000); // Wait for login to complete

    // Navigate to the group page after login
    await navigateToPage(page, `${groupUrl}${groupId}`);
    await delay(3000); // Ensure the group page loads

    // Open the post area
    await page.waitForSelector(selectors.notificationButton, {
      visible: true,
      timeout: 10000,
    });
    await page.click(selectors.notificationButton);
    await delay(1000); // Allow time for post area to activate

    await page.waitForSelector(selectors.createPostButton, {
      visible: true,
      timeout: 10000,
    });
    await page.click(selectors.createPostButton, { delay: 300 });
    await delay(3000); // Wait for the post box popup to appear

    // Fill in the post content
    await page.waitForSelector(selectors.postBox, {
      visible: true,
      timeout: 10000,
    });
    await page.click(selectors.postBox, { delay: 300 });

    // Type the post message with delay to mimic human behavior
    await page.keyboard.type(postContent, { delay: 300 });

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

    // Click on the 'Post' button with a delay
    await page.waitForSelector(selectors.postButton, { visible: true });
    await page.click(selectors.postButton, { delay: 300 });
    await delay(3000); // Allow time for the post to be submitted

    console.log("Post created successfully!");
  } catch (error) {
    console.error("Error during scraping and posting:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeAndPostData };
