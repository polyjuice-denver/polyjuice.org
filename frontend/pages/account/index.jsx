import {useEffect, useState, Fragment} from 'react';
import {Dialog, Transition} from '@headlessui/react';
import api from '../../util/api';
import Chip from '../../components/Chip';
import Router from 'next/router';
import {classNames} from '../../util/css';
import tempBaycMotherImage from './bayc_mother_temp.png';
import tempBaycChildImage0 from './bayc_child_0_temp.png';
import tempBaycChildImage1 from './bayc_child_1_temp.png';
import tempBaycChildImage2 from './bayc_child_2_temp.png';
import {CheckIcon} from '@heroicons/react/24/outline';

const subNav = [
  {id: 1, name: 'Lending'},
  {id: 2, name: 'Ranking'},
  {id: 3, name: 'My wallet', selected: true, profile: true},
];

export default function MyPortionPage() {
  const [result, setResult] = useState([]);
  const [navId, setNavId] = useState(3);
  const [childNftModal, setChildNftModal] = useState(false);
  const [selectedMotherNft, setSelectedMotherNft] = useState(null);
  const [selectedMotherNftsChildNfts, setSelectedMotherNftsChildNfts] = useState(
    []);
  
  function MotherNftCard({item}) {
    const colorByPlatform = {
      Decentraland: "bg-yellow-700",
      Sandbox: "bg-blue-700",
      Xociety: "bg-emerald-700",
    };
    
    function getPlatformBgColor(platform) {
      return colorByPlatform[platform];
    }
    
    async function handleMotherNftCardClick(item) {
      console.log('handleNftCardClick');
      setChildNftModal(true);
      setSelectedMotherNft(item);
      
      const response = await api.get(`/child/mother/${item.motherERC721}/${item.tokenId}`)
      const childNftData = response?.data?.child;
      setSelectedMotherNftsChildNfts(childNftData);
      console.log('childNftData', childNftData)
    }
    
    const bgColorClass = getPlatformBgColor(item.platform);
    
    return (
      <>
        <div key={item.id} className={classNames(
          item.selected ? 'border-4 border-polygreen rounded-lg' : '',
          'w-[233px] h-[277px] mx-auto cursor-pointer',
        )} onClick={() => handleMotherNftCardClick(item)}>
          <div
            className="relative bg-[#2A2D3A] w-[225px] h-full p-1 rounded-lg mx-auto">
            <div
              className="relative w-full h-[213px] overflow-hidden rounded-lg mx-auto">
              {/*<img*/}
              {/*  src={extractImgUrl(item)}*/}
              {/*  className="h-full w-full object-cover object-center"*/}
              {/*/>*/}
              <img
                src={tempBaycMotherImage.src}
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div className="pt-[8px] mx-[10px]">
              <div className="text-white">
                <div className="text-[12px] leading-[14px]">
                  {item.motherERC721Name}
                </div>
                <div className="text-[18px] leading-[20px]">
                  <div className="flex flex-row">
                    <div className="mr-1">
                      {item.motherERC721Name}
                    </div>
                    <div>
                      #{item.tokenId}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        
        </div>
      </>
    );
    
  }
  
  function NftCardForLend({item, index}) {

    const colorByPlatform = {
      Decentraland: "bg-yellow-700",
      Sandbox: "bg-blue-700",
      Xociety: "bg-emerald-700",
    };
  
    function getPlatformBgColor(platform) {
      return colorByPlatform[platform];
    }
  
    const bgColorClass = getPlatformBgColor(item.platform);
    
    let fakeImage;
    
    switch (index) {
      case 0:
        fakeImage = <img
          src={tempBaycChildImage0.src}
          className="h-full w-full object-cover object-center"
        />
        break;
      case 1:
        fakeImage = <img
          src={tempBaycChildImage1.src}
          className="h-full w-full object-cover object-center"
        />
        break;
      case 2:
        fakeImage = <img
          src={tempBaycChildImage2.src}
          className="h-full w-full object-cover object-center"
        />
        break;
      default:
        fakeImage = <img
          src={tempBaycChildImage0.src}
          className="h-full w-full object-cover object-center"
        />
    }
    function handleLendBtn(item) {
      console.log('handleLendClick')
      Router.push(`/market/${item.childERC721}/${item.tokenId}`);
    }

    return (
      <>
        <div key={item.id} className={classNames(
          item.selected ? 'border-4 border-polygreen rounded-lg' : '',
          'w-[233px] h-[277px] mx-auto cursor-pointer',
        )}>
          <div
            className="relative bg-[#2A2D3A] w-[225px] h-full p-1 rounded-lg mx-auto">
            <div
              className="relative w-full h-[213px] overflow-hidden rounded-lg mx-auto">
              {fakeImage}
            </div>
            <div className="absolute top-0 left-0 h-72 p-[6px] h-[34px]">
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0" />
              <p
                className={`relative font-inter font-normal text-[14px] text-white rounded-lg ${bgColorClass} bg-opacity-90 px-3`}
              >
                {item.platform}
                {/*{item.platform}*/}
              </p>
            </div>
            <div className="pt-[8px] mx-[10px]">
              <div className="w-[201px] h-[41px] rounded-lg border-2 border-polygreen text-[14px] text-polygreen font-semibold hover:bg-polygreen hover:text-black flex items-center justify-center" onClick={() => handleLendBtn(item)}>
                <div className="text-center">
                  Lend
                </div>
              </div>
            </div>
          </div>
        
        </div>
      </>
    );
    
  }
  useEffect(() => {
    async function fetchMarketData() {
      const response = await api.get('/child/market');
      const marketResponse = response.data.market;
      setResult(marketResponse);
    }
    fetchMarketData();
  }, []);
  
  return (
    <>
      {childNftModal && (
        <>
          <div className="fixed z-10 inset-0 bg-black opacity-50"
          >
          </div>
          <div className="fixed z-10 inset-0 overflow-y-auto">

              <div className="flex items-center justify-center min-h-screen">
                <div className="relative">
                  <div className="absolute top-0 right-0 p-4 cursor-pointer" onClick={() => setChildNftModal(false)}>
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                  <div
                    className="flex items-center justify-center bg-[#24252D] w-[1392px] h-[450px] rounded-lg border-2 border-polygreen">
                    <div className="w-[1148px] h-[389px]">
                      <div className="flex h-full">
        
                        {/*width 453px%*/}
                        <div className="w-[233px] flex items-center justify-center">
                          <MotherNftCard item={selectedMotherNft}/>
                        </div>
                        <div className="w-[96px] flex items-center justify-center">
                        </div>
                        <div
                          className="w-[819px] bg-[#191A24] flex items-center justify-center rounded-lg">
                          <div>
                            <div className="text-white mb-2">
                              Select a child NFT to lend
                            </div>
                            <div className="flex flex-row">
                              {selectedMotherNftsChildNfts && (
                                selectedMotherNftsChildNfts.map((item, index) => (
                                  <NftCardForLend item={item} index={index}/>
                                ))
                              )}
                            </div>
                          </div>
        
                        </div>
      
      
                      </div>
    
    
                    </div>
  
  
  
                  </div>
                  
                </div>
                

              </div>
          </div>
        </>
      )}
    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="flex flex-row items-center justify-center mb-10">
        {subNav.map((item) => (
          <div className="w-[126px]">
            <Chip item={item}/>
          </div>
        ))
        }
      </div>
  
      {result && (
        <div className="grid grid-cols-4 gap-y-10">
          {result.map((item) => (
            <MotherNftCard item={item}/>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
