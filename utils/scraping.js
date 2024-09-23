async function navigateToPage(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
}

async function fillInput(page, selector, value) {
  await page.waitForSelector(selector, { visible: true });
  await page.click(selector, { clickCount: 3 });
  await page.type(selector, value, { delay: 100 });
}

async function clickButton(page, selector) {
  await page.waitForSelector(selector, { visible: true });
  await page.click(selector);
}

module.exports = {
  navigateToPage,
  fillInput,
  clickButton,
};
