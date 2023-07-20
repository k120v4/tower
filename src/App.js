import React, { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import "./style.css";
import tower from './tower.webp';
import tower2 from './2.webp';
import bg from './star_background.jpeg';

const contractABI = require("./Doubleswap.json");
const contractTokenAABI = require("./tokenAABI.json");
const contract_address_swap = "0x0A46695a046a87Ef212fcF2d60e2feD8b46E7997";
const tokenA_address = "0x95A45e4c3A8AC8A65C89c114Ed3c9f3114DA3931";
const weth_address = "0x95A45e4c3A8AC8A65C89c114Ed3c9f3114DA3931";

export default function App() {
  const [acct, setAcct] = useState('');
  const [query, setQuery] = useState('');
  const [queryAmount, setQueryAmount] = useState(0);
  const [queryAmountsell, setQueryAmountsell] = useState(0);
  const [queryLimit, setQueryLimit] = useState('');
  const [query3, setQuery3] = useState('');
  const [level, setLevel] = useState(123);
  const [FBGM_balance, setFBGM_balance] = useState('');
  const [temp, setTemp] = useState(123);
  const [price, setPrice] = useState(0.1);
  const [loading, setLoading] = useState(true);
  const [metaMaskEnabled, setMetaMaskEnabled] = useState(false);
  const [systemFailure, setSystemFailure] = useState(false);
  

  let getContract = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let contract = new ethers.Contract(
      contract_address_swap,
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
  let approve = async () => { 
    const tx = await getContract_tokenA().approve(contract_address_swap, 1);
  };

  let approve2 = async () => { 
    const tx = await getContract_weth().approve(contract_address_swap, 1);
  };


  let swap = async () => { 
    const tx = await getContract().swap(query);
  };

  let buy = async () => {
    const tx = await getContract().buy(queryAmount, 0, {gasLimit: 200000});
  };

  let sell = async () => {
    const tx = await getContract().sell(queryAmountsell, 0, {gasLimit: 200000});
  };
  
  let fetchCurrentValue = async () => {
    let l = await getContract().level();
    setLevel(parseInt(l,16))
    setPrice(1800*Math.pow(2,(parseInt(l,16)))/1000000)
    //let bal = await getContract_tokenA().balanceOf(acct);
    //console.log(bal);
    //setFBGM_balance(parseInt(bal,16));

    setLoading(false);
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
      console.log("Connected", accounts[0]);
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
            Welcome {acct}!<p></p>
            We hope you enjoy your stay. 
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
        <p class = "descrip">🌛🌛🌛</p>
      </div>
      <div>
        <p class="label" >
          Amount: &nbsp;
          <input value={queryAmount} onChange={(e)=>setQueryAmount(e.target.value)} type="number"></input> 
        </p> &nbsp;
        <button onClick={buy} class="button"> Market Buy </button>
          <p></p>

        <p class="label" >
          Amount: &nbsp;
          <input class="input" value={queryAmount} onChange={(e)=>setQueryAmount(e.target.value)} type="number"></input> &nbsp;
          Level Limit: &nbsp;
          <input class="input" value={queryAmount} onChange={(e)=>setQueryAmount(e.target.value)} type="number"></input> 
        </p> &nbsp;
        <button onClick={buy} class="button"> Limit Buy </button>
          <p></p>

        <p class="label" >
          Amount: &nbsp;
          <input value={queryAmountsell} onChange={(e)=>setQueryAmountsell(e.target.value)} type="number"></input> 
        </p> &nbsp;
        <button onClick={sell} class="button"> Market Sell </button>
        <p></p>

        <button onClick={approve2} class="button">Approve $WETH </button>&nbsp;
        <button onClick={approve} class="button"> Approve $TOWER </button> 
        

      </div>
      <p class = "descrip">🌛🌛🌛</p>
      <h1 class="descrip"> Info </h1>
      <p class="faqb"> $TOWER is a lulcoin on Ethereum Mainnet.  </p>

      <p class="faqb">In case you haven't noticed, it's price behavior is a little wonky.
      For every 2 ETH that is bought, $TOWER's price will double. This happens regardless of how much has been already bought.
      Early or late, you are always 2 ETH away from doubling up. Or, 20 ETH away from 1000x. </p>

      <p class="faqb"> To create this unique price behavior, $TOWER is not traded on uniswap, but only here at the Tower to the Moon.
      The Tower has many levels. All trades on a level are at the same price and it takes 2 ETH of buys to move to the next level. 
      The price doubles on each level.</p>

      <p class="faqb"> Each trade is maxed out at the capacity left on the level.
      For example, if 0.75 ETH has been purchased on level 5, then you can only buy 1.25 ETH worth. 
      Even if you try to buy 10 ETH, the contract will only take the capacity that remains.  
      Afterwards, the level will increase to 6, and then you or the next buyer can buy up to the full 2 ETH on the next trade.</p>

      <p class="faqb"> There's a 'market buy' button, which will buy at the current price. There's also a 'limit buy', 
      which will only buy if the current level is at or better than your limit. And similarly with the Sell buttons.</p>

     <h1 class="descrip"> Tokenomics </h1>
     <p class="faqb"> 1T tokens, all used for liquidity by the Tower. 2% sell tax for marketing funds. </p>
     <p class="faqb"> No mint, no owner, no team tokens.  </p>


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
