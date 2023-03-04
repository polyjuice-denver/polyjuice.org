import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import tempChildNftImage from './temp_child_nft.png';
import tempMotherNftImage from './temp_mother_nft.png';
import {ethers} from 'ethers';
import api from '../../../util/api';
import {trimmedAddress} from '../../../util/string';
export default function MarketContractPage() {
  const router = useRouter();
  const { contract: childERC721, id: tokenId } = router.query;
  
  const [childNftData, setChildNftData] = useState(null)
  
  const [rentalNow, setRentalNow] = useState(false);
  const [makeAnOffer, setMakeAnOffer] = useState(true);
  
  const [rentalDuration, setRentalDuration] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [offerDuration, setOfferDuration] = useState('');
  
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
    setRentalDuration(event.target.value);
  }
  
  function handlePriceOfferChange(event) {
    setOfferPrice(event.target.value);
  }
  
  function handleOfferDurationChange(event) {
    setOfferDuration(event.target.value);
  }
  
  useEffect(() => {
    async function fetchChildNftData() {
      console.log('fetchChildNftData!!!!!!!!!')
      const response = await api.get(`/child/${childERC721}/${tokenId}`)
      console.log('response-->', response);
      const childNftData = response.data.child;
      console.log('childNftData-->', childNftData);
      setChildNftData(childNftData)
    }
    fetchChildNftData()
    // TODO: 해당 NFT 정보요청
    
  }, [childERC721, tokenId]);
  
  async function signBiddingInfo(data) {
    try {
      // Request user's Ethereum provider
      const metaMaskProvider = new ethers.providers.Web3Provider(
        window.ethereum
      );
      console.log('metamaskProvider-->', metaMaskProvider);

      // Request access to the user's MetaMask account
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const signer = metaMaskProvider.getSigner();

      const signature = await signer.signMessage(data);

      console.log(
        'signature from Metamask-->',
        signature
      );

      return signature;
    } catch (e) {

      throw Error(err.message);
    }
  }
  
  async function handleMakeOfferButton() {
    const metaMaskProvider = new ethers.providers.Web3Provider(
      window.ethereum
    );
    await window.ethereum.request({ method: 'eth_requestAccounts' });
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
    }
    const result = await signBiddingInfo(signer, biddingInfo);
    const response = await api.get('/bidding', result)
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
  
  return(
    <>
      <div
        className="relative mx-auto flex max-w-[1437px] justify-center sm:px-2
         lg:px-8 xl:px-12">
        <div className="mx-auto flex flex-col gap-8 px-4 md:px-8 mb-32">
          <div className="flex flex-col gap-4 md:flex-row md:gap-16">
            
            {childNftData && (
              <>
                {/* left layout */}
                <div className="flex flex-col gap-4 md:w-[45%]">
                  {/*platform name*/}
                  <div className="flex rounded-lg px-6 text-white w-full h-[57px] bg-[#2603FB] text-[24px] font-semibold justify-center items-center">
                    <div className="text-center">{childNftData?.platform || 'Sendbox'}</div>
    
                  </div>
                  <div className="flex aspect-square flex-row items-center justify-center overflow-hidden rounded-lg">
                    <img
                      src={tempChildNftImage.src}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                </div>
  
                {/* right layout */}
                <div className="flex grow flex-col gap-[24px]">
                  {/* General Info */}
                  <div className="flex flex-row items-center w-full text-white">
      
      
                    {/* Mother ERC721 meatdata */}
                    <div className="flex flex-col gap-2 w-full text-[14px]">
                      <div className="flex flex-row w-full justify-between">
                        <div>
                          <span className="font-semibold mr-1">{childNftData?.motherERC721Name || 'BAYC'}</span>
                          <span className="mr-1">ERC-721</span>
                          <span className="mr-1">・</span>
                          <a className="text-polygreen">{trimmedAddress(childNftData?.motherERC721)}</a>
                        </div>
                        <div>
                          {/*TODO*/}
                          <span className="pr-3">Lender</span>
                          <a className="text-polygreen">0x....kew3</a>
                        </div>
                      </div>
                      <div className="flex flex-row items-center gap-2 text-[28px] font-semibold leading-[42px]">
                        <div>{childNftData?.childERC721Name}</div>
                        <div>{`#${childNftData?.tokenId}`}</div>
                      </div>
                    </div>
                  </div>
                  {/* Description box */}
                  <div className="flex flex-col gap-4 max-w-[686px]">
                    <div className="inline-block w-full rounded-lg py-[24px] px-[32px] bg-[#2A2D3A] text-white">
                      <div className="flex w-full flex-col items-center justify-center">
                        <div className="flex flex-row w-full justify-between">
                          <div>
                            Description
                          </div>
                          <div className="flex flex-row">
                            <div className="flex flex-col">
                              <div className="flex flex-col text-right">
                                <div>Mother NFT FP</div>
                                <div className="text-polygreen font-bold">1.3 ETH</div>
                              </div>
                            </div>
                            <img
                              src={tempMotherNftImage.src}
                              className="ml-4 w-[50px] h-[50px] rounded-full"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex w-full flex-col items-center justify-center">
                    <span className="pt-[17px]">
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid amet animi consectetur delectus deleniti doloremque dolores eaque earum, inventore iusto laborum nisi nostrum obcaecati praesentium quam quod saepe vel vero?
                    </span>
                      </div>
                    </div>
                  </div>
    
                  {/* Rental Duration */}
                  <div>
                    <div className="flex flex-row justify-between w-full h-[64px] rounded-lg border-2 border-polygreen text-polygreen p-4 justify-center">
                      Rental Duration
                      <input type="text" value={rentalDuration} onChange={handleRentalDurationChange} className="bg-transparent text-right placeholder-right" placeholder="DAYS"/>
                    </div>
                    { rentalNow && (
                      <div className="flex flex-row justify-end mr-5 mt-2">
                        <div className="text-white">Max Duration</div>
                        <div className="text-polygreen ml-5">5 Days</div>
                      </div>
                    )}
                  </div>
  
                  { rentalNow && (
                    <>
                      {/* daily price & total price */}
                      <div className="flex w-full h-[64px] gap-3">
                        <div className="w-1/2">
                          <div className="flex flex-row justify-between w-full h-[64px] bg-[#2A2D3A] text-white p-4 justify-center items-center rounded-lg">
                            Daily Price
                            <input type="text" value={rentalDuration} onChange={handleRentalDurationChange} className="bg-transparent text-right placeholder-right" placeholder="DAYS"/>
                          </div>
                        </div>

                        <div className="w-1/2 ">
                          <div className="flex flex-row justify-between w-full h-[64px] bg-[#2A2D3A] text-white p-4 justify-center items-center rounded-lg">
                            Total Price
                            <input type="text" value={rentalDuration} onChange={handleRentalDurationChange} className="bg-transparent text-right placeholder-right" placeholder="DAYS"/>
                          </div>
                          
                        </div>
                      </div>
                    
                    </>
                  )}

    
                  { makeAnOffer && (
                    <>
                      {/* Price to Offer box */}
                      <div className="flex flex-row justify-between w-full h-[64px] rounded-lg border-2 border-polygreen text-polygreen p-4 justify-center">
                        Price to Offer
                        <input type="text" value={offerPrice} onChange={handlePriceOfferChange} className="bg-transparent text-right placeholder-right" placeholder="USC/DAY"/>
                      </div>
                      <div className="grid grid-cols-2 text-white">
                        <div className="p-2">
                          <div className="flex flex-row justify-between">
                            <div>Best Offer</div>
                            <div className="text-polygreen">1.23USC</div>
                          </div>
                        </div>
                        <div className="p-2">
                          <div className="flex flex-row justify-between">
                            <div>You will pan in total</div>
                            <div className="text-polygreen">1.23USC</div>
                          </div>
                        </div>
                        <div className="p-2"></div>
                        <div className="p-2">
                          <div className="flex flex-row justify-between">
                            <div>Your wallet balance</div>
                            <div className="text-polygreen">1.23USC</div>
                          </div>
                        </div>
                      </div>
                      {/* Offers box */}
                      <div className="flex flex-col gap-4 max-w-[686px]">
                        <div className="inline-block w-full rounded-lg py-[24px] px-[32px] bg-[#2A2D3A] text-white">
                          <div className="text-[16px] font-semibold mb-[16px]">
                            Offers
                          </div>
                          <div className="flex flex-row pb-2">
                            <div className="w-1/4">Price offer</div>
                            <div className="w-1/4">Expiration</div>
                            <div className="w-1/4">Rental duration</div>
                            <div className="w-1/4">From</div>
                          </div>
                          <ul role="list" className="max-h-[150px] overflow-scroll">
                            <li>
                              <div className="flex flex-row justify-between pb-2">
                                <div className="w-1/4">0.00USC</div>
                                <div className="w-1/4">in 11 minutes</div>
                                <div className="w-1/4">3 days</div>
                                <div className="w-1/4">E8119F</div>
                              </div>
                            </li>
                            <li>
                              <div className="flex flex-row justify-between pb-2">
                                <div className="w-1/4">0.00USC</div>
                                <div className="w-1/4">in 11 minutes</div>
                                <div className="w-1/4">3 days</div>
                                <div className="w-1/4">E8119F</div>
                              </div>
                            </li>
                            <li>
                              <div className="flex flex-row justify-between pb-2">
                                <div className="w-1/4">0.00USC</div>
                                <div className="w-1/4">in 11 minutes</div>
                                <div className="w-1/4">3 days</div>
                                <div className="w-1/4">E8119F</div>
                              </div>
                            </li>
                            <li>
                              <div className="flex flex-row justify-between pb-2">
                                <div className="w-1/4">0.00USC</div>
                                <div className="w-1/4">in 11 minutes</div>
                                <div className="w-1/4">3 days</div>
                                <div className="w-1/4">E8119F</div>
                              </div>
                            </li>
                            <li>
                              <div className="flex flex-row justify-between pb-2">
                                <div className="w-1/4">0.00USC</div>
                                <div className="w-1/4">in 11 minutes</div>
                                <div className="w-1/4">3 days</div>
                                <div className="w-1/4">E8119F</div>
                              </div>
                            </li>
                            <li>
                              <div className="flex flex-row justify-between pb-2">
                                <div className="w-1/4">0.00USC</div>
                                <div className="w-1/4">in 11 minutes</div>
                                <div className="w-1/4">3 days</div>
                                <div className="w-1/4">E8119F</div>
                              </div>
                            </li>
                            <li>
                              <div className="flex flex-row justify-between pb-2">
                                <div className="w-1/4">0.00US</div>
                                <div className="w-1/4">in 11 minutes</div>
                                <div className="w-1/4">3 days</div>
                                <div className="w-1/4">E8119F</div>
                              </div>
                            </li>
                            <li>
                              <div className="flex flex-row justify-between pb-2">
                                <div className="w-1/4">0.00ETH</div>
                                <div className="w-1/4">in 11 minutes</div>
                                <div className="w-1/4">3 days</div>
                                <div className="w-1/4">E8119F</div>
                              </div>
                            </li>
                            <li>
                              <div className="flex flex-row justify-between pb-2">
                                <div className="w-1/4">0.00ETH</div>
                                <div className="w-1/4">in 11 minutes</div>
                                <div className="w-1/4">3 days</div>
                                <div className="w-1/4">E8119F</div>
                              </div>
                            </li>
                            <li>
                              <div className="flex flex-row justify-between pb-2">
                                <div className="w-1/4">0.00ETH</div>
                                <div className="w-1/4">in 11 minutes</div>
                                <div className="w-1/4">3 days</div>
                                <div className="w-1/4">E8119F</div>
                              </div>
                            </li>
                          </ul>
          
                        </div>
                      </div>
        
                      {/* Offer Duration box */}
                      <div className="flex flex-row justify-between w-full h-[64px] rounded-lg border-2 border-polygreen text-polygreen p-4 justify-center">
                        Offer Duration
                        <input type="text" value={offerDuration} onChange={handleOfferDurationChange} className="bg-transparent text-right placeholder-right" placeholder="USC"/>
                      </div>
      
                    </>
                  )}
    
                  {/* Execution button */}
                  <div className="w-full h-[81px] rounded-lg text-black text-[14px] font-semibold bg-polygreen flex items-center justify-center">
                    <div className="text-center">{
                      makeAnOffer ? 'Make Offer' : 'Rent Now'
                    }</div>
                  </div>
                </div>

              </>
            )}
          </div>
        
        </div>
      
      </div>
    </>
  )
  
  
}
