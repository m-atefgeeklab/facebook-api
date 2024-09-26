const { delay } = require('./delay');

async function navigateToPage(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await delay();
}

async function fillInput(page, selector, value) {
  await page.waitForSelector(selector, { visible: true });
  await delay();
  await page.click(selector, { clickCount: 3 });
  await page.type(selector, value, { delay: Math.floor(Math.random() * 100) + 50 });
}

async function clickButton(page, selector) {
  await page.waitForSelector(selector, { visible: true });
  await delay();
  await page.click(selector);
}

module.exports = {
  navigateToPage,
  fillInput,
  clickButton,
};
