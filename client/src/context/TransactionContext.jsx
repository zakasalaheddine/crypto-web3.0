import { ethers } from 'ethers'
import { createContext, useContext, useEffect, useState } from 'react'
import { contractABI, contractAddress } from '../utils/constants'

export const TransactionContext = createContext()

const { ethereum } = window

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum)
  const signer = provider.getSigner()
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  )

  return transactionContract
}

export const TransactionsProvider = ({ children }) => {
  const [connectedAccount, setConnectedAccount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [transactionCount, setTransactionCount] = useState(
    localStorage.getItem('transactionCount')
  )
  const [formData, setFormData] = useState({
    addressTo: '',
    amount: '',
    keyword: '',
    message: ''
  })
  const [transactions, setTransactions] = useState([]);

  const handleChange = (e, name) => {
    setFormData((prev) => ({ ...prev, [name]: e.target.value }))
  }

  const getAllTransactions = async () => {
    try {
      if (ethereum) {
        const transactionsContract = getEthereumContract()
        const availableTransactions =
          await transactionsContract.getAllTransaction()
        const structuredTransactions = availableTransactions.map(
          (transaction) => ({
            addressTo: transaction.reveiver,
            addressFrom: transaction.sender,
            timestamp: new Date(
              transaction.timestamp.toNumber() * 1000
            ).toLocaleString(),
            message: transaction.message,
            keyword: transaction.keyword,
            amount: parseInt(transaction.amount._hex) / 10 ** 18
          })
        )

        console.log(structuredTransactions)

        setTransactions(structuredTransactions)
      } else {
        console.log('Ethereum is not present')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const checkIfWalletIsConnect = async () => {
    try {
      if (!ethereum) return alert('Please Install metamask')
      const accounts = await ethereum.request({ method: 'eth_accounts' })
      if (accounts.length) {
        setConnectedAccount(accounts[0])

        getAllTransactions();
      } else {
        console.log('No account found')
      }
    } catch (error) {
      console.log(error)
      throw new Error('No ethereum object')
    }
  }

  const checkIfTransactionsExist = async () => {
    try {
      const transactionContract = getEthereumContract()
      const transactionCount = await transactionContract.getTransactionCount()

      window.localStorage.setItem('transactionCount', transactionCount)
    } catch (error) {
      console.log(error)
      throw new Error('No ethereum object')
    }
  }

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert('Please Install metamask')
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      setConnectedAccount(accounts[0])
    } catch (error) {
      console.log(error)
      throw new Error('No ethereum object')
    }
  }

  const sendTransaction = async () => {
    try {
      if (!ethereum) return alert('Please Install metamask')
      const { addressTo, amount, keyword, message } = formData
      const transactionContract = getEthereumContract()
      const parsedAmount = ethers.utils.parseEther(amount)

      await ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: connectedAccount,
            to: addressTo,
            gas: '0x5208',
            value: parsedAmount._hex
          }
        ]
      })

      const transactionHash = await transactionContract.addToBlockChain(
        addressTo,
        parsedAmount,
        message,
        keyword
      )

      setIsLoading(true)
      console.log(`${transactionHash.hash} - Loading...`)
      await transactionHash.wait()
      setIsLoading(false)
      console.log(`${transactionHash.hash} - Success`)

      const transactionCount = await transactionContract.getTransactionCount()
      setTransactionCount(transactionCount.toNumber())

      window.reload()
    } catch (error) {
      console.log(error)
      throw new Error('No ethereum object')
    }
  }

  useEffect(() => {
    checkIfWalletIsConnect()
    checkIfTransactionsExist()
  }, [])

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        connectedAccount,
        formData,
        handleChange,
        setFormData,
        sendTransaction,
        isLoading,
        transactions,
        transactionCount
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}

export const useTransactions = () => useContext(TransactionContext)
