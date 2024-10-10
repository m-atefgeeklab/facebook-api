const puppeteer = require("puppeteer");
const logger = require("./logger");
const { delay } = require("./delay");
const { encrypt } = require("./encryption");
const { fillInput, clickButton, navigateToPage } = require("./scraping");

async function launchBrowserAndLogin(account, facebookUrl, loginUrl, selectors) {
  // Decrypt email, password, and cookies from the token
  const { email, password, cookies } = account.decryptDataOfToken();
  
  if (!email || !password) {
    logger.error("Failed to retrieve email and password from the decrypted token");
    return;
  }

  if (!Array.isArray(cookies)) {
    console.error("Cookies are not an array, cannot proceed");
    return;
  }
  
  const isProduction = process.env.NODE_ENV === 'production';
  const browser = await puppeteer.launch({
    headless: isProduction,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(1000000);

  const context = browser.defaultBrowserContext();
  await context.overridePermissions(facebookUrl, ["geolocation", "notifications"]);

  await delay(1000, 2000);

  // If cookies are valid, load them and avoid login
  if (cookies.length) {
    logger.info("Cookies are valid, loading cookies...");
    await page.setCookie(...cookies);
    await page.reload({ waitUntil: "networkidle2" });
    logger.info("Cookies loaded and page reloaded with session.");

    await navigateToPage(page, facebookUrl);

    // Wait for the profile page to load and check for the selector
    try {
      const profileSelector = 'div[aria-label="Menu"].x1i10hfl.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x1ypdohk.xdl72j9.x2lah0s.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x2lwn1j.xeuugli.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1q0g3np.x87ps6o.x1lku1pv.x1a2a7pz.x6s0dn4.xzolkzo.x12go9s9.x1rnf11y.xprq8jg.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x78zum5.xl56j7k.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1n2onr6.x1vqgdyp.x100vrsf.x1qhmfi1';
      await page.waitForSelector(profileSelector, { timeout: 5000 });
      logger.info("Cookies are valid, found the profile selector.");
    } catch (error) {
      logger.warn("Cookies may have expired or the profile selector was not found.");
      await handleLogin(page, loginUrl, selectors, account, { email, password });
      return;
    }
  } else {
    logger.info("Cookies expired or not available, proceeding with login...");
    await handleLogin(page, loginUrl, selectors, account, { email, password });
  }

  return { browser, page };
}

async function handleLogin(page, loginUrl, selectors, account) {
  await navigateToPage(page, loginUrl);

  const {
    email,
    password,
    client_id,
    client_secret,
    pageID,
    tokenPage,
    longAccessToken,
  } = account.decryptDataOfToken();

  // Fill in the login form
  await fillInput(page, selectors.email, email);
  await fillInput(page, selectors.password, password);
  await clickButton(page, selectors.loginButton);

  // Wait for the login to complete
  await page.waitForNavigation({ waitUntil: "networkidle2" });
  await delay(1000, 2000);

  // After login, get cookies
  const cookies = await page.cookies();

  // Encrypt the cookies and save them in the token
  const tokenData = {
    email,
    password,
    cookies: JSON.stringify(cookies),
    client_id,
    client_secret,
    pageID,
    tokenPage,
    longAccessToken,
  };

  const token = encrypt(JSON.stringify(tokenData));
  account.token = token; // Update the account token
  await account.save();
  logger.info("New token with encrypted cookies saved successfully.");
}

module.exports = { launchBrowserAndLogin };
