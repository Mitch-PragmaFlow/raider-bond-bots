
const { useState, useEffect } = require("react");
const useAlchemy = require("./lib/useAlchemy");
const CoinGecko = require("coingecko-api");
const CR_BOND_ABI = require("./lib/contracts/crbond_abi.json");
const CR_SLP_ABI = require("./lib/contracts/cr_slp_abi.json");

function getBondPrice(_bond) {
  const DECIMALS = 100000000000000000;
  
  // Number formatting
  const PRETTY_NUMBER = Intl.NumberFormat("en-US");
  const PRETTY_CURRENCY = Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const PRETTY_PERCENT = Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // State to hold the various values required for the calculation
  const [trueBondPrice, setTrueBondPrice] = useState(0);
  const [maticPrice, setMaticPrice] = useState(0);
  const [raiderPrice, setRaiderPrice] = useState(0);
  const [slpTotalSupply, setSlpTotalSupply] = useState(0);
  const [slpMaticReserves, setSlpMaticReserves] = useState(0);
  const [slpRaiderReserves, setSlpRaiderReserves] = useState(0);
  const [slpPrice, setSlpPrice] = useState(0);
  const [bondPrice, setBondPrice] = useState(0);
  const [roi, setRoi] = useState(0);
  
  // Use Alchmemy for interacting with the smart contracts
  const { useContract } = useAlchemy(process.env.alchemyKey);
  const bondContract = useContract(
    "0xee57F4C39CEfA70Ce8D07767136e5F40042CCa1b",
    CR_BOND_ABI
  );
  const slpContract = useContract(
    "0x2e7d6490526c7d7e2fdea5c6ec4b0d1b9f8b25b7",
    CR_SLP_ABI
  );
  
  // Use coingecko for fetching token prices
  const CoinGeckoClient = new CoinGecko();

  // The main calculation
  const refreshBondPrice = async () => {
    const getTrueBondPrice = bondContract.methods.trueBondPrice().call();
    const getSlpTotalSupply = slpContract.methods.totalSupply().call();
    const getSlpReserves = slpContract.methods.getReserves().call();
    const getCoinPrices = CoinGeckoClient.simple.price({
      ids: ["crypto-raiders", "matic-network"],
      vs_currencies: ["usd"],
  });
    
    // Fetch everything in parallel.
    const results = await Promise.all([
      getTrueBondPrice,
      getCoinPrices,
      getSlpTotalSupply,
      getSlpReserves,
    ]);

    const trueBondPrice = results[0] / 10000000;
    setTrueBondPrice(trueBondPrice);
    const maticPrice = results[1].data["matic-network"]["usd"];
    setMaticPrice(maticPrice);
    const raiderPrice = results[1].data["crypto-raiders"]["usd"];
    setRaiderPrice(raiderPrice);
    const slpTotalSupply = Number(results[2]) / DECIMALS;
    setSlpTotalSupply(slpTotalSupply);
    const slpMaticReserves = Number(results[3]["0"] / DECIMALS);
    setSlpMaticReserves(slpMaticReserves);
    const slpRaiderReserves = Number(results[3]["1"] / DECIMALS);
    setSlpRaiderReserves(slpRaiderReserves);
    const slpValue =
      slpMaticReserves * maticPrice + slpRaiderReserves * raiderPrice;
    const slpPrice = slpValue / slpTotalSupply;
    setSlpPrice(slpPrice);
    const bondPrice = slpPrice * trueBondPrice;
    setBondPrice(bondPrice);
    const roi = raiderPrice / bondPrice - 1;
    setRoi(roi);


    console.log(roi);
    return(roi)
  }
}

module.exports = getBondPrice;