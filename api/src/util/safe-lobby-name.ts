export const safeLobbyName = (name: string) => {
  return name.replace(/[^a-zA-Z0-9]/g, '_');
};
