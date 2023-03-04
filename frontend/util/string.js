export const trimmedAddress = (address) => {
  return `${address.substring(0, 2)}...${address.substring(38)}`;
}
