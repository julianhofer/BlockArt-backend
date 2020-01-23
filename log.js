const contract = require('./ethers');

contract.artHash().then((artHash) => {
    console.log("artHash: ", artHash)
});

contract.logs([]).then((log) => {
    console.log("log: ", log)
});