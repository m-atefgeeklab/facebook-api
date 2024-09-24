const { delay } = require('./delay');

async function navigateToPage(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await delay(); // Random delay after navigation
}

async function fillInput(page, selector, value) {
  await page.waitForSelector(selector, { visible: true });
  await delay(); // Random delay before typing
  await page.click(selector, { clickCount: 3 });
  await page.type(selector, value, { delay: Math.floor(Math.random() * 100) + 50 }); // Random typing speed
}

async function clickButton(page, selector) {
  await page.waitForSelector(selector, { visible: true });
  await delay(); // Random delay before clicking
  await page.click(selector);
}

module.exports = {
  navigateToPage,
  fillInput,
  clickButton,
};
