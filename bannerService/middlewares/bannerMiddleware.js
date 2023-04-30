function generateHtmlCode(title, subtitle, imageUrl, link) {
    return `
      <a href="${link}">
        <img src="${imageUrl}" alt="${title}" />
        <h2>${title}</h2>
        ${subtitle ? `<h3>${subtitle}</h3>` : ''}
      </a>
    `;
  }

  module.exports = { generateHtmlCode }