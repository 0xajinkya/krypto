require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.4",
  networks: {
    ropsten: {
      url: 'https://eth-ropsten.alchemyapi.io/v2/oc9CCErM21Syl7eAHAR0IGp_TiU0g1Ig',
      accounts: ['90f3a1501dee8368081d11bb850f7a85034c175ec60c264d17b31075835cb757'],
    },
  },
};
