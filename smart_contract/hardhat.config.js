//

require('@nomiclabs/hardhat-waffle')

module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten: {
      url: 'https://eth-ropsten.alchemyapi.io/v2/RB_-LFH5G-7DyyM1DweOPft5qOWwMyBT',
      accounts: [
        'f77eac8be47d13481a1962319faac1694686ddec9a614ebb62efd48b45dc7665'
      ]
    }
  }
}
