/**
 * references:
 * @link https://stermi.medium.com/how-to-create-tests-for-your-solidity-smart-contract-9fbbc4f0a319
 * @link https://learn.figment.io/tutorials/create-nft-smart-contract-with-hardhat#testing-the-smart-contract
 * @link https://ethereum-waffle.readthedocs.io/en/latest/matchers.html?highlight=events#revert
 * @link https://hardhat.org/tutorial/testing-contracts.html
 * @link https://hardhat.org/guides/waffle-testing.html 
 * 
 * Event Logging and testing:
 * 
 * @link https://ethereum.stackexchange.com/a/110049
 * @link https://ethereum.stackexchange.com/a/87669/3506
 * @link https://stackoverflow.com/questions/68168566/how-do-i-listen-to-events-from-a-smart-contract-using-ethers-js-contract-on-in
 * @link https://docs.ethers.io/v5/concepts/events/
 * @link https://www.google.com/search?q=access+the+contract%27s+event+with+ethersjs
 * @link https://betterprogramming.pub/learn-solidity-events-2801d6a99a92
 * @link https://ethereum.org/en/developers/tutorials/waffle-dynamic-mocking-and-testing-calls/
 * @link https://ethereum.org/sl/developers/tutorials/waffle-test-simple-smart-contract/
 * 
 *  
 * npx hardhat test  //to run script
 * 
 * PRO-TIP:
 *  Convert decimal to ether: ethers.utils.parseEther('1') = ethers.utils.parseUnits('1', 18) = 1e18
 *  Convert ether and BigNumber to decimal: ethers.utils.formatEther( onChainBigNumber )
 * 
 * 
 */
const { expect } = require("chai");
const { ethers } = require("hardhat")
const axios = require("axios")


describe("RafflePseudo4 Smart Contract Tests", function() {//name to the set of tests we are going to perform


    //Define Globals Here

    let contract //the docs don't tell you that this must be global to the tests

    const contractDepositWhenDeployed = "1" //set as global
    let devFee = .20 // Set as global, but make a variable, not a constant.
    
    const getExternalData = async ( url ) => {
        const response = await axios.get(url);
        return response.data;
     }

    const handleWinner =  async (contract, guess, wager) =>{

        const winningNumber = await contract.lastWinningNumber();
        const jackpot = ethers.utils.formatEther( await contract.jackpotPrizeAmount() )

        if ( winningNumber !== guess){

            return "Sorry! You picked " + guess + ", but the winning number was " + winningNumber 

        } else{

            const total = jackpot + wager

            return "Congratulations! You picked the right winning number of " + winningNumber + ". You Won " + total 

        }


    }




    this.beforeEach(async function() {

        [owner, user1, user2] = await hre.ethers.getSigners(); //set as globals  

        //TEST 1: Contract Shall Deploy Successfully
        const factory = await hre.ethers.getContractFactory("RafflePseudo4");

        contract = await factory.deploy( user1.address, { value: hre.ethers.utils.parseEther( contractDepositWhenDeployed ) }); //set as global

        await contract.deployed();

    })

    it("1. Contract Balance Should Equal Deployer Deposit", async function(){
        let balance = await hre.ethers.provider.getBalance(contract.address)
        
        expect(  balance ).to.equal(hre.ethers.utils.parseEther(contractDepositWhenDeployed ) ) 

    })



    it("2. Should Fail: Trying to play without depositing fund", async function() { 

        //We hash IP Address to stop hammering
        // let fetchIP = async () => {
        //     try{
        //         const response = await fetch('https://api.ipify.org?format=json')
        //         const data = await response.json()
        //         console.log(data.ip)
        //         return(data.ip)
        //     } catch(error){     
        //         console.log(error)
        //     }
        // }

        let guess = 35
        let IPAddress = await getExternalData('https://api.ipify.org?format=json')
        IPAddress = ethers.utils.formatBytes32String( IPAddress )

        //Round 1 Play
        await expect (contract.connect(user1).userCommit( guess, IPAddress )).to.be.revertedWith('Please deposit the minimum amount to play');

    })



    it("3. Should Allow: User Submit Wager and Play 1 Round", async function() { 
        
        //Each test case: "It" function takes title for the test + a function which runs the test

        //TEST 2: Can Legitimate User Use App?
        
        //contractBalance = await hre.ethers.provider.getBalance(contract.address); 
        //let ownerBalance = await balanceOf(owner.address)


        //We hash IP Address to stop hammering
        let guess = 35
        let IPAddress = ethers.utils.formatBytes32String( await getExternalData('https://api.ipify.org') )
        let wager = "5"

        
        //Round 1 Play
        const round1 = await contract.connect(user1).userCommit( guess, IPAddress, {value: ethers.utils.parseEther( wager )} );
        await round1.wait()


        console.log( await handleWinner( contract, guess, wager) )




        /*
        ContractReceipt = await round1.wait()
        console.log(ContractReceipt.events?.filter((x) => {return x.event == "NewWinner"}))    
        */

        //.events?.filter((x) => {return x.event == "NewWinner"})     

        // const winingNumberTx = await contract.connect(user1).WinnerLog()
        // await winingNumberTx.wait()
        // console.log ("User's Guess: " + guess +  ".   Winning Number: " + winingNumberTx)

    })


    
    it("4. Should Fail: Trying to play twice within 10 minutes", async function() { 

        let guess = 35
        let IPAddress = ethers.utils.formatBytes32String( await getExternalData('https://api.ipify.org') )
        let wager = "5"
  
        //Round 1 Play
        const round1 = await contract.connect(user1).userCommit( guess, IPAddress, {value: ethers.utils.parseEther( wager )} );
        await round1.wait() // wait until the transaction is mined  
    
        //Round 2 Play With Same Wallet and Same IP
        await expect (contract.connect(user1).userCommit( guess, IPAddress, {value: ethers.utils.parseEther( wager )} )).to.be.revertedWith('Wallet Filter: Please wait a few minutes to play again');

    })

    it("5. Should Fail: Trying to play twice within 10 minutes using the same IP Address", async function() { 

        let guess = 35
        let IPAddress = ethers.utils.formatBytes32String( await getExternalData('https://api.ipify.org') )
        let wager = "5"
  
        //Round 1 Play
        const round1 = await contract.connect(user1).userCommit( guess, IPAddress, {value: ethers.utils.parseEther( wager )} );
        await round1.wait() // wait until the transaction is mined  
    
        //Round 2 Play with New Wallet and Same IP
        await expect (contract.connect(user2).userCommit( guess, IPAddress, {value: ethers.utils.parseEther( wager )} )).to.be.revertedWith('IP Filter: Please wait a few minutes to play again');

    })

    it("6. Should Allow: Throttle Removal. User2 to Play 2x. Then User1 to Play. Then Count 2 Unique Wallet Addresses Logged.", async function() { 

        let getThrottleInSecondsTx = await contract.connect(user1).throttleUser();
        expect( getThrottleInSecondsTx ).to.equal( 600 )

         //Round 1: User 2 plays once
        let guess = 75
        let IPAddress = ethers.utils.formatBytes32String( await getExternalData('https://api.ipify.org') )
        const wager1 = "10"

        const round1 = await contract.connect(user2).userCommit( guess, IPAddress, {value: ethers.utils.parseEther( wager1 )} );
        await round1.wait()

        // let winingNumberTx = await contract.connect(user2).WinnerLog()

        //Remove Throttle: Drop from 10 minutes (i.e., 600 secs) to 0 secs
        const removeThrottleTx = await contract.connect(owner).setThrottleUser( 0 );
        await removeThrottleTx.wait()
         
        //Show Updated Throttle
        getThrottleInSecondsTx = await contract.connect(user1).throttleUser();
        expect( getThrottleInSecondsTx ).to.equal( 0 )

        //Round 2: User 2 plays 2x in a row
        guess = 33
        const wager2 = "20"

        const round2 = await contract.connect(user2).userCommit( guess, IPAddress, {value: ethers.utils.parseEther( wager2 )} );
        await round2.wait()

        //Round 3: User 1 plays once
        const round3 = await contract.connect(user1).userCommit( guess, IPAddress, {value: ethers.utils.parseEther( wager1 )} );
        await round3.wait()        

        // View Public user logs
        /*
        let activityLogTx = await contract.connect(user2).getUserActivityLog( user2.address );
        // wait until the transaction is mined
        //await activitLogTx.wait()
        console.log("Player 2's Activity Log: " + activityLogTx)
        */

        //Count Unique Users Logged
        countUsersLogged = await contract.connect(user2).getAllWalletAddresses()
        expect( countUsersLogged.length).to.equal(2)


    })

    it("7. Jackpot Bal Should Equal = Contract Bal. - devFee", async function() { 

         //Round 1: User 2 plays once
        let guess = 75
        let IPAddress = ethers.utils.formatBytes32String( await getExternalData('https://api.ipify.org') )
        const wager1 = "10"

        const round1 = await contract.connect(user2).userCommit( guess, IPAddress, {value: ethers.utils.parseEther( wager1 )} );
        await round1.wait()

        // let winingNumberTx = await contract.connect(user2).WinnerLog()

        //Remove Throttle: Drop from 10 minutes (i.e., 600 secs) to 0 secs
        const removeThrottleTx = await contract.connect(owner).setThrottleUser( 0 );
        await removeThrottleTx.wait()
         
        //Show Updated Throttle
        getThrottleInSecondsTx = await contract.connect(user1).throttleUser();
        expect( getThrottleInSecondsTx ).to.equal( 0 )

        //Round 2: User 2 plays 2x in a row
        guess = 33
        const wager2 = "20"

        const round2 = await contract.connect(user2).userCommit( guess, IPAddress, {value: ethers.utils.parseEther( wager2 )} );
        await round2.wait()

        //Round 3: User 1 plays once
        const round3 = await contract.connect(user1).userCommit( guess, IPAddress, {value: ethers.utils.parseEther( wager1 )} );
        await round3.wait()        


        //Count Unique Users Logged
        countUsersLogged = await contract.connect(user2).getAllWalletAddresses()
        expect( countUsersLogged.length).to.equal(2)

        //Verify JackpotPrizeAmount is computed properly
        const currentBalance =  ethers.utils.formatEther( await hre.ethers.provider.getBalance(contract.address) )
        const jackpotPrizeAmount =  ethers.utils.formatEther( await contract.connect(user1).jackpotPrizeAmount() ) *1

        // console.log("Current Bal: " + currentBalance)
        // console.log("Jackpot From Contract: " + jackpotPrizeAmount)

        /**
         * Unary + operator

         * Also used to remove JavaScript number inaccuracies
         * @link https://stackoverflow.com/a/27231109/946957
         */
        const manuallyComputedJackpot = +(currentBalance * (1-devFee)).toFixed(2)

        // console.log("Manually Computed Jackpot: " + manuallyComputedJackpot)
        expect( manuallyComputedJackpot  ).to.equal( jackpotPrizeAmount )

    })




    it("8. devFeeEthers Should Equal Contract Balance * devFee Percent", async function() { 

         //Round 1: User 2 plays once
        let guess = 75
        let IPAddress = ethers.utils.formatBytes32String( await getExternalData('https://api.ipify.org') )
        const wager1 = "10"

        const round1 = await contract.connect(user2).userCommit( guess, IPAddress, {value: ethers.utils.parseEther( wager1 )} );
        await round1.wait()

        // let winingNumberTx = await contract.connect(user2).WinnerLog()

        //Remove Throttle: Drop from 10 minutes (i.e., 600 secs) to 0 secs
        const removeThrottleTx = await contract.connect(owner).setThrottleUser( 0 );
        await removeThrottleTx.wait()
         
        //Show Updated Throttle
        getThrottleInSecondsTx = await contract.connect(user1).throttleUser();
        expect( getThrottleInSecondsTx ).to.equal( 0 )

        //Round 2: User 2 plays 2x in a row
        guess = 33
        const wager2 = "20"

        const round2 = await contract.connect(user2).userCommit( guess, IPAddress, {value: ethers.utils.parseEther( wager2 )} );
        await round2.wait()

        //Round 3: User 1 plays once
        const round3 = await contract.connect(user1).userCommit( guess, IPAddress, {value: ethers.utils.parseEther( wager1 )} );
        await round3.wait()        


        //Verify Dev Fee is Computed Properly
        const currentBalance =  ethers.utils.formatEther( await hre.ethers.provider.getBalance(contract.address) )
        const contractDevFee = ethers.utils.formatEther( await contract.connect(user1).getDeveloperRefund() ) * 1
        const manuallyComputedDevFee = +( currentBalance * devFee ).toFixed(2)

        // console.log("Manually Computed devFeeEthers: " + manuallyComputedDevFee )
        // console.log("Contract devFeeEthers: " + contractDevFee )

        expect( manuallyComputedDevFee  ).to.equal( contractDevFee )

    })


    it("9. Should Allow: Emit WinnerLog", async function () {
        //emit WinnerLog( getAllWalletAddresses().length, msg.sender, block.timestamp, userPayout, pseudoRandomNumber  )
        
        await expect(contract.testEmitter( 100, 30))
          .to.emit(contract, "WinnerLog")
          .withArgs( 0, owner.address, ( await contract.connect(owner).getBlockTime() ),  100, 30 );

    });



    it("10. Should Allow: User To Win Jackpot When Modulo/Probability is 1 and user Guesses 1", async function () {

        let newModuloProbability = 1

         //Round 1: User 1 plays once and seeds jackpot
         let guess = 55
         let IPAddress = ethers.utils.formatBytes32String( await getExternalData('https://api.ipify.org') )
         const wager = "28"
 
         const round1 = await contract.connect(user1).userCommit( guess, IPAddress, {value: ethers.utils.parseEther( wager )} );
         await round1.wait()

        //Guarantee winner by setting modulo to 1
         const setProbabilityModulo = await contract.connect(owner).setProbabilityModulo(  newModuloProbability )
         await setProbabilityModulo.wait()

         let jackpotPrizeAmount =  ethers.utils.formatEther( await contract.connect(user1).jackpotPrizeAmount() ) *1
         
         //Round 2: User 2 plays once 
         guess = 1
         IPAddress = ethers.utils.formatBytes32String( '192.168.133.122' )
         
         const round2 = await contract.connect(user2).userCommit( guess, IPAddress, {value: ethers.utils.parseEther( wager )} );
         await round2.wait()         


        let userLog = await contract.connect(user2).getUserActivityLog(user2.address)
        let numWins = userLog[1]
        let balance = ethers.utils.formatEther( userLog[3] ) *1

        // console.log( "User Wins: " + numWins + "\n User Balance: " + balance )

         expect( numWins ).to.equal( 1  )

    });   




    it("11. Should Allow: Winning User's Payout === Jackpot Prize Amount + Winning User's Wager", async function () {

        let newModuloProbability = 1       

         //Round 1: User 1 plays once and seeds jackpot
         let guess = 55
         let IPAddress = ethers.utils.formatBytes32String( await getExternalData('https://api.ipify.org') )
         const wager = "5"
 
         const round1 = await contract.connect(user1).userCommit( guess, IPAddress, {value: ethers.utils.parseEther( wager )} );
         await round1.wait()

        //Guarantee winner by setting modulo to 1
         const setProbabilityModulo = await contract.connect(owner).setProbabilityModulo(  newModuloProbability )
         await setProbabilityModulo.wait()

         let jackpotPrizeAmount =  ethers.utils.formatEther( await contract.connect(user1).jackpotPrizeAmount() ) *1
         
         //Round 2: User 2 plays once 
         guess = 1
         IPAddress = ethers.utils.formatBytes32String( '192.168.133.122' )

         let expectedJackpot =  jackpotPrizeAmount  + Number(wager) 
         
         const round2 = await contract.connect(user2).userCommit( guess, IPAddress, {value: ethers.utils.parseEther( wager )} );
         await round2.wait()         


        let userLog = await contract.connect(user2).getUserActivityLog(user2.address)
        let numWins = userLog[1]
        let balance = ethers.utils.formatEther( userLog[3] ) *1

        // console.log( "User Wins: " + numWins + "\n User Balance: " + balance )

         expect( numWins ).to.equal( 1  )

        //  console.log("Jackpot before user wins: " + jackpotPrizeAmount) 
        //  console.log("wager: " +  Number(wager) )
        //  console.log("Expected Jackpot Before User Wins (jackpot + user deposit): " + expectedJackpot) 

         expect( +(balance).toFixed(10)  ).to.equal( +( expectedJackpot ).toFixed(10)  )


    });       

    it("12. Should Allow: Owner to Withdraw Dev Fee When Jackpot Balance is Zero", async function () {

        let newModuloProbability = 1
        

         //Round 1: User 1 plays once and seeds jackpot
         let guess = 55
         let IPAddress = ethers.utils.formatBytes32String( await getExternalData('https://api.ipify.org') )
         const wager = "10"
 
         const round1 = await contract.connect(user1).userCommit( guess, IPAddress, {value: ethers.utils.parseEther( wager )} );
         await round1.wait()

        //Guarantee winner by setting modulo to 1
         const setProbabilityModulo = await contract.connect(owner).setProbabilityModulo(  newModuloProbability )
         await setProbabilityModulo.wait()


        //Check Balances Before User Wins:
        let currentBalance =  ethers.utils.formatEther( await hre.ethers.provider.getBalance(contract.address) )
        //console.log("Current Balance Before User Wins: " + currentBalance) 

        let jackpotPrizeAmount =  ethers.utils.formatEther( await contract.connect(user1).jackpotPrizeAmount() ) *1 
       // console.log("Jackpot Before User Wins: " + jackpotPrizeAmount) 

        let devFeeEthers = ethers.utils.formatEther( await contract.connect(user1).getDeveloperRefund() ) * 1
        //console.log("Contract devFeeEthers Before User Wins:: " + devFeeEthers )

        expect( +(currentBalance * devFee).toFixed(2)  ).to.equal( devFeeEthers )

        expect( +(currentBalance - jackpotPrizeAmount).toFixed(2) ).to.equal( devFeeEthers )
         
         //Round 2: User 2 plays once 
         guess = 1
         IPAddress = ethers.utils.formatBytes32String( '192.168.133.122' )
         
         const round2 = await contract.connect(user2).userCommit( guess, IPAddress, {value: ethers.utils.parseEther( wager )} );
         await round2.wait() 


         //TODO: 1. Event should be auto-emitted. Console.log it here
         //console.log( round2.receipt.rawLogs )


        //Check Balances After User Wins:
         currentBalance =  ethers.utils.formatEther( await hre.ethers.provider.getBalance(contract.address) ) * 1
         //console.log("Current Balance After User Wins: " + currentBalance) 
 
         jackpotPrizeAmount =  ethers.utils.formatEther( await contract.connect(user1).jackpotPrizeAmount() ) * 1          
         //console.log("Jackpot After user Wins: " + jackpotPrizeAmount)

         devFeeEthers = ethers.utils.formatEther( await contract.connect(user1).getDeveloperRefund() ) * 1
         //console.log("Contract devFeeEthers After a user Wins: " + devFeeEthers )

 
         expect( currentBalance   ).to.equal( devFeeEthers )


         //3. Allow owner to withdraw devFee      
         await contract.connect(owner).withdrawDeveloperRefund()  
         

         //4.  Get current balance and confirm it dropped to zero:
         currentBalance =  ethers.utils.formatEther( await hre.ethers.provider.getBalance(contract.address) ) * 1

         expect( currentBalance  ).to.equal( 0 )

         //console.log("Current Balance After Owner Withdrawal: " + currentBalance) 


    });    
    
    it("13. Should Fail: When Non-Staff User Accesses onlyStaff Functions ", async function () {
        
        await expect ( contract.connect(user2).endGame() ).to.be.revertedWith('Function may only be called by the owner or a staff member');
        await expect ( contract.connect(user2).getStaffWalletAddress() ).to.be.revertedWith('Function may only be called by the owner or a staff member');
        await expect ( contract.connect(user2).getBindLastPlayedTimestampToIPByIndex() ).to.be.revertedWith('Function may only be called by the owner or a staff member');

    });

    
    it("14. Should Fail: When Non-Staff User Accesses onlyOwner Functions ", async function () {
        
        await expect ( contract.connect(user2).endGame() ).to.be.revertedWith('Function may only be called by the owner or a staff member');
        await expect ( contract.connect(user2).getStaffWalletAddress() ).to.be.revertedWith('Function may only be called by the owner or a staff member');
        await expect ( contract.connect(user2).getBindLastPlayedTimestampToIPByIndex() ).to.be.revertedWith('Function may only be called by the owner or a staff member');

        await expect ( contract.connect(user2).setThrottleUser( 200 ) ).to.be.revertedWith('This function may only be called by contract owner');
        await expect ( contract.connect(user2).setMinWager(  hre.ethers.utils.parseEther("5") ) ).to.be.revertedWith('This function may only be called by contract owner');    
        
        await expect ( contract.connect(user2).setDevFee(  hre.ethers.utils.parseEther("0.20") ) ).to.be.revertedWith('This function may only be called by contract owner');   

    });

    it("15. Should Allow: Owner Setting Dev Fee to 10% ", async function () {

        const newDevFee = 0.10
        const newFormattedDevFee = ethers.utils.parseEther("0.10")
        
        const setDevFee = await contract.connect(owner).setDevFee(  newFormattedDevFee )
        await setDevFee.wait()
         
        const getDevFee =  ethers.utils.formatEther( await contract.connect(user1). devFee() ) * 1

        expect( getDevFee ).to.equal(  newDevFee  )

    });    


})

//npx hardhat test