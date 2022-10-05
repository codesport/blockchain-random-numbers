**Attribution:** This dApp was created by Marcos (Marcus) A. B. His GitHub username is [codesport](https://github.com/codesport)

# Key Takeaway and Lesson Learned: Unit Tests are Your Friend

The key takeaway from this project is that, at a minimum, thorough unit tests must be performed (and pass) on all functions that handle and compute money.  

Additionally, unit tests should be applied incrementally. This means if a function named `function fourthCalculation()` is  dependent on results from 3 other functions, first test those 3 "feeder" functions individually. Afterwards, combine the logic of those three prior tests into to your final test targeting `function fourthCalculation()`.

In short, lumping multiple calculations into a single test without incrementally testing them individually may hide flaws in your logic.

Finally, console logging function outputs and test assertions are critical to gain visibility into your dApps functionality.

# Overview and Navigation

* [Technical Deep Dive: Randomness on Blockchains](#technical-deep-dive-randomness-on-evm-compatible-blockchains)
* [Technical Details: In-house, Pseudo-Random Number Generator](#technical-details-in-house-pseudo-random-number-generator)
* [Unit Testing](#unit-testing)
* [Proactive Contract Exploit Blocking: Off-Chain Auditing, onlyEOA, and Usage Throttling By IP and Wallet Addresses](#proactive-contract-exploit-blocking-off-chain-auditing-onlyeoa-and-usage-throttling-by-ip-and-wallet-addresses)
* [Conclusion, Next Steps, and Contract Deployment](#conclusion-next-steps-and-contract-deployment)
* [References](#references)


This repo showcases a proof of concept, in-house a random number generator.  It has been integrated in a Raffle/Lotto game and deployed to Ethereum's Rinkeby, Polygon's Mumbai, and Meter's Warringstakes testnets.  

The winner receives the amount of the token wagered plus the entire jackpot balance!

Given my INFOSEC background, I found this exercise quite fun, but extremely challenging. Fun, in finding ways to exploit the contract! And then coding in countermeasures.  However, it was also extremely challenging and difficult given the paucity of clear and up-to-date resources on Solidity contract development. 


![Blockchain Raffle Machine: UI MVP](https://github.com/codesport/blockchain-random-numbers/blob/master/frontend/src/images/app-dashboard.png "MVP UI for Blockchain Raffle Machine")


# Technical Deep Dive: Randomness on EVM Compatible Blockchains

Blockchains are immutable and deterministic. Hence, producing on-chain randomness is a non-trivial problem.  For this project a working Proof-Of-Concept (POC) random number generator was evaluated with 3 possible implementations: 

 1.  Harmony offers an [on-chain VRF](https://docs.harmony.one/home/developers/tools/harmony-vrf). It is based on the value of an arbitrary and unknown future block. Owing to time constraints, Harmony's VRF was not used in this project. 
 
 2.  [Chainlink VRF](https://vrf.chain.link) uses a fully non-deterministic and off-chain VRF which was tested for this POC 
 
 3. A [naive pseudo-random number generator](https://github.com/codesport/blockchain-random-numbers/blob/master/contracts/RafflePseudo4.sol#L260-L301) was built and also used in this POC.  It is analyzed in the discussions that follow.

 The naive generator is demonstrated in this on-chain [Raffle/Lotto](https://github.com/codesport/blockchain-random-numbers/blob/master/contracts/RafflePseudo4.sol) game which pays out winning in the network's native token.

A *commit-and-reveal* design pattern was also deployed. Random numbers between 0 and 99 were forced by applying modulo 100 to the the generated number.


## Technical Details: In-house, Pseudo-Random Number Generator 

A smart contract called [RafflePseudo4.sol](https://github.com/codesport/blockchain-random-numbers/blob/master/contracts/RafflePseudo4.sol) was created to test Chainlink's VRF as well as an in-house random number generator. The solidity code is heavily commented with details.

The in-house, random number generator is based on a mix of deterministic and non-deterministic values. These include of 

* Current `block.timestamp` 
* Current `block.difficulty`
* Pseudo-random number generated from previosu round
* Past players `wallet addresses` 
* Time stamped of a previous player's last round
* A seed which constitutes of all of the abovesand a seed. 

The below  is a synopsis of the [in-house number generator](https://github.com/codesport/blockchain-random-numbers/blob/master/contracts/RafflePseudo4.sol#L240-L274):

```
/*
* block.difficulty, block.timestamp and a private are summed to create a pseudo random number
*/
function setPseudoRandomNumber() private return (uint256){

    /*
     * 6a. Generate Pseudo Random Number: 
           = block.difficulty +  block.timestamp +  seed + randAddress + randTimestamp
     */
    function setPseudoRandomNumber() private returns (uint256){

        //1. generate dynamic random number based on 3 dynamic inputs
        //NB: Improved "pseudo-randomness" by dynamically choosing a 
        //timestamp and wallet address from the userLogs array

        uint256 index;
        uint256 arrayLen = getAllWalletAddresses().length;
        address randAddress = 0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB;
        uint256 randTimestamp = 345678765;

       
        if ( lastWinningNumber >= arrayLen){

            index = lastWinningNumber - arrayLen;
            //if (index > arrayLen) index = 0;

        } else {

            index = arrayLen - lastWinningNumber;
            
        }
        
        if (index <= arrayLen && index != 0){
            randAddress = getOneWalletAddressByIndex( index );
            randTimestamp = users[randAddress].lastPlayedTimestamp;
        }
        

        uint256 pseudoRandomNumber = uint256( keccak256( abi.encodePacked( block.timestamp, 
                                      block.difficulty, seed, randAddress, randTimestamp) ) );
    
}
```

## Unit Testing

Fifteen unit tests were successfully completed on this contract. The tests are available in [raffle-test.js](https://github.com/codesport/blockchain-random-numbers/blob/master/test/raffle-test.js). The below screen capture highlights the test results:

![RafflePseudo4.sol Unit Tests](https://github.com/codesport/blockchain-random-numbers/blob/master/frontend/src/images/raffle-pseudo4-unit-tests.png "RafflePseudo4.sol Unit Test")


Interestingly, unit testing revealed that Solidity does not always handle fractions as expected.

Specifically: `jackpotPrizeAmount = address(this).balance * (1- devFee/10**18)` resulted in `jackpotPrizeAmount = address(this).balance`

The workaround entailed:

```
uint256 devFeeInEther = address(this).balance * devFee/10**18; 
jackpotPrizeAmount = address(this).balance - devFeeInEther; 
```

Which *should* the same as:   `jackpotPrizeAmount = address(this).balance  -  address(this).balance * devFee/10**18`.  However, it also failed by giving as value of `1 = address(this).balance  - address(this).balance * devFee/10**18`



## Proactive Contract Exploit Blocking: Off-Chain Auditing, onlyEOA, and Usage Throttling By IP and Wallet Addresses

This contract was built from the perspective of a would-be attacker hunting for exploits. Hence, the first course of business was permanent tracking of user activity while protecting user privacy. The ensuing lines of code in this section analyze this contract's security tracking schema. 

a. On-chain Logging:  each user's timestamp, IP (stored as a `bytes32` type), and wallet addresses are loosely bound in three separate arrays. Because these arrays are updated "simultaneously"  within the same function, their indices remain the same. 

b. Off-chain Analysis: The binding by index allows for the creation of an [off-chain multi-dimensional array](https://stackoverflow.com/questions/4329092/multi-dimensional-associative-arrays-in-javascript) either through a frontend JavaScript app or a more ideally backend server running PHP.  PHP can easily build and manipulate multidimensional associative arrays

### 1. Detecting and Fixing a Flaw in the Contract

**Important:** As a result of this write-up, a flaw was detected in the original contract's ability to track users in an off-chain multidimensional array. The flaw is due to the way hash tables work.  [Duplicate keys names cannot exists in hash tables](https://ethereum.stackexchange.com/a/32014), and are thus overwritten. Hence, it would not work for tracking historical other than the last login (i.e.,  t_now - 1)

 As such, the fix entails using the "right tool for the right job". Hash table lookups are fast and efficient. The hash table should be used to quickly check when a wallet last logged in., but not for off-chain historical analysis. 

Hence in addition to this on line 29:

```
// In line 29, IP address is bound to a timestamp by means of a hash table 
// (called a mapping in Solidity vernacular).  However this implementation 
// cannot be used for historical analysis other tha t -1. Duplicate key names
// may not exist in hash tables. Any previous key-value pair would always 
// be overwritten each time the user enters the raffle:

mapping(bytes32 => uint256) public lastPlayedTimestamp;    //3a. security apply throttle by IP address. Store in simple hash table
```

This array must be created:

```
bytes32[] private  bindLastPlayedTimestampToIPByIndex;
```

Thus the updated contract will now have Lines 80 - 87 show that:
```
/**
    * C. These 3 arrays will be combined off-chain to audit, track, and analyze exploit attempts
    *
    *   d. IPAddress being mapped to wallet and timestamp only possible if arrays are updated in same transaction
    */
bytes32[] private IPAddressLog; //security audit: should be private and exposed by onlyStaff func
address[] private bindWalletToIPByIndex; //security audit: facilitate attacker tracing 
uint256[] private bindLastPlayedTimestampToIPByIndex; //as above
```

Line 177 calls the function that simultaneously updates the tracking arrays:
```
 updateIPAddressSecurityAuditLogs( _IPAddress );
```

And, lines 362 - 372 are is the utility function that does the logging:
```
function updateIPAddressSecurityAuditLogs(bytes32 _IPAddress ) private{

    lastPlayedTimestamp[_IPAddress] = block.timestamp; //for realtime throttle tracking

    IPAddressLog.push( _IPAddress ); //@dev same index as below items. Combine all 3 for off-chain security audit

    bindWalletToIPByIndex.push( msg.sender ); //@dev same index as IPAddress.log

    bindLastPlayedTimestampToIPByIndex.push(block.timestamp); //@dev same index as IPAddress.log        

} 
```

Lines 443 - 453 show that only admins can access sensitive tracking data.
```
    function getIPAddressLogs() public view onlyStaff returns( bytes32[] memory ){   
        return IPAddressLog;
    }

    function getBindWalletToIpByIndex() public view  onlyStaff returns( address[] memory ){   
        return bindWalletToIPByIndex;
    } 
    
    function getBindLastPlayedTimestampToIPByIndexx() public view  onlyStaff returns( uint256[] memory ){   
        return bindLastPlayedTimestampToIPByIndex;
    } 
```

### 2. Blocking Function Calls from Smart Contracts (onlyEOAs)

[Smart contracts](https://ethereum.stackexchange.com/questions/93082/how-do-eoas-work-and-what-is-their-interaction-with-smart-contracts) are blocked from interacting with the game. The `function modifier` on [lines 142 - 145](https://github.com/codesport/blockchain-random-numbers/blob/master/contracts/RafflePseudo4.sol#L142-L145) enforces this rule when applied to any public and external functions.

```javascript
/** 
* 6. require(msg.sender == tx.origin, "Smart contracts cannot call this function");
*    msg.sender is last account address in a chain of function calls. tx.origin is always the EOA (human)
*    that initiated the sequence of transactions. Contracts cannot initiate transactions on their own.
* 
*    msg.sender == tx.origin, prevents smart contracts from calling this method by adding a requirement 
*    that the function caller is the same account that intitiated the tx at t=0. 
*    This is method on Ethereum that guarantees that the caller is not a smart contract. 
*    source 1: https://ethereum.stackexchange.com/a/109682/3506  
*    source 2: https://quantstamp.com/blog/proper-treatment-of-randomness-on-evm-compatible-networks
*/
modifier onlyEOA() {
    require(msg.sender == tx.origin, "Smart contracts cannot call this function");
    _;
}     
```
### 3. Usage Throttling By IP and Wallet Address

[Usage throttling](https://github.com/codesport/blockchain-random-numbers/blob/master/contracts/RafflePseudo4.sol#L101) is implemented to  restrict hammering by the same  wallet and IP addresses. Although not bulletproof due to VPNs and the ease of generating multiple wallet address, these measures do make it more challenging for an attacker to exploit the contract.

### 4. Players May View Their Activity Logs:

The `block.timestamp` and a `bytes32` hash of the  IP address are the user's last  interaction with contract are saved in a `struct`.  

Output of the log for a single user is as follows:

```
0: uint256 totalDeposits: -160000000000000000
1: uint256 totalWins: 0
2: uint256 totalLosses: 2
3: int256 balance: -160000000000000000
4: bytes32 IPAddress: 0x3137322e3136382e3133332e3133330000000000000000000000000000000000
5: uint256 lastTransactionTimestamp: 1647856990
```

### Off-Chain Security Auditing and User Log Analysis

TODO at a later date



## Conclusion, Next Steps, and Contract Deployment

Solidity is a living and strictly-typed object-oriented scripting language! This was a quite challenging project due to the limitations, quirks, and continual evolution of the Solidity codebase.  However, Solidity's rigidness is also ist strength. It makes the language easy to learn, and at times, challenging to debug! Unit test are your friend.

Next steps include:

* Deploying the UI to a live server
* Capturing the user's IP address server-side. It may be then be injected into the form data after submission.
* Blocking popular VPNs and/or certain nation-states
* Professional contract audit

The smart contract deployment and activity are available on the following networks:

* **Ethereum's Rinkeby Testnet:** [0x7952418216f7ff1cae90E2ab18B66221157aE4cA](https://rinkeby.etherscan.io/address/0x7952418216f7ff1cae90E2ab18B66221157aE4cA)
* **Polygon Mumbai:** [0x6D72EB7761dF2ED53789EC9ea3AEEf179Ee1494C](https://mumbai.polygonscan.com/address/0x6D72EB7761dF2ED53789EC9ea3AEEf179Ee1494C)
* **Meter's Warringstakes Testnet:** [0xC76E1C32cE3eed1aBCd24323636378ee85b59643](https://scan-warringstakes.meter.io/address/0xC76E1C32cE3eed1aBCd24323636378ee85b59643)


## References:

1. https://crypto.unibe.ch/archive/theses/2021.msc.peter.allemann.pdf Chapter 5.2.1
2. https://quantstamp.com/blog/proper-treatment-of-randomness-on-evm-compatible-networks
3. https://coursetro.com/posts/code/102/Solidity-Mappings-&-Structs-Tutorial









