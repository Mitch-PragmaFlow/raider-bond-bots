// This price calculation uses Nomics for pricing due to Aurum not being
//   available on CoinGecko.  
// Nomics pricing seems different from the coingecko pricing, as well as
//   whatever pricing Olympus uses, so this ends up not tracking the bond
//   as closely as the raider one.

const { useState, useEffect } = require("react");
const useAlchemy = require("./lib/useAlchemy");
const fetch = require('node-fetch');
const CR_BOND_ABI = require("./lib/contracts/crbond_abi.json");
const CR_SLP_ABI = require("./lib/contracts/cr_slp_abi.json");
// const bots = require("bots.js");


async function getBondPrice() {

  var discount = 0;
  
  // Use Alchmemy for interacting with the smart contracts
  const { web3, useContract } = useAlchemy(process.env.alchemyKey);
  const bondContract = useContract(
    "0x79711f630CB47a302ad5A805CefB350dBF792d1E",
    CR_BOND_ABI
  );
  const slpContract = useContract(
    "0x91670a2A69554c61d814CD7f406D7793387E68Ef",
    CR_SLP_ABI
  );
  
  // The main calculation
  const getTrueBondPrice = bondContract.methods.trueBondPrice().call();
  const getSlpTotalSupply = slpContract.methods.totalSupply().call();
  const getSlpReserves = slpContract.methods.getReserves().call();
  
  const getCoinPrices = fetch(
    `https://api.nomics.com/v1/currencies/ticker?key=${process.env.nomicsKey}&per-page=3&ids=RAIDER,AURUM2,MATIC`
  ).then((response) => response.json());
  
  // Fetch everything in parallel.
  const results = await Promise.all([
    getTrueBondPrice,
    getCoinPrices,
    getSlpTotalSupply,
    getSlpReserves,
  ]);

  const coinPrices = results[1].reduce((acc, el) => {
    return { ...acc, [el.id]: el.price };
  }, {});

  const trueBondPrice = results[0] / 10000000;
  const maticPrice = coinPrices["MATIC"];
  const raiderPrice = coinPrices["RAIDER"];
  const aurumPrice = coinPrices["AURUM2"];
  const slpTotalSupply = Number(web3.utils.fromWei(results[2]));
  const slpMaticReserves = Number(web3.utils.fromWei(results[3]["0"]));
  const slpAurumReserves = Number(web3.utils.fromWei(results[3]["1"]));
  const slpValue =
    slpMaticReserves * maticPrice + slpAurumReserves * aurumPrice;
  const slpPrice = slpValue / slpTotalSupply;
  const bondPrice = slpPrice * trueBondPrice;
  discount = raiderPrice / bondPrice - 1;

  console.log("Aurum/Matic discount: ", discount, `\n ${Date.now()}`);
  
  return {bondPrice, discount};

  
}

module.exports = getBondPrice;