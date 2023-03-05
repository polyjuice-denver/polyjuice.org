import {classNames} from '../util/css';
import tempImage from '../pages/market/product-01.jpg';
import Router from 'next/router';

function NftSmallCard({item}) {
  
  const colorByPlatform = {
    decentraland: "#8E5500",
    sandbox: "#6C005B",
    xociety: "#00591A",
  }
  function getPlatformBgColor(platform) {
    return colorByPlatform[platform];
  }
  
  function handleNftCardClick(item) {
    console.log('handleNftCardClick')
    Router.push(`/market/${item.childERC721}/${item.tokenId}`);
  }
  
  const bgColorClass = getPlatformBgColor(item.platform);
  return(
    <>
      <div key={item.id} className={classNames(
        item.selected ? "border-4 border-polygreen rounded-lg" : "", "w-[233px] h-[327px] mx-auto cursor-pointer"
      )} onClick={() => handleNftCardClick(item)}>
        <div className="relative bg-[#2A2D3A] w-[225px] h-full p-1 rounded-lg mx-auto">
          <div className="relative w-full h-[213px] overflow-hidden rounded-lg mx-auto">
            {/*<img*/}
            {/*  src={extractImgUrl(item)}*/}
            {/*  className="h-full w-full object-cover object-center"*/}
            {/*/>*/}
            <img
              src={tempImage.src}
              className="h-full w-full object-cover object-center"
            />
          </div>
          <div className="absolute top-0 left-0 h-72 p-[6px] h-[34px]">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0"
            />
            <p className={`relative font-inter font-normal text-[14px] text-white rounded-lg bg-[${bgColorClass}] bg-opacity-90 px-3`}>
              {/*{colorByPlatform[`'${item.platform}'`] || '플랫폼이름'}*/}
              {item.platform}
            </p>
          </div>
          <div className="pt-[8px] mx-[10px]">
            <div>
              <div className="text-[12px] leading-[14px]">
                {item.motherERC721Name}
              </div>
              <div className="text-[18px] leading-[20px]">
                <div className="flex flex-row">
                  <div className="mr-1">
                    {item.childERC721Name}
                  </div>
                  <div>
                    #{item.tokenId}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 mt-[14px]">
              <div className="text-polygreen text-[12px] leading-[14px]">Duration</div>
              <div className="text-polygreen text-[12px] leading-[14px]">Price</div>
              <div className="text-[16px] leading-[18px]">3 Days</div>
              <div className="text-[16px] leading-[18px]">1.5 ETH</div>
            </div>
          </div>
        </div>
      
      </div>
    </>
  )
  
}
