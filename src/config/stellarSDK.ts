import StellarSdk from 'stellar-sdk';

const stellarServer = new StellarSdk.Server("https://horizon-testnet.stellar.org");

export default stellarServer;

