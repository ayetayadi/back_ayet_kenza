function generateHTMLCode(callToAction, imageUrl) {
  return `
    <a href="${callToAction}">
      <img src="${imageUrl}" alt="" />
    </a>
  `;
}

module.exports = { generateHTMLCode };
