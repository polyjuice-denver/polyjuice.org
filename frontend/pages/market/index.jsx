import Chip from "../../components/Chip";
import { MagnifyingGlassIcon, StarIcon } from "@heroicons/react/20/solid";
import tempImage from "./product-01.jpg";
import { useEffect, useState } from "react";
import { RadioGroup } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { classNames } from "../../util/css";
import api from "../../util/api";
import Image from "next/image";
import Router from "next/router";
import dummy from "../../dummy.json";

function generateId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

// todo: amount should be divided by days.

export default function MarketPage() {
  const filtersInitialValue = [
    { id: 1, name: "Sandbox", category: "platform", selected: false },
    { id: 2, name: "Decentraland", category: "platform", selected: false },
    { id: 3, name: "Xociety", category: "platform", selected: false },
    { id: 6, name: "BAYC", category: "collection", selected: false },
    {
      id: 5,
      name: "Azuki(Coming soon)",
      category: "collection",
      selected: false,
    },
    {
      id: 7,
      name: "Doodles(Coming soon)",
      category: "collection",
      selected: false,
    },
  ];

  const [filters, setFilters] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [result, setResult] = useState([]);

  useEffect(() => {
    setFilters(filtersInitialValue);
    async function fetchMarketData() {
      // const response = await api.get("/child/market");
      // const marketResponse = response.data.market;
      // setResult(marketResponse);
      setResult(dummy.market);
    }
    fetchMarketData();
  }, []);

  function extractImgUrl(item) {
    const jsonString = item.metadata;
    const parsedObject = JSON.parse(jsonString);
    const ipfsLink = parsedObject.image;
    const cid = ipfsLink.replace("ipfs://", "");
    return `https://gateway.pinata.cloud/ipfs/${cid}/`;
  }

  function handleFilterClick(filter) {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter((f) => f !== filter));
      filter.selected = false;
    } else {
      setSelectedFilters([...selectedFilters, filter]);
      filter.selected = true;
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

  function handleNftCardClick(item) {
    Router.push(`/market/${item.childERC721}/${item.tokenId}`);
  }

  function Listed({ duration, amount }) {
    return (
      <div className="grid grid-cols-2 mt-[14px]">
        <div className="text-polygreen text-[12px] leading-[14px] mb-1">
          Duration
        </div>
        <div className="text-polygreen text-[12px] leading-[14px] mb-1">
          Price/days
        </div>
        <div className="text-[16px] leading-[18px]">
          {Math.ceil(duration / 86400)} days
        </div>
        <div className="text-[16px] leading-[18px]">{amount} USDC</div>
      </div>
    );
  }

  function NotListed() {
    return (
      <div className="grid grid-cols-1 mt-[14px]">
        <div className="text-polygreen text-[12px] leading-[14px] mb-1">
          Not listed
        </div>
        <div className="text-[16px] leading-[18px]">Make Offer</div>
      </div>
    );
  }

  function Renting({ expiredAt }) {
    const now = Math.floor(new Date() / 1000);
    const remainingDays =
      expiredAt <= now ? 0 : Math.ceil(Math.ceil(expiredAt - now) / 86400); // 86400 seconds in a day

    return (
      <div className="grid grid-cols-1 mt-[14px]">
        <div className="text-polygreen text-[12px] leading-[14px] mb-1">
          Available in
        </div>
        <div className="flex flex-row">
          <div className="flex-1 text-[16px] leading-[18px]">
            {remainingDays} Days
          </div>
          <div className="text-xs px-3 py-1 text-black bg-polygreen rounded-3xl -mt-1 font-bold">
            Renting
          </div>
        </div>
      </div>
    );
  }

  function NftCardStatus({ item }) {
    if (item.expiredAt !== "0") {
      return <Renting expiredAt={item.expiredAt} />;
    } else {
      if (!item.duration) return <NotListed />;
      else return <Listed duration={item.duration} amount={item.amount} />;
    }
  }

  function NftCard({ item }) {
    const bgColorClass = getPlatformBgColor(item.platform);
    return (
      <>
        <div
          key={item.id}
          className={classNames(
            item.selected ? "border-4 border-polygreen rounded-lg" : "",
            "w-[233px] h-[327px] mx-auto cursor-pointer"
          )}
          onClick={() => handleNftCardClick(item)}
        >
          <div className="relative bg-[#2A2D3A] w-[225px] h-full p-1 rounded-lg mx-auto">
            <div className="relative w-full h-[213px] overflow-hidden rounded-lg mx-auto">
              <Image
                src={`/bayc/${item.tokenId}.png`}
                alt="Picture of the author"
                width={230}
                height={115}
              />
            </div>
            <div className="absolute top-0 left-0 h-72 p-[6px] h-[34px]">
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0" />
              <p
                className={`relative font-inter font-normal text-[14px] text-white rounded-lg ${bgColorClass} bg-opacity-90 px-3`}
              >
                {/* {colorByPlatform[`'${item.platform}'`] || '플랫폼이름'} */}
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
                    <div className="mr-1">{item.childERC721Name}</div>
                    <div>#{item.tokenId}</div>
                  </div>
                </div>
              </div>
              <NftCardStatus item={item} />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className="relative mx-auto flex max-w-[1437px] justify-center sm:px-2
         lg:px-8 xl:px-12"
      >
        <div className="lg:relative lg:block lg:flex-none">
          {selectedFilters.length > 0 && (
            <div onClick={() => setSelectedFilters([])}>
              <button
                type="button"
                className="w-[300px] h-[40px] py-[9.5px] text-[14px] font-semibold
                  text-polygreen focus-visible:outline border border-polygreen rounded-lg"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Platform */}
          <button
            id="dropdownDefaultButton"
            data-dropdown-toggle="dropdown"
            className="mt-[43px] text-polygreen bg-[#2A2D3A]
                   text-[20px] font-semibold h-[47px] w-[333px]
                   px-4 text-center inline-flex items-center
                   justify-between rounded-lg"
            type="button"
          >
            <span>Platforms</span>
            <svg
              className="w-4 h-4 ml-2 float-right"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </button>
          <div
            id="dropdown"
            className="divide-y divide-gray-100 shadow w-[333px] mt-[14px] mb-[40px]
               "
          >
            <div className="flex w-full flex-wrap">
              {/* Platform chips */}
              {filters
                .filter((filter) => filter.category === "platform")
                .map((platform) => (
                  <div onClick={() => handleFilterClick(platform)}>
                    <Chip item={platform} />
                  </div>
                ))}
            </div>
          </div>

          {/* Collections */}
          <button
            id="dropdownDefaultButton"
            data-dropdown-toggle="dropdown"
            className="text-polygreen bg-[#2A2D3A]
                   text-[20px] font-semibold h-[47px] w-[333px]
                   px-4 text-center inline-flex items-center
                   justify-between rounded-lg"
            type="button"
          >
            <span>Collections</span>
            <svg
              className="w-4 h-4 ml-2 float-right"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </button>
          <div
            id="dropdown"
            className="divide-y divide-gray-100 shadow w-[333px] mt-[14px] mb-[40px]
               "
          >
            <div className="flex w-full flex-wrap">
              {/* Collection chips */}
              {filters
                .filter((filter) => filter.category === "collection")
                .map((collection) => (
                  <div onClick={() => handleFilterClick(collection)}>
                    <Chip item={collection} />
                  </div>
                ))}
            </div>
          </div>

          {/* Price */}
          <button
            id="dropdownDefaultButton"
            data-dropdown-toggle="dropdown"
            className="text-polygreen bg-[#2A2D3A]
                   text-[20px] font-semibold h-[47px] w-[333px]
                   px-4 text-center inline-flex items-center
                   justify-between rounded-lg"
            type="button"
          >
            <span>Price</span>
            <svg
              className="w-4 h-4 ml-2 float-right"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </button>
          <div
            id="dropdown"
            className="divide-y divide-gray-100 shadow w-[333px] mt-[14px] mb-[40px]
               "
          >
            <div className="flex w-full flex-wrap">
              <div className="relative">
                <select
                  id="priceCategory"
                  className="block w-[106px] h-[53px] mr-5 my-[5px] bg-gray-600 text-polygreen text-[16px] rounded-lg px-[10.5px]"
                >
                  <option value="usd">USD</option>
                  <option value="eth">ETH</option>
                </select>
              </div>

              <div className="relative ">
                <input
                  type="text"
                  className="w-[76px] h-[53px] mr-3 my-[5px] bg-gray-600 text-white text-[16px] text-center rounded-lg px-[10.5px"
                  id="exampleFormControlInput1"
                  placeholder="Min"
                />
              </div>
              <div className="h-[53px] leading-[53px] mr-3 text-polygreen mx-auto my-auto">
                <span>to</span>
              </div>
              <div className="relative ">
                <input
                  type="text"
                  className="w-[76px] h-[53px] mr-3 my-[5px] bg-gray-600 text-white text-[16px] text-center rounded-lg px-[10.5px"
                  id="exampleFormControlInput1"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>

          {/* Duration */}
          <button
            id="dropdownDefaultButton"
            data-dropdown-toggle="dropdown"
            className="text-polygreen bg-[#2A2D3A]
                   text-[20px] font-semibold h-[47px] w-[333px]
                   px-4 text-center inline-flex items-center
                   justify-between rounded-lg"
            type="button"
          >
            <span>Duration</span>
            <svg
              className="w-4 h-4 ml-2 float-right"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </button>
          <div
            id="dropdown"
            className="divide-y divide-gray-100 shadow w-[333px] mt-[14px] mb-[40px]
               "
          >
            <div className="flex w-full flex-wrap justify-between">
              <div className="relative ">
                <input
                  type="text"
                  className="w-[125px] h-[53px] my-[5px] bg-gray-600 text-white text-[16px] text-center rounded-lg px-[10.5px"
                  id="exampleFormControlInput1"
                  placeholder="Min Days"
                />
              </div>
              <div className="h-[53px] leading-[53px] text-polygreen mx-auto my-auto">
                <span>to</span>
              </div>
              <div className="relative ">
                <input
                  type="text"
                  className="w-[125px] h-[53px] mr-3 my-[5px] bg-gray-600 text-white text-[16px] text-center rounded-lg px-[10.5px"
                  id="exampleFormControlInput1"
                  placeholder="Max Days"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0 max-w-2xl flex-auto pl-4 lg:max-w-none lg:pl-6 text-white">
          <div className="flex flex-row">
            {selectedFilters.length > 0 && (
              <>
                {/* selected filters */}
                <div className="w-1/2 flex flex-wrap">
                  {selectedFilters.map((item) => (
                    <div key={item.id}>
                      <Chip item={item} />
                    </div>
                  ))}
                </div>

                {/* search bar */}
                <div className="w-1/2">
                  <form action="#" method="GET">
                    <label htmlFor="search-field" className="sr-only">
                      Search
                    </label>
                    <div className="relative w-full text-white">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                        <MagnifyingGlassIcon
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      </div>
                      <input
                        id="search-field"
                        className="block h-full w-full bg-[#1B1A21] border-transparent py-2 pl-8 pr-3 text-white focus:border-transparent focus:outline-none focus:ring-0 focus:placeholder:white sm:text-sm"
                        placeholder="Search Item Here"
                        type="search"
                        name="search"
                      />
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
          {/* result */}
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-[19px] mt-[30px] max-w-[992px]">
            {result.map((item) => (
              <NftCard item={item} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
