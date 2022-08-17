// IMPORT : in order to import ethersjs, we will copy all the code from the ether doc and create a file in the repo here
// because we can not work, on front end, with require.

import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js" // we are importing here data from constants

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const withdrawButton = document.getElementById("withdrawButton")

connectButton.onclick = connect
fundButton.onclick = fund
withdrawButton.onclick = withdraw
async function connect() {
    if (typeof window.ethereum !== "undefined") {
        console.log("Metamask Detected")
        await window.ethereum.request({ method: "eth_requestAccounts" }) // here we autoconnect to metamask
        connectButton.innerHTML = "Connected"
        console.log("Metamask Connected !")
    } else {
        console.log("No Metamask Detected")
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount} ETH...`)
    if (typeof window.ethereum !== "undefined") {
        // what we need here :
        //provider / connection to blockchain
        //signer / wallet / someone with gaz
        //contract that we are interacting with
        // ABI + ADDRESS
        const provider = new ethers.providers.Web3Provider(window.ethereum) // this line call, through metamask, the rpc endpoint
        const signer = provider.getSigner() // this return the wallet connected to the provider
        const contract = new ethers.Contract(contractAddress, abi, signer) // invocation of the contract with the parameters needed
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            }) // same than for the backendtest, we call the fund function with a parse ether number

            // to give indication about what'sgoing on on the blockchain after funding :
            // listen for the transaction to be mined

            await listenForTransactionMine(transactionResponse, provider) // this say : we stop here until the transaction is finished
            console.log("Funding done!")
        } catch (error) {
            console.log("There is an error: " + error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)

    return new Promise((resolve, reject) => {
        // the promise here call the resolve function, once the function below is finished
        // the return is ONLY trigger once the promise is resolved.

        provider.once(transactionResponse.hash, (transactionReceipt) => {
            //the once function listen to the first part of the parametre, and give a data on the second part, that we can named as we want (here "transactionReceipt" )
            // this object is the receipt of the transaction, from who we can extract the confirmation.
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations. `
            )
            resolve() // we put the resolve trigger here (who will trigger the promise as resolved) once the code above is done
        })
    })
}

const balanceButton = document.getElementById("balanceButton")
balanceButton.onclick = getBalance

async function getBalance() {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const balance = await provider.getBalance(contractAddress) // call of the getBalance function of ethers, and parameter is the contract address
    console.log(ethers.utils.formatEther(balance)) // call a format function to get balance
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log("Withdrawing...")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()

            await listenForTransactionMine(transactionResponse, provider)
            console.log("Withdraw done!")
        } catch (error) {
            console.log("There is an error: " + error)
        }
    }
}
// FUND FUNCTION

// WITHDRAW FUNCTION
