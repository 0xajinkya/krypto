import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);
  // console.log(transactionsContract);  
  return transactionsContract;
}


export const TransactionProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [currentAccount, setCurrentAccount] = useState("");
  const [formData, setformData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
  const [transactions,setTransactions] = useState([]);
  const handleChange = (e, name) => {
    setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
   };

  const getAllTransactions = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");
      const transactionsContract = getEthereumContract();
      const availableTransactions = await transactionsContract.getAllTransactions();

      const structuredTransactions = availableTransactions.map((transaction) => ({
        addressTo: transaction.receiver,
        addressFrom: transaction.sender,
        timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
        message: transaction.message,
        keyword: transaction.keyword,
        amount: parseInt(transaction.amount._hex) / (10 ** 18)
      })); 
      console.log(structuredTransactions);
      setTransactions(structuredTransactions);


    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  }

  const checkIfWalletIsConnect = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);

        getAllTransactions();
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfTransactionsExist = async () => {
    try {
      const transactionsContract = getEthereumContract();
      const transactionsCount = await transactionsContract.getTransactionCount();
      window.localStorage.setItem('transactionCount', transactionsCount)
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }

  }

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_requestAccounts", });

      setCurrentAccount(accounts[0]);
      console.log(accounts[0]);
      //   window.location.reload();
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };



  const sendTransaction = async () => {
    //             const { addressTo, amount, keyword, message } = formData;
    // const transactionsContract = getEthereumContract();
    // const parsedAmount = ethers.utils.parseEther(amount)._hex;
    // await ethereum.request({
    //   method: "eth_sendTransaction",
    //   params: [{
    //     from: currentAccount,
    //     to: addressTo,
    //     gas: "0x5208",
    //     value: parsedAmount,
    //   }],
    // });
    // const transactionHash = await transactionsContract.addToBlockchain(addressTo, parsedAmount, message, keyword);
    // console.log(transactionHash);
    try {
      if (ethereum) {
        const { addressTo, amount, keyword, message } = formData;
        const transactionsContract = getEthereumContract();
        console.log(transactionsContract);
        const parsedAmount = ethers.utils.parseEther(amount);
        // const a = await transactionsContract.incrementTransactionCount();
        // const t = await transactionsContract.getAllTransactions();
        // console.log(t);
        await ethereum.request({
          method: "eth_sendTransaction",
          params: [{
            from: currentAccount,
            to: addressTo,
            gas: "0x5208",
            value: parsedAmount._hex,
          }],
        });
        console.log(transactionsContract);
        const transactionHash = await transactionsContract.addToBlockchain(addressTo, parsedAmount, message, keyword);

        setIsLoading(true);
        console.log(`Loading - ${transactionHash.hash}`);
        await transactionHash.wait();
        console.log(`Success - ${transactionHash.hash}`);
        setIsLoading(false);

        const transactionsCount = await transactionsContract.getTransactionCount();

        setTransactionCount(transactionsCount.toNumber());
        const transactions = await transactionsContract.getAllTransactions();
        console.log(transactions);
        // window.location.reload();
      } else {
        console.log("No ethereum object");
      }
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };

  useEffect(() => {
    checkIfWalletIsConnect();
    checkIfTransactionsExist();
  }, [])


  return (
    <TransactionContext.Provider
      value={{
        transactionCount,
        connectWallet,
        transactions,
        currentAccount,
        isLoading,
        sendTransaction,
        handleChange,
        formData,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}