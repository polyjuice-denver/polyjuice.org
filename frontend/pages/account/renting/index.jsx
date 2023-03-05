import {useEffect, useState, Fragment} from 'react';
import {Dialog, Transition} from '@headlessui/react';
import api from '../../../util/api';
import Chip from '../../../components/Chip';
import Router from 'next/router';
import {classNames} from '../../../util/css';
import tempBaycChildImg from '../bayc_child_1_temp.png';


const subNav = [
  {id: 1, name: 'Lending', path: '/account/lending'},
  {id: 2, name: 'Renting', path: '/account/renting', selected: true, profile: true},
  {id: 3, name: 'My wallet', path: '/account'},
];

export default function MyRentingPage() {
  const [result, setResult] = useState([{
    "id": "bayc-sandbox-15",
    "platform": "Sandbox",
    "motherERC721": "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512",
    "motherERC721Name": "BAYC",
    "childERC721": "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9",
    "childERC721Name": "BAYCs",
    "tokenId": "15",
    "expiredAt": "0",
    "totalFee": "0",
    "metadata": "{\"image\":\"ipfs://QmeGWaFNJyVpkr1LmkKye7qfUGwK9jTRW2sMxKnMDrJKtr\",\"attributes\":[{\"trait_type\":\"Background\",\"value\":\"Gray\"},{\"trait_type\":\"Fur\",\"value\":\"Gray\"},{\"trait_type\":\"Eyes\",\"value\":\"Zombie\"},{\"trait_type\":\"Mouth\",\"value\":\"Phoneme L\"},{\"trait_type\":\"Clothes\",\"value\":\"Black T\"},{\"trait_type\":\"Hat\",\"value\":\"Girl's Hair Pink\"}]}",
    "duration": null,
    "amount": null
  }]);
  const [navId, setNavId] = useState(3);

  function handleNavBtn(item) {
    Router.push(item.path)
  }
  
  function NftCardInLending({item}) {
    const colorByPlatform = {
      Decentraland: "bg-yellow-700",
      Sandbox: "bg-blue-700",
      Xociety: "bg-emerald-700",
    };
    
    function getPlatformBgColor(platform) {
      return colorByPlatform[platform];
    }
    
    const bgColorClass = getPlatformBgColor(item.platform);
    
    return (
      <>
        <div key={item.id} className={classNames(
          item.selected ? 'border-4 border-polygreen rounded-lg' : '',
          'w-[233px] h-[325px] mx-auto cursor-pointer',
        )}>
          <div
            className="relative bg-[#2A2D3A] w-[225px] h-full p-1 rounded-lg mx-auto">
            <div
              className="relative w-full h-[213px] overflow-hidden rounded-lg mx-auto">
              {/*<img*/}
              {/*  src={extractImgUrl(item)}*/}
              {/*  className="h-full w-full object-cover object-center"*/}
              {/*/>*/}
              <img
                src={tempBaycChildImg.src}
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div className="absolute top-0 left-0 h-72 p-[6px] h-[34px]">
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0" />
              <p
                className={`relative font-inter font-normal text-[14px] text-white rounded-lg ${bgColorClass} bg-opacity-90 px-3`}
              >
                {item.platform}
              </p>
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
              <div className="grid grid-cols-2 mt-[14px]">
                <div className="text-polygreen text-[12px] leading-[14px] mb-1">
                  Duration
                </div>
                <div className="text-polygreen text-[12px] leading-[14px] mb-1">
                  Price/days
                </div>
                <div className="text-[16px] leading-[18px] text-white">
                  {Math.ceil(item.duration / 86400)} days
                </div>
                <div className="text-[16px] leading-[18px] text-white">{item.amount} USDC</div>
              </div>
            </div>
          
          </div>
        
        </div>
      </>
    );
    
  }
  
  useEffect(() => {
    // async function fetchMarketData() {
    //   const response = await api.get('/child/market');
    //   const marketResponse = response.data.market;
    //   setResult(marketResponse);
    // }
    // console.log('marketResponse', marketResponse)
    // fetchMarketData();
  }, []);
  
  return (
    <>
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-row items-center justify-center mb-10">
          {subNav.map((item) => (
            <div className="w-[126px]" onClick={() => handleNavBtn(item)}>
              <Chip item={item}/>
            </div>
          ))
          }
        </div>
        
        {result && (
          <div className="grid grid-cols-4 gap-y-10">
            {result.map((item) => (
              <NftCardInLending item={item}/>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
