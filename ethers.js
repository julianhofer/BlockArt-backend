const wallets = require('./wallets');
const privateKeys = require('./keys');
const ethers = require('ethers');
const smartContract = require('./contracts/ArtWorkContract')
const conn = require('./index')
// const { conn } = require('./DBConnection.js');


// var contractAddress = '0x36ed56f5e2160d46c3cbeee285298cbe2f0b0022';
// const provider = new ethers.providers.JsonRpcProvider('https://ropsten.infura.io/v3/6a9086d09c8a4e0e99c279571ee00bad');
// const abi = smartContract.abi;
// const contract = new ethers.Contract(contractAddress, abi, provider);

// let wallet = new ethers.Wallet("0x" + privateKeys[2], provider);
// let contractWithSigner = contract.connect(wallet);


//connect to database
// conn.connect((err) => {
//     if (err) throw err;
//     console.log('Mysql Connected...');
// });



function getContract(artHash) {
    return new Promise(function (resolve, reject) {

        artHash = "irgendeinArthash";
        let artSql = "SELECT contract_adress FROM ownership WHERE artHash=" + "'" + artHash + "'";

        let artQuery = conn.query(artSql, (err, contract) => {
            if (err)
                reject(err);

            var contractAdress = Object.values(JSON.parse(JSON.stringify(contract[0])))
            resolve(contractAdress);
        });
    })
}

function getPrivateKey(userToken) {
    return new Promise(function (resolve, reject) {

        userToken = "00ue01838JDheu21s";
        let privSql = "SELECT privKey FROM users WHERE user_token=" + "'" + userToken + "'";

        let privQuery = conn.query(privSql, (err, privKey) => {
            if (err)
                reject(err);

            var privateKey = Object.values(JSON.parse(JSON.stringify(privKey[0])))
            resolve(privateKey);
        });
    })
}

function getPublicKey(userName) {
    return new Promise(function (resolve, reject) {

        userName = "Kohli";
        let pubSql = "SELECT pubKey FROM users WHERE username=" + "'" + userName + "'";

        let pubQuery = conn.query(pubSql, (err, pubKey) => {
            if (err)
                reject(err);

            var publicKey = Object.values(JSON.parse(JSON.stringify(pubKey[0])))
            resolve(publicKey);
        });
    })
}

// module.exports = {
//     getContract: getContract(),
//     getPrivateKey: getPrivateKey(),
//     getPublicKey: getPublicKey()
// }



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


// getPrivateKey().then(function (result) {
//     privateKey = result;
//     console.log("privateKey: ", privateKey)
// })

// getPublicKey().then(function (result) {
//     publicKey = result;
//     console.log("publicKey: ", publicKey)
// })
