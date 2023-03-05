import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Router from "next/router";
import api from "../../../util/api";
import {
  POLYJUICE_CONTRACT_ADDRESS,
  POLYJUICE_ABI,
} from "../../../util/contract";
import { trimmedAddress } from "../../../util/string";
import { calculateFeePerDay, calculateDuration } from "../../../util/bidding";
import { useContract, useProvider } from "wagmi";
import tempChildImg from "./temp_child_nft.png";

function MakeOfferByNotOwner({ childERC721, tokenId }) {
  const [duration, setDuration] = useState(0);
  const [feePerDay, setFePerDay] = useState(0);
  const [listingExpiration, setListingExpiration] = useState(0);
  const [usdcBalance, setUSDCBalance] = useState(0);
  const [bidding, setBidding] = useState(null);

  function handleDurationChange(event) {
    setDuration(event.target.value);
  }
  function handleFeePerDayChange(event) {
    setFePerDay(event.target.value);
  }
  function handleListingExpirationChange(event) {
    setListingExpiration(event.target.value);
  }

  const makeOffer = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    // const ethAddress = await signer.getAddress();
    console.log(childERC721);

    const bidding = {
      lender: "0x0000000000000000000000000000000000000000",
      borrower: accounts[0],
      erc721: childERC721.toLowerCase(),
      tokenId: tokenId,
      erc20: "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44",
      amount: feePerDay * duration,
      listingExpiration: 0,
      biddingExpiration: listingExpiration * 86400,
      duration: duration * 86400,
    };

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const signature = await signer.signMessage(JSON.stringify(bidding));

    await api.post("/bidding", { ...bidding, signature });
    setBidding(
      (await api.get(`/bidding/${childERC721}/${tokenId}`)).data.bidding
    );
    console.log(res);
    // const result = await signBiddingInfo(signer, biddingInfo);
  };

  useEffect(() => {
    async function fetchBidding() {
      const bidding = (await api.get(`/bidding/${childERC721}/${tokenId}`)).data
        .bidding;
      setBidding(
        bidding.filter(
          (bidding) => bidding.borrower !== ethers.constants.AddressZero
        )
      );
    }
    fetchBidding();
  }, []);

  return (
    <div>
      <div className="flex flex-row justify-between w-full h-[64px] rounded-lg border-2 border-polygreen text-polygreen p-4 mb-4">
        Rental Duration
        <div className="flex flex-row">
          <input
            type="text"
            value={duration}
            onChange={handleDurationChange}
            className="bg-transparent text-right placeholder-right"
          />
          <div className="text-slate-400 ml-2" style={{ marginTop: "2.2px" }}>
            DAYS
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-between w-full h-[64px] rounded-lg border-2 border-polygreen text-polygreen p-4">
        Price to Offer
        <div className="flex flex-row">
          <input
            type="text"
            value={feePerDay}
            onChange={handleFeePerDayChange}
            className="bg-transparent text-right placeholder-right"
          />
          <div className="text-slate-400 ml-2" style={{ marginTop: "2.2px" }}>
            USDC
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 text-white mb-4 mt-2">
        <div className="p-2">
          <div className="flex flex-row justify-between">
            <div></div>
          </div>
        </div>
        <div className="p-2">
          <div className="flex flex-row justify-between">
            <div>Total Payment</div>
            <div className="text-polygreen">{duration * feePerDay} USDC</div>
          </div>
        </div>
        <div className="p-2"></div>
        <div className="p-2">
          <div className="flex flex-row justify-between -mt-2">
            <div>Your wallet balance</div>
            <div className="text-polygreen">{usdcBalance} USDC</div>
          </div>
        </div>
      </div>

      {!bidding ||
        (bidding.length === 0 && (
          <div className="flex flex-col gap-4 max-w-[686px] mb-5">
            <div className="inline-block w-full rounded-lg py-[24px] px-[32px] bg-[#2A2D3A] text-white">
              <div className="text-[16px] font-semibold ">No Offers Yet</div>
            </div>
          </div>
        ))}

      {bidding && bidding.length > 0 && (
        <div className="flex flex-col gap-4 max-w-[686px]">
          <div className="inline-block w-full rounded-lg py-[24px] px-[32px] bg-[#2A2D3A] text-white">
            <div className="text-[20px] font-bold mb-[16px]">Offers</div>
            <div className="flex flex-row pb-2">
              <div className="w-1/3 text-center text-polygreen">From</div>
              <div className="w-1/3 text-center text-polygreen">
                Price per day
              </div>
              <div className="w-1/3 text-center text-polygreen">Duration</div>
              {/* <div className="w-1/3 text-center">Action</div> */}
            </div>
            <ul role="list" className="max-h-[150px] overflow-scroll">
              {bidding &&
                bidding.length > 0 &&
                bidding.map((bidding) => (
                  <li>
                    <div className="flex flex-row justify-between pb-2">
                      <div className="w-1/3 text-center">
                        {trimmedAddress(bidding.borrower)}
                      </div>
                      <div className="w-1/3 text-center">
                        {calculateFeePerDay(bidding)} USDC
                      </div>
                      <div className="w-1/3 text-center">
                        {calculateDuration(bidding)} DAY
                      </div>
                      {/* <div className="w-1/3 text-center"></div> */}
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}

      <div className="flex flex-row justify-between w-full h-[64px] rounded-lg border-2 border-polygreen text-polygreen p-4 mb-4 mt-4">
        Listing Duration
        <div className="flex flex-row">
          <input
            type="text"
            value={listingExpiration}
            onChange={handleListingExpirationChange}
            className="bg-transparent text-right placeholder-right"
          />
          <div className="text-slate-400 ml-2" style={{ marginTop: "2.2px" }}>
            DAYS
          </div>
        </div>
      </div>
      <div
        className="mt-8 w-full h-[81px] rounded-lg text-black text-[20px] font-semibold bg-polygreen flex items-center justify-center hover:cursor-pointer"
        onClick={() => makeOffer()}
      >
        <div className="text-center font-bold">Make Offer</div>
      </div>
    </div>
  );
}

function ListByOwner({ childERC721, tokenId }) {
  const [duration, setDuration] = useState(0);
  const [feePerDay, setFePerDay] = useState(0);
  const [listingExpiration, setListingExpiration] = useState(0);
  const [usdcBalance, setUSDCBalance] = useState(0);
  const [bidding, setBidding] = useState(null);

  const [listed, setListed] = useState(false);
  const [canRent, setCanRent] = useState(false);

  const provider = useProvider();
  const PolyJuice = useContract({
    addressOrName: POLYJUICE_CONTRACT_ADDRESS,
    contractInterface: POLYJUICE_ABI,
    signerOrProvider: provider,
  });

  function handleDurationChange(event) {
    setDuration(event.target.value);
  }
  function handleFeePerDayChange(event) {
    setFePerDay(event.target.value);
  }
  function handleListingExpirationChange(event) {
    setListingExpiration(event.target.value);
  }

  const list = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    const bidding = {
      lender: accounts[0],
      borrower: "0x0000000000000000000000000000000000000000",
      erc721: childERC721.toLowerCase(),
      tokenId: tokenId,
      erc20: "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44",
      amount: feePerDay * duration,
      listingExpiration: listingExpiration * 86400,
      biddingExpiration: 0,
      duration: duration * 86400,
    };

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const signature = await signer.signMessage(JSON.stringify(bidding));

    await api.post("/bidding", { ...bidding, signature });
    setListed(true);
  };

  const accept = async (bidding) => {
    alert("todo: call contract");
  };

  useEffect(() => {
    async function fetchBidding() {
      const bidding = (await api.get(`/bidding/${childERC721}/${tokenId}`)).data
        .bidding;
      setBidding(
        bidding.filter(
          (bidding) => bidding.borrower !== ethers.constants.AddressZero
        )
      );
    }
    fetchBidding();
  }, []);

  return (
    <div>
      {listed && (
        <div>
          <div className="flex flex-col gap-4 max-w-[686px] mb-5">
            <div className="flex flex-row w-full rounded-lg py-[24px] px-[32px] bg-[#2A2D3A] text-white">
              <div className="text-[16px] font-semibold flex-1">Duration</div>
              <div className="text-[16px] font-semibold ">7 DAYS</div>
            </div>
          </div>
          <div className="flex flex-col gap-4 max-w-[686px] mb-5">
            <div className="flex flex-row w-full rounded-lg py-[24px] px-[32px] bg-[#2A2D3A] text-white">
              <div className="text-[16px] font-semibold flex-1">
                Fee per day
              </div>
              <div className="text-[16px] font-semibold ">100 USDC</div>
            </div>
          </div>
          <div
            className="mt-8 w-full h-[81px] rounded-lg text-black text-[20px] font-semibold bg-polygreen flex items-center justify-center hover:cursor-pointer"
            onClick={() => list()}
          >
            <div className="text-center font-bold">
              {canRent ? "Rent Now" : "Cancel"}
            </div>
          </div>
        </div>
      )}
      {!listed && (
        <div>
          <div className="flex flex-row justify-between w-full h-[64px] rounded-lg border-2 border-polygreen text-polygreen p-4 mb-4">
            Rental Duration
            <div className="flex flex-row">
              <input
                type="text"
                value={duration}
                onChange={handleDurationChange}
                className="bg-transparent text-right placeholder-right"
              />
              <div
                className="text-slate-400 ml-2"
                style={{ marginTop: "2.2px" }}
              >
                DAYS
              </div>
            </div>
          </div>
          <div className="flex flex-row justify-between w-full h-[64px] rounded-lg border-2 border-polygreen text-polygreen p-4 mb-10">
            Price to Offer
            <div className="flex flex-row">
              <input
                type="text"
                value={feePerDay}
                onChange={handleFeePerDayChange}
                className="bg-transparent text-right placeholder-right"
              />
              <div
                className="text-slate-400 ml-2"
                style={{ marginTop: "2.2px" }}
              >
                USDC/DAY
              </div>
            </div>
          </div>

          {!bidding ||
            (bidding.length === 0 && (
              <div className="flex flex-col gap-4 max-w-[686px] mb-5">
                <div className="inline-block w-full rounded-lg py-[24px] px-[32px] bg-[#2A2D3A] text-white">
                  <div className="text-[16px] font-semibold ">
                    No Offers Yet
                  </div>
                </div>
              </div>
            ))}

          {bidding && bidding.length > 0 && (
            <div className="flex flex-col gap-4 max-w-[686px]">
              <div className="inline-block w-full rounded-lg py-[24px] px-[32px] bg-[#2A2D3A] text-white">
                <div className="text-[20px] font-bold mb-[16px]">Offers</div>
                <div className="flex flex-row pb-2">
                  <div className="w-1/4 text-center text-polygreen">From</div>
                  <div className="w-1/4 text-center text-polygreen">
                    Price per day
                  </div>
                  <div className="w-1/4 text-center text-polygreen">
                    Duration
                  </div>
                  <div className="w-1/4 text-center text-polygreen">Action</div>
                </div>
                <ul role="list" className="max-h-[150px] overflow-scroll">
                  {bidding &&
                    bidding.length > 0 &&
                    bidding.map((bidding) => (
                      <li>
                        <div className="flex flex-row justify-between pb-2">
                          <div className="w-1/4 text-center">
                            {trimmedAddress(bidding.borrower)}
                          </div>
                          <div className="w-1/4 text-center">
                            {calculateFeePerDay(bidding)} USDC
                          </div>
                          <div className="w-1/4 text-center">
                            {calculateDuration(bidding)} DAY
                          </div>
                          <div className="w-1/4 text-center">
                            <div
                              className="text-black text-[15px] font-semibold flex items-center justify-center hover:cursor-pointer"
                              onClick={() => accept(bidding)}
                            >
                              <div className="text-center font-bold bg-polygreen px-4 rounded-lg">
                                Accept
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}

          <div className="flex flex-row justify-between w-full h-[64px] rounded-lg border-2 border-polygreen text-polygreen p-4 mb-4 mt-4">
            Listing Duration
            <div className="flex flex-row">
              <input
                type="text"
                value={listingExpiration}
                onChange={handleListingExpirationChange}
                className="bg-transparent text-right placeholder-right"
              />
              <div
                className="text-slate-400 ml-2"
                style={{ marginTop: "2.2px" }}
              >
                DAYS
              </div>
            </div>
          </div>
          <div
            className="mt-8 w-full h-[81px] rounded-lg text-black text-[20px] font-semibold bg-polygreen flex items-center justify-center hover:cursor-pointer"
            onClick={() => list()}
          >
            <div className="text-center font-bold">List</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MarketContractPage() {
  const router = useRouter();
  const { contract: childERC721, id: tokenId } = router.query;

  const [goToRent, setGoToRent] = useState(false);

  const [childNftData, setChildNftData] = useState(null);
  const [rentalStatus, setRentalStatus] = useState("");

  const [rentalNow, setRentalNow] = useState(false);
  const [makeAnOffer, setMakeAnOffer] = useState(true);

  const [rentalDuration, setRentalDuration] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerDuration, setOfferDuration] = useState("");

  const [txSuccessModal, setTxSuccessModal] = useState(false);

  // "child": {
  //   "id": "bayc-sandbox-59",
  //     "platform": "Sandbox",
  //     "motherERC721": "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512",
  //     "motherERC721Name": "BAYC",
  //     "childERC721": "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9",
  //     "childERC721Name": "BAYCs",
  //     "tokenId": "59",
  //     "expiredAt": "0",
  //     "totalFee": "0",
  //     "metadata": {
  //     "image": "ipfs://QmZVPeWkiPxQ8qUgJDH1YBE7aCpC7CSLeB3LSTt9ttwLPW",
  //       "attributes": [
  //       {
  //         "trait_type": "Fur",
  //         "value": "Red"
  //       },
  //       {
  //         "trait_type": "Mouth",
  //         "value": "Phoneme Wah"
  //       },
  //       {
  //         "trait_type": "Clothes",
  //         "value": "Navy Striped Tee"
  //       },
  //       {
  //         "trait_type": "Background",
  //         "value": "Gray"
  //       },
  //       {
  //         "trait_type": "Eyes",
  //         "value": "Wide Eyed"
  //       }
  //     ]
  //   }
  // }

  function handleRentalDurationChange(event) {
    console.log("test");
    setRentalDuration(event.target.value);
  }

  function handlePriceOfferChange(event) {
    setOfferPrice(event.target.value);
  }

  function handleOfferDurationChange(event) {
    setOfferDuration(event.target.value);
  }

  useEffect(() => {
    window.ethereum.on("accountsChanged", function (accounts) {
      // Time to reload your interface with accounts[0]!
      if (Router) Router.push("/market");
    });

    const _setRentalStatus = (item) => {
      if (item?.expiredAt !== "0") setRentalStatus("Renting");
      else {
        if (!item?.duration) setRentalStatus("NotListed");
        else setRentalStatus("Listed");
      }
    };

    async function fetchChildNftData() {
      const response = await api.get(`/child/${childERC721}/${tokenId}`);
      const childNftData = response.data.child;

      setChildNftData(childNftData);
      _setRentalStatus(childNftData);
    }

    fetchChildNftData();
  }, [childERC721, tokenId]);

  async function signBiddingInfo(data) {
    try {
      // Request user's Ethereum provider
      const metaMaskProvider = new ethers.providers.Web3Provider(
        window.ethereum
      );
      console.log("metamaskProvider-->", metaMaskProvider);

      // Request access to the user's MetaMask account
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const signer = metaMaskProvider.getSigner();

      const signature = await signer.signMessage(data);

      console.log("signature from Metamask-->", signature);

      return signature;
    } catch (e) {
      throw Error(err.message);
    }
  }

  async function handleMakeOfferButton() {
    const metaMaskProvider = new ethers.providers.Web3Provider(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const signer = metaMaskProvider.getSigner();
    const ethAddress = await signer.getAddress();

    const biddingInfo = {
      lender: "0x0000000000000000000000000000000000000000",
      borrower: ethAddress,
      erc721: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
      tokenId: 0,
      erc20: "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44",
      amount: 100,
      listingExpiration: 0,
      biddingExpiration: 1677885051,
      duration: 86400,
    };
    const result = await signBiddingInfo(signer, biddingInfo);
    const response = await api.get("/bidding", result);
  }

  async function signBiddingInfo(signer, bidding) {
    try {
      const biddingPacked = ethers.utils.solidityPack(
        [
          "address", // lender
          "address", // borrower
          "address", // erc721
          "uint256", // tokenId
          "address", // erc20
          "uint256", // amount
          "uint256", // listingExpiration
          "uint256", // biddingExpiration
          "uint256", // duration
        ],
        [
          bidding.lender,
          bidding.borrower,
          bidding.erc721,
          bidding.tokenId,
          bidding.erc20,
          bidding.amount,
          bidding.listingExpiration,
          bidding.biddingExpiration,
          bidding.duration,
        ]
      );
      const biddingHash = ethers.utils.solidityKeccak256(
        ["bytes"],
        [biddingPacked]
      );
      const signature = await signer.signMessage(
        ethers.utils.arrayify(biddingHash)
      );
      return {
        ...bidding,
        signature,
      };
    } catch (e) {
      throw Error(err.message);
    }
  }

  const colorByPlatform = {
    Decentraland: "bg-yellow-700",
    Sandbox: "bg-blue-700",
    Xociety: "bg-emerald-700",
  };

  function getPlatformBgColor(platform) {
    return colorByPlatform[platform];
  }
  const bgColorClass = getPlatformBgColor(childNftData?.platform);

  return (
    <>
      <div
        className="relative mx-auto flex max-w-[1437px] justify-center sm:px-2
         lg:px-8 xl:px-12"
      >
        {txSuccessModal && (
          <>
            <div className="fixed z-10 inset-0 bg-black opacity-50"></div>
            <div className="fixed z-10 inset-0 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen">
                <div className="flex items-center justify-center bg-[#24252D] w-[586px] h-[492px] rounded-lg">
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-polygreen text-[24px] font-semibold">
                      Transaction Success!
                    </div>
                    <div>
                      <img
                        src={tempChildImg.src}
                        className="w-[212px] h-[223px] object-cover object-center"
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-white text-[16px]">
                        You successfully claimed
                      </div>
                      <div className="text-polygreen text-[16px]">00.00ETH</div>
                    </div>
                    <div>
                      <div
                        className="w-[146px] h-[40px] rounded-lg text-black text-[20px] font-semibold bg-polygreen flex items-center justify-center hover:cursor-pointer"
                        onClick={() => setTxSuccessModal(false)}
                      >
                        <div className="text-center font-bold">Close</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        <div className="mx-auto flex flex-col gap-8 px-4 md:px-8 mb-32">
          <div className="flex flex-col gap-4 md:flex-row md:gap-16">
            {childNftData && (
              <>
                {/* left layout */}
                <div className="flex flex-col gap-4 md:w-[45%]">
                  {/*platform name*/}
                  <div
                    className={`flex rounded-lg px-6 text-white w-full h-[57px] ${bgColorClass} text-[24px] font-semibold justify-center items-center`}
                  >
                    <div className="text-center">
                      {childNftData?.platform || "Sandbox"}
                    </div>
                  </div>
                  <div className="flex aspect-square flex-row items-center justify-center overflow-hidden rounded-lg mt-2">
                    <img
                      src={`/bayc/${childNftData?.tokenId}.png`}
                      className="h-full w-full object-cover object-center"
                    />
                    {/* <img
                      src={`/bayc/15.png`}
                      className="h-full w-full object-cover object-center"
                    /> */}
                  </div>
                </div>

                {/* right layout */}
                <div className="flex grow flex-col gap-[24px]">
                  <div>
                    {/* General Info */}
                    <div className="flex flex-row items-center w-full text-white">
                      {/* Mother ERC721 meatdata */}
                      <div className="flex flex-col gap-2 w-full text-[14px]">
                        <div className="flex flex-row w-full justify-between">
                          <div>
                            <span className="font-semibold mr-1">
                              {childNftData?.motherERC721Name}:
                            </span>
                            <a className="text-polygreen">
                              {trimmedAddress(childNftData?.motherERC721)}
                            </a>
                          </div>
                          <div>
                            <span className="font-semibold mr-1">owner:</span>
                            <a className="text-polygreen">
                              {trimmedAddress(
                                "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" // todo: use lender address
                              )}
                            </a>
                          </div>
                        </div>
                        <div className="flex flex-row items-center gap-2 text-[28px] font-semibold leading-[42px] -mt-1">
                          <div>{childNftData?.childERC721Name}</div>
                          <div>{`#${childNftData?.tokenId}`}</div>
                        </div>
                      </div>
                    </div>
                    {/* Description box */}
                    <div className="flex flex-col gap-4 max-w-[686px] mt-4">
                      <div className="inline-block w-full rounded-lg py-[24px] px-[32px] bg-[#2A2D3A] text-white">
                        <div className="flex w-full flex-col items-center justify-center">
                          <div className="flex flex-row w-full justify-between">
                            <div>Description</div>
                            <div className="flex flex-row">
                              <div className="flex flex-col">
                                <div className="flex flex-col text-right">
                                  <div>Mother NFT FP</div>
                                  <div className="text-polygreen font-bold">
                                    70 ETH
                                  </div>
                                </div>
                              </div>
                              <img
                                src={`/bayc/15-mom.png`}
                                className="ml-4 w-[50px] h-[50px] rounded-full"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex w-full flex-col items-center justify-center">
                          <span className="pt-[17px]">
                            Lorem ipsum dolor sit amet, consectetur adipisicing
                            elit. Aliquid amet animi consectetur delectus
                            deleniti doloremque dolores eaque earum, inventore
                            iusto laborum nisi nostrum obcaecati praesentium
                            quam quod saepe vel vero?
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* ================================================================================================================================================================== */}
                  {goToRent && (
                    <MakeOfferByNotOwner
                      childERC721={childERC721}
                      tokenId={tokenId}
                    />
                  )}
                  {!goToRent && (
                    <ListByOwner childERC721={childERC721} tokenId={tokenId} />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
