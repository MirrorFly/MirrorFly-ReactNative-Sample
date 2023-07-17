
export const sortBydate = (chatMessages) => {
  return chatMessages.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
};
