require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
// task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
//     const accounts = await hre.ethers.getSigners();
//
//     for (const account of accounts) {
//         console.log(account.address);
//     }
// });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    networks: {
        hardhat: {
            chainId: 1337
        },
        mumbai: {
            url: "https://matic-mumbai.chainstacklabs.com",
            accounts: [process.env.privateKey]
        },
        matic: {
            url: "https://polygon-rpc.com",
            accounts: [process.env.privateKey],
            gasPrice: "auto",
            blockGasLimit: 12450000
        },
        mainnet: {
            url: "https://eth-mainnet.g.alchemy.com/v2/szmfNjVkkc3VWdLfM7Dv4a4OSd7rVlar",
            accounts: [process.env.privateKey]
        },
        goerli: {
            url: "https://eth-goerli.alchemyapi.io/v2/szmfNjVkkc3VWdLfM7Dv4a4OSd7rVlar",
            accounts: [process.env.privateKey]
        }
    },
    etherscan: {
        url: "https://api.etherscan.io",
        apiKey: {
            mainnet: "K2VAWA4T3UC1CNY8AUK1NSYA4MA4AVHIK1",
            goerli: "K2VAWA4T3UC1CNY8AUK1NSYA4MA4AVHIK1"
        }
    },
    solidity: {
        compilers: [
            {
                version: "0.4.17"
            },
            {
                version: "0.8.0"
            }
        ]
    }
};
