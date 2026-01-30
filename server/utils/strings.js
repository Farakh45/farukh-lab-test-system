const TitleCase = (str) => {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const lowerTrim = (str) => {
  if (!str) return '';
  return str.toLowerCase().trim();
};

module.exports = { TitleCase, lowerTrim };
