import React, { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import "./style.css";
import tower from './tower.webp';
import tower2 from './2.webp';
/* global BigInt */

const contractABI = require("./Doubleswap.json");
const contractTokenAABI = require("./tokenAABI.json");
const swap_address = "0x0A46695a046a87Ef212fcF2d60e2feD8b46E7997";
const tokenA_address = "0x95A45e4c3A8AC8A65C89c114Ed3c9f3114DA3931";
const weth_address = "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83";

export default function App() {
  const [acct, setAcct] = useState(0);
  const [query, setQuery] = useState('');
  const [queryAmount, setQueryAmount] = useState(0);
  const [queryAmountsell, setQueryAmountsell] = useState(0);
  const [queryLimit, setQueryLimit] = useState('');
  const [query3, setQuery3] = useState('');
  const [level, setLevel] = useState(0);
  const [towerAmount, setTowerAmount] = useState('');
  const [wethAmount, setWethAmount] = useState('');
  const [temp, setTemp] = useState(0x02bd23d7e022b927);
  const [price, setPrice] = useState(0.1);
  const [loading, setLoading] = useState(true);
  const [metaMaskEnabled, setMetaMaskEnabled] = useState(false);
  const [systemFailure, setSystemFailure] = useState(false);
  

  let getContract = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let contract = new ethers.Contract(
      swap_address,
      contractABI.abi,
      signer
    );
    return contract;
  };

  let getContract_tokenA = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let contract = new ethers.Contract(
      tokenA_address,
      contractTokenAABI.abi,
      signer
    );
    return contract;
  };

  let getContract_weth = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let contract = new ethers.Contract(
      weth_address,
      contractTokenAABI.abi,
      signer
    );
    return contract;
  };

  //functions for the buttons
  let buy = async () => {
    const tx = await getContract().buy(queryAmount*1e18, 0, {gasLimit: 200000});
  };

  let sell = async () => {
    const tx = await getContract().sell(queryAmountsell*1e18, 0, {gasLimit: 200000});
  };

  let approve = async () => { 
    try {
      const tx = await getContract_tokenA().approve(swap_address, ethers.constants.MaxInt256);
    }
    catch(err) {
      if (err.code = "ACTION_REJECTED") {
        alert("MetaMask Tx Signature: User denied transaction signature.")
      }
    }
  };

  let approve2 = async () => { 
    try {
      const tx = await getContract_weth().approve(swap_address, ethers.constants.MaxInt256);
    }
    catch(err) {
      if (err.code = "ACTION_REJECTED") {
        alert("MetaMask Tx Signature: User denied transaction signature.")
      }
    }
  };

  
  const checkedWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        setMetaMaskEnabled(false);
        return;
      }

      //await ethereum.enable();
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${Number(250).toString(16)}` }],
      });
      localStorage.setItem("walletAddress", accounts[0]);
      setAcct(accounts[0]);
      setMetaMaskEnabled(true);

      // Listen to event
      listenToEvent();

      fetchCurrentValue();
    } catch (error) {
      console.log(error);
      setMetaMaskEnabled(false);
    }
  };

  let fetchCurrentValue = async () => {
    let l = await getContract().level();
    let account = localStorage.getItem("walletAddress");
    setLevel(parseInt(l,10))
    setPrice(1800*Math.pow(2,(parseInt(l,10)))/1000000)
    
    let bal = await getContract_weth().balanceOf(account);
    setWethAmount(parseInt(bal,10)/1e18);

    bal = await getContract_tokenA().balanceOf(account);
    setTowerAmount(parseInt(bal,10)/1e18);

    setLoading(false);
  };



  useEffect(() => {
    checkedWallet();
    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
      window.ethereum.on("accountsChanged", () => {
        checkedWallet();
      });
    }
  }, []);

  //event listener to update the log
  let listenToEvent = async () => {
    getContract().on("LevelUpdated", async () => {
      console.log('level updated')
      fetchCurrentValue(); 
    });

    getContract().on("TokensPurchased", async (buyer) => {
      if (buyer == localStorage.getItem("walletAddress")) { //working on this 
        console.log('you bought');
        fetchCurrentValue(); 
      }
    });
  };

  return (
    <div class="root">
      <p class="descrip"> ..</p>
      <h1 class="title">Tower to the Moon</h1>
      <img  src={tower2} width="250px"/>
      <p></p>
      {metaMaskEnabled && (
        <div>
          <label class="descrip" >
            Welcome {acct.substring(0,5) + ".." + acct.substring(40)}! We hope you enjoy your stay. <p></p>
            
            <p></p>
          </label>
        </div>
      )}
      {!metaMaskEnabled && (
        <div>
          <button onClick={checkedWallet} class="button"> CONNECT</button>
        </div>
      )}
      

      <div>
        <p class = "descrip">🌛🌛🌛</p>
        <h2 class="descrip">Current Level: {level} </h2>
        <h2 class="descrip"> Price of $TOWER: ${1900*Math.pow(2,level)/1000000000} </h2>
        
      </div>
      
      {metaMaskEnabled && (
      <div>
        <p class = "descrip">🌛🌛🌛</p>
        <p class="faqb"> Your WETH: {wethAmount} </p>
        <p class="faqb"> Your $TOWER: {towerAmount} </p>
        
        <div class="box">
          <p class="label" >
            Amount: &nbsp;
            <input value={queryAmount} onChange={(e)=>setQueryAmount(e.target.value)} type="number"></input> 
          </p> &nbsp;
          <button onClick={buy} class="button"> Market Buy </button>
        </div><p></p>

        <div class="box">
          <p class="label" >
            Amount: &nbsp;
            <input class="input" value={queryAmount} onChange={(e)=>setQueryAmount(e.target.value)} type="number"></input> &nbsp;
            Level Limit: &nbsp;
            <input class="input" value={queryAmount} onChange={(e)=>setQueryAmount(e.target.value)} type="number"></input> 
          </p> &nbsp;
          <button onClick={buy} class="button"> Limit Buy </button>
        </div><p></p>

        <div class="box">
          <p class="label" >
            Amount: &nbsp;
            <input value={queryAmountsell} onChange={(e)=>setQueryAmountsell(e.target.value)} type="number"></input> 
          </p> &nbsp;
          <button onClick={sell} class="button"> Market Sell </button>
        </div>
        <p></p>

        <div class="box">
          <button onClick={approve2} class="button">Approve $WETH </button>&nbsp;&nbsp;
          <button onClick={approve} class="button"> Approve $TOWER </button> 
        </div>
      </div>
      )}

      <p class = "descrip">🌛🌛🌛</p>
      <h1 class="descrip"> Info </h1>
      <p class="faqb"> $TOWER is a lulcoin on Ethereum Mainnet.  </p>

      <p class="faqb">$TOWER's price doubles for every 2 ETH that is bought. 
      Whether you buy early or late, you are always 2 ETH away from doubling your investment, or 20 ETH away from 1000x. </p>

      <p class="faqb"> To achieve this unique price behavior, $TOWER is exclusively traded here and not on Uniswap.
      The Tower has multiple levels and all trades on each level occur at the same price. It takes 2 ETH worth of buys to move to the next level
      and the price doubles each time.</p>

      <h1 class="descrip"> How to buy</h1>
      <p class="faqb"> There are two types of buy buttons: "market buy" for the current price and "limit buy" which 
      only executes if the level matches your limit or better. The same applies to the Sell buttons.</p>

      <p class="faqb"> Each trade is limited to the remaining capacity on each level.
      For example, say 1.4 ETH has been purchased on level 5.
      Even if you attempt to buy 10 ETH, the contract will only swap 0.6 ETH.  
      Afterwards, the level increases to 6, allowing the next buyer to purchase the full 2 ETH on the next trade.</p>

     <h1 class="descrip"> Tokenomics </h1>
     <p class="faqb"> 1T tokens, all used for liquidity by the Tower.</p>
     <p class="faqb"> No tax, no mint, no owner, no team tokens.  </p>


     <h1 class="descrip"> Links </h1>

     <p class="faqb"> <a href="https://twitter.com/">Etherscan</a>,&nbsp;
                      <a href="https://twitter.com/">Twitter</a>,&nbsp;
                      <a href="https://discord.gg/">Telegram</a>,&nbsp;
                      <a href="https://www.dextools.io/app/en/ether/pair-explorer/">Dextools</a>&nbsp;
                      </p>

     <p class="faqb"> Next stop, moon. 🌛 </p>



      <p class="descrip">..</p>      
    </div>

  );
}
