function getFormattedDate() {
  const locale = navigator.language || "en-GB";
  const options = { weekday: "short", day: "numeric", month: "short" };
  const today = new Date();
  return today.toLocaleDateString(locale, options);
}

export { getFormattedDate };
