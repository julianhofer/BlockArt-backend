const wallets = require('./wallets');
const privateKeys = require('./keys');
const ethers = require('ethers');
const smartContract = require('./contracts/ArtWorkContract')


const contractAddress = '0x36ed56f5e2160d46c3cbeee285298cbe2f0b0022';
const provider = new ethers.providers.JsonRpcProvider('https://ropsten.infura.io/v3/6a9086d09c8a4e0e99c279571ee00bad');
const abi = smartContract.abi;
const contract = new ethers.Contract(contractAddress, abi, provider);
module.exports = contract;

let wallet = new ethers.Wallet("0x" + privateKeys[2], provider);
let contractWithSigner = contract.connect(wallet);


transferOwner();
// transferEvent();

async function transferOwner() {

    contract.owner().then((owner) => {
        console.log("oldOwner: ", owner)
    });
    try {
        let transferOs = await contractWithSigner.transferOwnership("0x" + wallets[1]);
        console.log("TransferHash: ", transferOs.hash);
        await transferOs.wait();
        let newOwner = await contract.owner();

    } catch (err) {
        logger.error("Error while transfering Ownership")
    }
};

// Called when anyone changes the value
// function transferEvent() {
//     try {
contract.on("OwnershipTransferred", (previousOwner, newOwner) => {

    console.log("newOwner: ", newOwner);

    contract.artHash().then((artHash) => {
        console.log("of Picture with artHash: ", artHash)
    });
    // return newOwner;
});
//     } catch (err) {
//         logger.error("Error while getting Event from SmartContract")
//     }
// }


// transferEvent().then(newOwner => {
//     console.log(newOwner)
// })
//     .catch(err => console.error(err))



