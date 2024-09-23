const config = {
  loginUrl: "https://www.facebook.com/login",
  groupUrl: "https://www.facebook.com/groups/",
  selectors: {
    email: "#email",
    password: "#pass",
    loginButton: 'button[name="login"]',
    notificationButton: 'div[role="button"]:not([aria-hidden="true"])',
    createPostButton: 'div[role="button"][tabindex="0"] .xi81zsa',
    postBox: 'div[role="textbox"]',
    mediaAttachmentButton: 'div[aria-label="Photo/video"]',
    postButton: 'div[aria-label="Post"]',
  },
};

module.exports = config;
