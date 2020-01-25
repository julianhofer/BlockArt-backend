const wallets = require('./wallets');
const privateKeys = require('./keys');
const ethers = require('ethers');
const smartContract = require('./contracts/ArtWorkContract')
const { conn } = require('./DBConnection.js');




var contractAddress = '0x36ed56f5e2160d46c3cbeee285298cbe2f0b0022';
const provider = new ethers.providers.JsonRpcProvider('https://ropsten.infura.io/v3/6a9086d09c8a4e0e99c279571ee00bad');
const abi = smartContract.abi;
const contract = new ethers.Contract(contractAddress, abi, provider);

let wallet = new ethers.Wallet("0x" + privateKeys[2], provider);
let contractWithSigner = contract.connect(wallet);
//connect to database
conn.connect((err) => {
    if (err) throw err;
    console.log('Mysql Connected...');
});



// var transferOwner = async function () {

//     contract.owner().then((owner) => {
//         console.log("oldOwner: ", owner)
//     });
//     try {
//         let transferOs = await contractWithSigner.transferOwnership("0x" + wallets[1]);
//         console.log("TransferHash: ", transferOs.hash);
//         await transferOs.wait();
//         let newOwner = await contract.owner();
//         return newOwner;
//     } catch (err) {
//         logger.error("Error while transfering Ownership")
//     }
// };

// module.exports = {
//     transferOwner: transferOwner(),
//     contract: contract
// }


// Called when anyone changes the value
// function transferEvent() {
//     try {


// contract.on("OwnershipTransferred", (previousOwner, newOwner) => {

//     console.log("newOwner: ", newOwner);

//     contract.artHash().then((artHash) => {
//         console.log("of Picture with artHash: ", artHash)
//     });
// });


//     } catch (err) {
//         logger.error("Error while getting Event from SmartContract")
//     }
// }

// transferEvent().then(newOwner => {
//     console.log(newOwner)
// })
var artHash = "irgendeinArthash";
var artHash2 = "dritterArthash";

// getContract()


getContract(artHash2).then(function (result) {
    contractAddress = result;
    console.log("contractAdress: ", contractAddress)
})

// getPrivateKey().then(function (result) {
//     privateKey = result;
//     console.log("privateKey: ", privateKey)
// })

// getPublicKey().then(function (result) {
//     publicKey = result;
//     console.log("publicKey: ", publicKey)
// })



function getContract(artHash) {
    return new Promise(function (resolve, reject) {


        let artSql = "SELECT contract_adress FROM ownership WHERE artHash=" + "'" + artHash + "'";

        let artQuery = conn.query(artSql, (err, contract) => {
            if (err)
                reject(err);

            var contractAdress = Object.values(JSON.parse(JSON.stringify(contract[0])))
            resolve(contractAdress);
        });
    })
}
