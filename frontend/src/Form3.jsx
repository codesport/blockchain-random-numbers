
import React, {useState} from 'react';


    const Form =  ( {callBack} ) =>{
        
        return(
            <div className="center">
                <form onSubmit={callBack}>
                <fieldset>
                    <legend>Blockchain Raffle Machine</legend>
    
                    <label>Choose a Random Number Generator</label>
                    <div>
                        <select id="" name="numberGenerator" required defaultValue={2}>
                            <option value  disabled>--Quantity Units--</option>
                            <option value="1">Chainlink Verifiable Random Number Function (VRF)</option>
                            <option value="2">In-house Pseudo Random Function</option>                       
                        </select>                                   
                    </div>    
                    <p> </p>
                    <label>Guess a number between 1 and 100:</label>
                    <input
                            type='number'
                            name='guess'
                            // placeholder='3'
                            size='4'
                            min='1'
                            max='100'
                            required    
                    />
                   <p> </p>
                    <label> Enter the Amount of ETH Your would like to Wager:</label>    
                    <input
                            type='number'
                            name='wager'
                            placeholder='0.05'
                            min='0.01'
                            step='0.01'
                            size='5'
                            required 
                           
                        />            
                    </fieldset>
                    <div className="enterRaffleButton">
                        <button type='submit' className="kviMVi " id="enterRaffle">Enter Raffle </button>            
                    </div>
                </form>
                
            </div>
    
    
        )  
    
    }


    //https://dev.to/antdp425/populate-dropdown-options-in-react-1nk0
    //https://stackoverflow.com/a/5024082
    function NetworkSelectMenu({callBack}){    

        const contractMeta =  [  
            {"chainId": 83, "networkName": "Meter Testnet", "contractAddress": "0xC76E1C32cE3eed1aBCd24323636378ee85b59643" },
            {"chainId": 4, "networkName": "Rinkeby", "contractAddress": "0x7952418216f7ff1cae90E2ab18B66221157aE4cA"}, 
            {"chainId": 80001, "networkName": "Polygon Mumbai", "contractAddress": "0x6D72EB7761dF2ED53789EC9ea3AEEf179Ee1494C"} 
        ] 

        // const handleContractChange = (event) =>{

        //     console.log(event.target.value)
        //     //setSelectedContract(event.target.value)
        //     return{success: true, status: event.target.value}

        // }

        const options = contractMeta.map( (singleItem) =>        
                        <option key={singleItem.chainId} value={[singleItem.contractAddress, singleItem.networkName, singleItem.chainId]}>{singleItem.networkName}</option>
                    )        

                    // defaultValue={[contractMeta[0].contractAddress, singleItem[0].networkName,  contractMeta[0].chainId] }
        return(

            <div className='center'>
            <label style={{position:"absolute", fontSize:"1.3em", marginTop:"-0.6em"}}>Select An EVM Network</label>
            <select id="selectContract" name="chain" onChange={()=>callBack(event)} defaultValue={0} style={{marginLeft: "0em"}}>
                <option value="0"> -- Select a Network -- </option>
                {options}
            </select>  
            </div>
        )
    
    
    }
    


    //Named Exports
export { Form, NetworkSelectMenu }