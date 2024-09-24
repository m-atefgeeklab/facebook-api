// utils/delay.js
function delay(min = 100, max = 500) {
  const time = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, time));
}

module.exports = { delay };
