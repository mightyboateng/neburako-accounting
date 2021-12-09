function fomatter(num) {
  const displayNum = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
  return displayNum;
}

module.exports = fomatter;
