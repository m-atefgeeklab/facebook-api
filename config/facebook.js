const config = {
  facebookUrl: "https://www.facebook.com/",
  loginUrl: "https://www.facebook.com/login",
  groupUrl: "https://www.facebook.com/groups/",
  selectors: {
    email: "#email",
    password: "#pass",
    loginButton: 'button[name="login"]',
    // notificationButton: 'div[role="button"]:not([aria-hidden="true"])',
    createPostButton: 'div[role="button"][tabindex="0"].x1i10hfl .xi81zsa.x1lkfr7t.xkjl1po.x1mzt3pk.xh8yej3.x13faqbe',
    // postBox: 'div[role="textbox"].notranslate',
    // mediaAttachmentButton: 'div[aria-label="Photo/video"]',
    postButton: 'div[aria-label="Post"]',
  },
};

module.exports = config;
