export const calculateFeePerDay = (bidding) => {
  const days = bidding.duration / 86400;
  return Math.ceil(bidding.amount / days);
};

export const calculateDuration = (bidding) => {
  return bidding.duration / 86400;
};

// {
//   "id": "0xee42fcb5690f8bcbdaf2029f7f8c88ea488c37c01fc6578131ff3d648b003a2f",
//   "lender": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
//   "borrower": "0x0000000000000000000000000000000000000000",
//   "erc721": "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9",
//   "tokenId": "0",
//   "erc20": "0x0165878a594ca255338adfa4d48449f69242eb8f",
//   "amount": "100",
//   "listingExpiration": "1678038811",
//   "biddingExpiration": "0",
//   "duration": "86400",
//   "signature": "0x5c44a14217f61fe260a1de5eb32c641729efa9180f5b02fd35e86c12562b6391171b267f8142abdab5d8cd6a504c519bd3133f797a1719a6ee0bc92ba7272d4f1c"
// }
