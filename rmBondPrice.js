
const { useState, useEffect } = require("react");
const useAlchemy = require("./lib/useAlchemy");
const CoinGecko = require("coingecko-api");
const CR_BOND_ABI = require("./lib/contracts/crbond_abi.json");
const CR_SLP_ABI = require("./lib/contracts/cr_slp_abi.json");
// const bots = require("bots.js");


async function getBondPrice() {

  var discount = 0;
  
  // Use Alchmemy for interacting with the smart contracts
  const { web3, useContract } = useAlchemy(process.env.alchemyKey);
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
  const maticPrice = results[1].data["matic-network"]["usd"];
  const raiderPrice = results[1].data["crypto-raiders"]["usd"];
  const slpTotalSupply = Number(web3.utils.fromWei(results[2]));
  const slpMaticReserves = Number(web3.utils.fromWei(results[3]["0"]));
  const slpRaiderReserves = Number(web3.utils.fromWei(results[3]["1"]));
  const slpValue =
    slpMaticReserves * maticPrice + slpRaiderReserves * raiderPrice;
  const slpPrice = slpValue / slpTotalSupply;
  const bondPrice = slpPrice * trueBondPrice;
  discount = raiderPrice / bondPrice - 1;

  console.log("Raider/Matic discount: ", discount, `\n ${Date.now()}`);
  
  return {bondPrice, discount};

  
}

module.exports = getBondPrice;