export const sortBydate = chatMessages => {
  return chatMessages.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
};
