function generateHTMLCode(callToAction, imageUrl) {
  // Initialiser les nombres de vues, de clics et d'impressions
  let views = 0;
  let clicks = 0;
  let impressions = 0;

  function incrementViews() {
    views++;
  }
  function incrementClicks() {
    clicks++;
  }
  function incrementImpressions() {
    impressions++;
  }
  incrementClicks();
  incrementImpressions(); 
  incrementViews();       
  return `
    <a href="${callToAction}">
      <img src="${imageUrl}" alt="" onclick="incrementClicks()" onload="incrementViews()" />
    </a>
  `;
}

module.exports = { generateHTMLCode };
