import axios from "axios"

const getExternalData = async ( url ) => {
    const response = await axios.get(url);
    return response.data;
 }



const handleEnterRaffle = async (ethers, event, contract, provider,) => {
    
    event.preventDefault();
          
    console.log( event.target.guess.value)
    console.log( event.target.numberGenerator.value)
    console.log( event.target.wager.value)

    let IPAddress = ethers.utils.formatBytes32String( await getExternalData('https://api.ipify.org') )
    console.log(IPAddress)

    const gasPrice = await provider.getGasPrice()
    console.log('Gas Price Estimate:', gasPrice.toString())

    //setStatus("This estimated gas price for this transaction is: " + gasPrice.toString())

    let overrides = { //https://ethereum.stackexchange.com/a/93559/3506
        // from: currentAccount, 
        // to: contractAddress, 
        value: ethers.utils.parseEther(event.target.wager.value),     // ether in this case MUST be a string
        //gasPrice: gasPrice,
        gasLimit: ethers.utils.hexlify(3000000),
        //nonce: provider.getTransactionCount( currentAccount, 'latest'),
    };
    try{
    //uint8 guess, bytes32 _IPAddress, uint8 chooseVRF1or2
        let transaction = await contract.userCommit(event.target.guess.value, IPAddress, /*event.target.numberGenerator.value,*/ overrides);
    
        console.log("Mining...", transaction.hash);
        await transaction.wait();
        console.log("Mined -- ", transaction.hash)


        const winningNumber = await contract.lastWinningNumber();
        const jackpot = ethers.utils.formatEther( await contract.jackpotPrizeAmount() )

        if ( winningNumber !== event.target.guess.value){

            return {success: true, status: "Sorry! You picked " + event.target.guess.value + ", but the winning number was " + winningNumber }


        } else{

            const total = jackpot + event.target.wager.value

            return {success: true, status: "Congratulations! You picked the right winning number of " + winningNumber + ". You Won " + total }

        }


    }catch(error){

        console.log(error)
        return{success: false, status: error}     

    }
    
 }

//https://stackoverflow.com/a/39914235
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}



 const handleGetWinningNumber = async () => {
    try {

        if (ethereum) {
            let transaction = await contract.lastWinningNumber();
            transaction = tx
            setStatus("Winning Number: " +  tx);
            console.log(tx)
    } else {
        console.log("Ethereum object doesn't exist!");
    }
    } catch (error) {
    console.log(error)
    }
}



const handleTemplate = async (axios, event, contract, contractAddress, fileStream) => {


    try{

        let transaction
        transaction = await contract.receivePayThenMint( currentAddress, tokenURI, overrides );
        
        console.log("Mining..." + transaction.hash);
        await transaction.wait();
        console.log("Mined -- " + transaction.hash)

        return {success: true, status:<>
            <p style={{ fontSize: "1em", position: "absolute", marginTop:"1em"}}>Congratulations! Your NFT Was Successfuly Minted!</p>
                <ol style={{ fontSize: ".7em", lineHeight: "2em", marginTop: "4em" }}>
                <li>Token URI (i.e., NFT Metadata on IPFS): <a href={response.data[0]} target="_blank">{response.data[0]}</a></li>
                <li>Token URL (NFT Metadata URL on Pinata): <a href={response.data[1]} target="_blank">{response.data[1]}</a></li>
                <li>Image URI (NFT on IPFS): <a href={response.data[2]} target="_blank">{response.data[2]}</a></li>
                <li>Image URL (NFT Image on Pinata): <a href={response.data[3]} target="_blank">{response.data[3]}</a></li>
                </ol></>
                
        }

    }catch(error){

        console.log(error)
        setStatus("")
        setError(error.message)      

    }   

}



const handleGetMaxSupply = async (contract) => {
    try {
        console.log(contract)
        if (ethereum) {

           let transaction = await contract.maxSupply();
            
            console.log("Max Supply: " + transaction)
            return{success: true, status: "Max Supply: " + transaction}
            
        } else {
            console.log("Ethereum object doesn't exist!");
            setError("Ethereum object doesn't exist!");
        }

    } catch (error) {
        console.log(error)
        return{success: false, status: error}
    }
}

const handleGetContractBalance = async (provider, ethers, contractAddress) => {
    try {

        if (ethereum) {
        
            let transaction = await  provider.getBalance(contractAddress) 

                transaction = ethers.utils.formatEther( transaction )

            console.log("Contract Balance: " + transaction)
            return{success: true, status: "Contract Balance: " + transaction}
            
        } else {
            console.log("Ethereum object doesn't exist!");
            return{success: false, status: "Ethereum object doesn't exist!"}
        }

    } catch (error) {
        console.log(error)
        return{success: false, status: error}
    }
}

const handleGetTotalMinted = async (contract) => {
    try {

        if (ethereum) {   

           let transaction = await contract.getTotalSupply()
    
           console.log("Total Minted: " + transaction)
           return{success: true, status: "Total Minted: " + transaction}
            
        } else {
            console.log("Ethereum object doesn't exist!");
            setError("Ethereum object doesn't exist!");
        }

    } catch (error) {
        console.log(error)
        return{success: false, status: error}
    }
}

const handleWithdrawToOwner = async (event, contract, admin) => {
    try {

        if (ethereum) {

        let transaction = await contract.withdraw( event.target.value, admin)

           console.log("Mining..." + transaction.hash);
           
           await transaction.wait();

           console.log("Mined -- " + transaction.hash)

           return{success: true, status: "Successfully Withdrew " + event.target.value + " and deposited into " +  admin}           
           //setStatus("Mining..." + transaction.hash);
        }

    } catch (error) {
        console.log(error)
        return{success: false, status: error}
    }

}

const handleSetTotalSupply = async (event, contract) => {

    const supply =  event.target.maxSupply.value

    try {

        if (ethereum) {

            let transaction = await contract.setTotalSupply(supply);
            console.log("Mining..." + transaction.hash);
           
            await transaction.wait();
            console.log("Success! Mining Complete..." + transaction.hash)
            return{success: true, status: "Succesfully Updated Maxium Token Supply To: ..." + transaction.hash}


        } else {
            console.log("Ethereum object doesn't exist!");
            return{success: false, status: "Ethereum object doesn't exist!"}
        }

    } catch (error) {
        console.log(error)
        return{success: false, status: error}
    }
}

const handleSetSalesPrice = async (event, contract, ethers) => {

    const newPrice =  ethers.utils.parseEther( event.target.newPrice.value )

    try {

        if (ethereum) {

            let transaction = await contract.setSalesPrice(newPrice);
            console.log("Mining..." + transaction.hash);
           
            await transaction.wait();
            console.log("Success! Mining Complete..." + transaction.hash)
            return{success: true, status: "Succesfully Updated Sales Price To: ..." + transaction.hash}


        } else {
            console.log("Ethereum object doesn't exist!");
            return{success: false, status: "Ethereum object doesn't exist!"}
        }

    } catch (error) {
        console.log(error)
        return{success: false, status: error}
    }
}


const handleShutDown = async (contract) => {
    try {

        if (ethereum) {

            await contract.deleteContract();
            
            console.log("Contract Deleted")
            return {success: true, status: "Contract Deleted"}
            
        } else {
            console.log("Ethereum object doesn't exist!");
            setError("Ethereum object doesn't exist!");
        }

    } catch (error) {
        console.log(error)
        return{success: false, status: error}
    }
}

function arrayContains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
}


const showNetwork = (network) => {

    //const network = await provider.getNetwork();

    console.log ("Show Network: " , network.chainId)
    const ethLogo = 'https://smartcontract.imgix.net/icons/ethereum.svg?auto=compress%2Cformat*';
    const polygonLogo = 'https://smartcontract.imgix.net/icons/polygon.svg?auto=compress%2Cformat*';
    const meterLogo = 'https://meter.io/assets/meter-logo-d.svg'

    try{
        if (  [42,3,4,5,1,4].includes( network.chainId ) ){

            return {success: true, status:  <span id="wallet-network-info"><img className="network-logo-sm" src={ethLogo}/>{network.name}</span>, networkName: network.name } 

        }else if ( [80001].includes( network.chainId ) ) {

            return{ success: true, status: <span id="wallet-network-info"><img className="network-logo-sm" src={polygonLogo} />Polygon Mumbai</span> , networkName: "Polygon Mumbai" }

        }else if ([83].includes( network.chainId ) ){

            return{ success: true, status: <span id="wallet-network-info"><img className="network-logo-sm" src={meterLogo} style={{width:"5.1em"}}/></span>, networkName: "Meter Testnet" }

        }else if ( [137].includes( network.chainId ) ) {

            return{ success: true, status: <span id="wallet-network-info"><img className="network-logo-sm" src={polygonLogo} />Polygon Mainnet</span>, networkName: "Polygon Mainnet" }

        } else{

            return{ success: true, status: `${network.name}` }
        }
        
    } catch (error) {
        console.log(error)
        return{success: false, status: error}
    }
}
//Named Exports
export { handleShutDown, handleWithdrawToOwner, handleSetTotalSupply, showNetwork, handleEnterRaffle, sleep }