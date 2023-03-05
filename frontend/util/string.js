export const trimmedAddress = (address) => {
  return `${address.substring(0, 6)}...${address.substring(38)}`;
}

export const getPinataImgAddr = (nftData) => {
  const jsonString = nftData.metadata;
  const parsedObject = JSON.parse(jsonString);
  const ipfsLink = parsedObject.image;
  const cid = ipfsLink.replace("ipfs://", "");
  return `https://gateway.pinata.cloud/ipfs/${cid}/`;
}
