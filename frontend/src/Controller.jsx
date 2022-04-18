import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { Form, NetworkSelectMenu  } from "./Form3"
import abi from './utils/RafflePseudo4.json';
import { showNetwork, handleEnterRaffle, sleep, } from "./HelperFunctions"
import splash from './images/splash-optimized.png'

const admin1 = import.meta.env.VITE_CONTRACT_CHAINBLOCK_ADDR
const admin2 = import.meta.env.VITE_CONTRACT_CODESPORT_ADDR


const Controller = () => { 

    const { ethereum } = window
    const [currentAccount, setCurrentAccount] = useState("");

    const [status, setStatus] = useState("");
    const [error, setError] = useState("");
    const [networkNameHTML, setNetworkNameHTML] = useState("");
    const [simpleNetworkName, setSimpleNetworkName] = useState("");
    const [contractAddress, setContractAddress] = useState("")  
    const [contractNetworkName, setContractNetworkName]  = useState("")  
    // const [chainIdState, setChainId]  = useState("") 

    //const contractAddress = "0xC76E1C32cE3eed1aBCd24323636378ee85b59643" 


/**
     * Meter: 0xC76E1C32cE3eed1aBCd24323636378ee85b59643
     * Rinkeby: 0x7952418216f7ff1cae90E2ab18B66221157aE4cA
     * Mumbai: 0x6D72EB7761dF2ED53789EC9ea3AEEf179Ee1494C
     * 
     * Versions to shutdown:
     *  Rinkeby: 0xEbA883FFC1d77A7Ee3B53bF779B8C5cF69711376"
     *  Rinkeby: 0x1f1ea3053fef53d7fe7c488569a7b33acb95cd47
     *  Mumbai: 0xEbA883FFC1d77A7Ee3B53bF779B8C5cF69711376"
     *  Rinkeby: 0x979560129E8B90944bd5790B538C1EB97212C092
     */

    if ( ethereum ) {
        const contractABI = abi.abi;
        var provider = new ethers.providers.Web3Provider(ethereum, "any"); //@see: https://github.com/ethers-io/ethers.js/issues/899#issuecomment-646945824
        const signer = provider.getSigner();
        var contract = new ethers.Contract(contractAddress, contractABI, signer);
    }

    

    
     const handleDestroy = async () => {
        try {

            if (ethereum) {

                let destroy = await contract.end();

                setStatus("Contract Deleted");
                console.log("Contract Deleted")
            } else {
                console.log("Ethereum object doesn't exist!");
                setError("Ethereum object doesn't exist!");
            }

        } catch (error) {
            console.log(error)
            setError(error)
        }
    }
    const handleDestroy2 = async () => {
        try {

            if (ethereum) {

                let destroy = await contract.endGame();

                setStatus("Contract Deleted");
                console.log("Contract Deleted")
            } else {
                console.log("Ethereum object doesn't exist!");
                setError("Ethereum object doesn't exist!");
            }

        } catch (error) {
            console.log(error)
            setError(error)
        }
    }

     const handleGetJackpotSize = async () => {
        try {

            if (ethereum) {

                let jackpotSize = await contract.jackpotPrizeAmount();
                console.log(jackpotSize)
                jackpotSize = ethers.utils.formatEther(jackpotSize)
                setStatus("Jackpot Size = " +  jackpotSize);
                console.log(jackpotSize)


        } else {
            console.log("Ethereum object doesn't exist!");
        }
        } catch (error) {
        console.log(error)
        }
    }
    const handleGetUserLog = async () => {
        try {

            if (ethereum) {
                const array = await contract.getUserActivityLog(currentAccount);

                console.log(ethers.utils.formatEther(array[0]))
                console.log(ethers.utils.formatEther(array[1]))
                console.log(array[2].toString())
                console.log(ethers.utils.formatEther(array[3]))
               // return

            try{
                
                       const  dep = ethers.utils.formatEther(array[0])
                       const  win = array[1].toString()
                       const  loss = array[2].toString() 
                       const  bal = ethers.utils.formatEther(array[3])

                    
                    // array.map( ( singleItem, index ) =>{
                        //TODO: Perhaps, have solidity return and object with field names?


                    // })

                     //  setStatus("User Logs: " +  array);
                    setStatus(
                        <div style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}> 
                            <div>Deposit: {dep}</div> 
                            <div>Wins: {win}</div>
                            <div>Losses: {loss}</div>
                            <div>Balance: {bal}</div> 
                        </div>
                    )
            }catch(error){

                setError(error)

            }
      
                   //setStatus("User Logs: " +  tx);
                    //console.log(tx)
            } else {
                console.log("Ethereum object doesn't exist!");
            }

        } catch (error) {
            console.log(error)
        }
    }

    //TODO: This function is incomplete and is not used now. Will build out further when there's free time
    const handleGetAllUserLogs = async () => { 
        try {

            //https://stackoverflow.com/questions/4329092/multi-dimensional-associative-arrays-in-javascript
            const userActivity = []
            if (ethereum) {

                //the unique index will be timestamp

                const ipAddresLogs = await contract.getIPAddressLogs();
                const walletAddressLogs = await contract.getBindWalletToIpByIndex();
                const timestampLogs = await contract.getBindLastPlayedTimestampToIPByIndex();


                var people = ['fred', 'alice'];
                var fruit = ['apples', 'lemons'];
                
                let grid = {};
                for(let i = 0; i < ipAddresLogs.length; i++){
                    let ipAddress = ipAddresLogs[i];
                    if(ipAddress in grid == false){
                        grid[ipAddress] = {}; // must initialize the sub-object, otherwise will get 'undefined' errors
                    }
                
                    for(var j = 0; j < fruit.length; j++){
                        var fruitName = fruit[j];
                        grid[name][fruitName] = 0;
                    }
                }



                for ( let i=0; i < allWallets.length; i++ ){

                    singleWallet = allWallets[i]
                    userActivity[i] = await contract.getUserActivityLog(singleWallet)

                }

                console.log(ethers.utils.formatEther(array[0]))
                      let  dep = ethers.utils.formatEther(array[0])
                       let  win = array[1]
                       let  loss = array[2]
                       let  bal = ethers.utils.formatEther(array[3])
                    setStatus(
                        <div style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}> 
                            <div>Deposit: {dep}</div> 
                             <div>Wins: {win}</div>
                            <div>Losses: {loss}</div>
                            <div>Balance: {bal}</div> 
                        </div>
                    )

      

                //setStatus("User Logs: " +  tx);
                //console.log(tx)
        } else {
            console.log("Ethereum object doesn't exist!");
        }
        } catch (error) {
        console.log(error)
        }
    }

    const handleGetWinningNumber = async () => {
        try {

            if (ethereum) {
                let tx = await contract.lastWinningNumber();
                tx = tx
                setStatus("Winning Number: " +  tx);
                console.log(tx)
        } else {
            console.log("Ethereum object doesn't exist!");
        }
        } catch (error) {
        console.log(error)
        }
    }

////////////////////////////////////
    const checkIfWalletIsConnected = async () => {
        try {

            if (!ethereum) {  
                console.log("Make sure you have metamask!");
                setError(<a target="_blank" href={`https://metamask.io/download.html`}> Make sure you have metamask.</a>)
                return;
            } else {
                console.log("Metmask is installed");
                //setStatus("Wallet connected!");
            }

            const accounts = await ethereum.request({ method: 'eth_accounts' });

            if (accounts.length !== 0) {
                //const account = accounts[0];
                console.log("checkIfWalletIsConnected(): Found an authorized account: " + accounts[0]);
                setStatus("Found an authorized account: " + accounts[0])
                setError("")

                setCurrentAccount(accounts[0])

                onNetworkChange('checkIfWalletIsConnected()')
                             
            } else {
                console.log("Connect to Metamask using the top right button")
                setError(
                    <>
                    <div style={{ position: "absolute", padding: ".5em" }}>Connect to Metamask using the top right button</div> 
                    
                    <img style={{ marginTop: "3em", width: "80%" }}src={splash} alt="splash image" />
                    </>          
                )               
            }

        } catch (error) {
            console.log(error.message);
            setError(error.message)         
        }
    }

    const connectWallet = async () => {
        try {

            if (!ethereum) {
                alert("Get MetaMask!");
                setError("Make sure you have metamask")
                return;
            }
            
            const accounts = await ethereum.request({ method: "eth_requestAccounts" });

            console.log("Message from 'connectWallet()': Now connected to: " + accounts[0]);
            setCurrentAccount(accounts[0]);

            onNetworkChange('connectWallet')
            
        
        } catch (error) {
            console.log(error.message);
            setError(error.message)  
        }
    }

    const addWalletListener = async () => {

        if (ethereum) {

            ethereum.on("accountsChanged", (accounts) => {

                if (accounts.length > 0) {

                    setCurrentAccount( accounts[0] )
                    setStatus("Connected to a new wallet address: " + currentAccount)
                    setError("")

                    //onNetworkChange('addWalletListener()')

                } else {

                    setCurrentAccount("")
                    setStatus("") 
                    console.log("Message from 'addWalletListener': Connect your wallet by clicking the top right button")
                    setError("Connect your wallet by clicking the top right button")
           
                }
            });

            //https://stackoverflow.com/q/70663898/946957  https://docs.metamask.io/guide/ethereum-provider.html#methods
            ethereum.on('chainChanged', (chainId) => {

                console.log(`Hex formatted chain id: ${chainId}`)
                console.log(`Decimal formatted chain id: ${parseInt(chainId, 16)}`) //hex to number: 
                //console.log(`Decimal formatted chain id: ${(chainId)}`)

                onNetworkChange('addWalletListener()')
                setError("")

                window.location.reload()

                // if(chainId !== "0x13881") {

                //     setError("Please connect on testnet Polygon Mumbai")

                // } else {

                //     setError("")
                //     window.location.reload()

                // }

            })

            // provider.on("network", (network, oldNetwork) => {
                ////https://github.com/ethers-io/ethers.js/issues/899#issuecomment-646945824 https://ethereum.stackexchange.com/a/123347
            //     console.log(network);

            //     if (oldNetwork.name !== null ){

            //         console.log("Detected a network change from " + oldNetwork.name + " to " + network.name + " Auto-reloading your browser in 2 seconds!")

            //         setStatus("Detected a network change from " + oldNetwork.name + " to " + network.name + " Auto-refreshing your browser in 5 seconds!")

            //          setError("")
    
            //         sleep(5000)

            //     }                

            //    // window.location.reload()
            // });



        } else {

            setError(<a target="_blank" href={`https://metamask.io/download.html`}> Click here to learn install and learn more about Metamask.</a>)

        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
        addWalletListener()        

    }, [])
////////////////////////////////////////////////

const handleCopyText =  (textToCopy) => {
    navigator.clipboard.writeText(textToCopy)
    setStatus("Successfully copied " + textToCopy + "to clipboard")
}

const onNetworkChange = async ( callingFunctionName ) =>{
    const network = await provider.getNetwork()
    console.log( `${callingFunctionName} Has Called Network Detector. Raw Network Name: ${network.name}`)    
    const callback = showNetwork( network );

    if (callback.success === true){
        
        setNetworkNameHTML(callback.status)

        setSimpleNetworkName(callback.networkName)

        setStatus("You're now Connected to: " + callback.networkName)

        console.log("You're now Connected to: " + callback.networkName)

        

        setError("")
        
     }else{
         
        
        setError(callback.error)
     }
}

const onContractChange_select = async (event) => {
    
    const array  = event.target.value.split(',') ///contractAddress, network name, chainId
    //setContractAddress(0)
    setError("")
    setContractAddress(array[0]) 
    setContractNetworkName(array[1])
    // console.log("Selected Contract: " +  contractAddress)
    // console.log("Selected Contract Array Read: " +  array[0])

    // sleep(5000)
    // console.log("reading Selected Contract State after 5s sleep: " + contractAddress )

    console.log( 'Dapp Connected to: ' + array[1].toLowerCase()) //[0].toUpperCase() + array[1].substring(1)

    console.log('Wallet Connected to: ' + simpleNetworkName.toLowerCase())
    if (simpleNetworkName.toLowerCase() != array[1].toLowerCase() ){

        // sleep(5000)
        //setStatus( `Running Contract ${contractAddress} on ${array[1]} `)
        setError( `Wallet connected to Wrong Network. Please connect your wallet to ${array[1]} `)
        setStatus("")

    }else{
        setStatus( `Wallet connected to compatible network. Running contract on ${array[1]} `)
        setError("")

    }

} 

const onEnterRaffle_pressed = async (event) => {
    event.preventDefault()   
    const callback = await handleEnterRaffle(ethers, event, contract, provider);
    callback.success ? setStatus(callback.status) : setError(callback.error)
} 


    const getContractProperties = async ( get /* readonly contract function */, command /* name of state to update */ ,
     message /* Status Message */, format=false /* eth || base64 */ ) => {
        try{  

            let output = ( await get)
               
            if (format === 'eth') {

                output =  ethers.utils.formatEther( output )
                command(  `${message} ${output}` )

            } else if (format === 'base64'){
                
                output =  output.split(',')
                let [, output1] = output //https://github.com/oliver-moran/jimp/issues/231
                output = atob(output1)
                command( <span style={{fontSize:".5em", margin:"0 2em", maxWidth:"44%", overflow:"scroll"}}> {output} </span> )
            
            } else {

                command( `${message} ${output}` )

            }

        } catch (error) {

            if ( error.message.includes('call revert exception') ){
                setError(`Network Mismatch: A contract from ${contractNetworkName} is loaded. But your wallet is connected to ${simpleNetworkName}`)

            } else if ( error.message.includes('resolver or addr') ) {

                setError(`No Network Selected: Connect to ${simpleNetworkName} using the select menu`)

            }else{

                setError(error.message)
                console.log(error.message) 
            }

        }        

    }  
        //inline styles using CSS objects
        const buttonCSS = {

            display: 'flex',
            justifyContent: 'center',
            width: '50%',
            marginTop: '1em'

        }

    let form = null
    let viewWalletStatus = null
    let allUserLogsButton = null
    let winningNumberButton = null
    let userLogButton= null
    let jackpotButton = null
    let destroyButton = null
    let contractNetwork = null


    if (!currentAccount ){

        viewWalletStatus = <button className="kviMVi" onClick={connectWallet}>Connect Wallet</button>
    
    } else {
        viewWalletStatus = 
        <>
        {networkNameHTML}
        <button className="kviMVi" onClick={() => handleCopyText(currentAccount) }><b>Connected:</b> {String(currentAccount).substring(0, 6) + "..." + String(currentAccount).substring(38)}</button>
        </>


        contractNetwork = <NetworkSelectMenu callBack={onContractChange_select} />
        form = <Form callBack={onEnterRaffle_pressed}/>  

        jackpotButton =  <button className="kviMVi" onClick={ () => getContractProperties( contract.jackpotPrizeAmount(), setStatus, "The current Jackpot  is: ", "eth" ) } >Jackpot Size</button>


        winningNumberButton = <button className="kviMVi" onClick={ () => getContractProperties( contract.lastWinningNumber(), setStatus, "The Most Recent Winning Number was: " ) } >Get Latest Winning Number</button>




        userLogButton =  <button className="kviMVi" onClick={handleGetUserLog}>View My User Log</button>
    }

    if(currentAccount == admin1 || currentAccount == admin2 ){
        allUserLogsButton = <button className="kviMVi adminButton" onClick={handleGetAllUserLogs}>Get All Logs</button>
        //getIPAddressButton = 
        // destroyButton = <button className="kviMVi" onClick={handleSetDestroy}>Delete App</button>
    }
  
        
    return(
        <React.Fragment>
            <div className="connectButton">
                {viewWalletStatus}
            </div>
            {contractNetwork}
            {form}    
            <div className="center">{jackpotButton} {winningNumberButton} {userLogButton}</div>
            <span id="status" className="center">{status}</span><span className="error center">{error}</span>
            <div id="admin" className="center">{allUserLogsButton }{destroyButton}</div>    
                
        </React.Fragment>

    )



  
}


export default Controller