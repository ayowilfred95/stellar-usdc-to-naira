import express, { Request, Response } from 'express';
import { Keypair, Operation, Networks,TransactionBuilder } from 'stellar-sdk';
import StellarSdk from 'stellar-sdk';
import dotenv from "dotenv"
import fetch from 'node-fetch';
import  stellarServer  from '../config/StellarSdk';
import { PrismaClient } from '@prisma/client';



dotenv.config();

const prisma = new PrismaClient();

interface Balance {
  asset_type: string;
  balance: string;
}


export const ulegoUser=async(req: Request, res: Response)=>{
  try{

      const username: string = req.body.username

    // Tell the Stellar SDK you are using the testnet
       StellarSdk.Networks.TESTNET

    const sourceAccountSecretKey = await  prisma.sourceAccount.findFirst({
      where:{
            username:'Nupat',
      }
    });

    if (!sourceAccountSecretKey) {
      throw new Error('Source account not found');
    }


      // Never put values like the an account seed in code.
    const provisionerKeyPair = Keypair.fromSecret(sourceAccountSecretKey.stellarSecret);

    // // Create an Account object from an address and sequence number
    // const provisioner = await Keypair.fromPublicKey(provisionerKeyPair.publicKey());
 // Load account from Stellar
 const provisioner = await stellarServer.loadAccount(provisionerKeyPair.publicKey())

   // Generate a new key pair for the destination account
   const userKeyPair = StellarSdk.Keypair.random(); 

   console.log(`Creating user account in ledger, publickey:${userKeyPair.publicKey()}, secretKey:${userKeyPair.secret()}`);


    const transaction = new TransactionBuilder(provisioner,{
      /**
       * @dev This is 100 stroops
       *  @network This line specifies that the transaction is intended for the Stellar testnet. 
       * If you were targeting the public Stellar network, 
       * you would replace Networks.TESTNET with Networks.PUBLIC
       */
      fee: '100', // Replace with an appropriate fee value in stroops. The fee is specified in stroops, which is the smallest unit of XLM (1 XLM = 10^7 stroops).
      networkPassphrase: Networks.TESTNET, // Change to Networks.PUBLIC for pubnet
    })
    .addOperation(
      // Operation to create new accounts
      Operation.createAccount({
        destination:  userKeyPair.publicKey(),
        startingBalance: '100'
      })
    )
    .setTimeout(0) // Set timeout to 0 to indicate that the transaction is not time-sensitive
    .build();


      // Sign the transaction
      transaction.sign(provisionerKeyPair);

      // Submit transaction to the server
      const result = await stellarServer.submitTransaction(transaction);
  
      console.log('Account created:', result);

       // get the public key 
   const publicKey = userKeyPair.publicKey()
   const url = `https://horizon-testnet.stellar.org/accounts/${publicKey}`;

   console.log(`
   Loading account from the test network:
   ${url}
 `);


 const response = await fetch(url);
    const accountData = await response.json();
    console.log("Id for account: " + publicKey);
    console.log("Balances for account: " + publicKey);

    const account_id = accountData.id;

    console.log('source account id', account_id)

    let accountBalance: string | undefined;
    let asset_type: string | undefined;

    accountData.balances.forEach(function (balance: Balance) {
      console.log("Type:", balance.asset_type, ", Balance:", balance.balance);
       // Access the balance for further use
       accountBalance = balance.balance;
       asset_type = balance.asset_type

    });
    if(!accountBalance || !asset_type){
      throw new Error('error generating account balance and asset type');
    }

    const userAccount = await prisma.user.create({
      data: {
        id:account_id,
        username:username,
        userStellarAccount: userKeyPair.publicKey(),
        userStellarSecret: userKeyPair.secret(),
        balance:accountBalance,
        asset_type:asset_type
      },
    });

      console.log('Details of the newly account generated',userAccount)

      res.status(200).json({ success: true, newAccountCreated:userKeyPair.publicKey(), result });

  }catch(error: any){
    if (error.response) {
      const { result_codes } = error.response.data.extras;
      console.error('Stellar account not created. Transaction failed:', result_codes);
    } else {
      console.error('Stellar account not created.', error);
    }
    res.status(500).json({ success: false, error: 'Stellar account not created.' });
  }
}








// create distributor account


export const distributorAccount=async(req: Request, res: Response)=>{
  try{

      const username: string = req.body.username

    // Tell the Stellar SDK you are using the testnet
       StellarSdk.Networks.TESTNET

    const sourceAccountSecretKey = await  prisma.sourceAccount.findFirst({
      where:{
            username:'Nupat',
      }
    });

    if (!sourceAccountSecretKey) {
      throw new Error('Source account not found');
    }


      // Never put values like the an account seed in code.
    const provisionerKeyPair = Keypair.fromSecret(sourceAccountSecretKey.stellarSecret);

    // // Create an Account object from an address and sequence number
    // const provisioner = await Keypair.fromPublicKey(provisionerKeyPair.publicKey());
 // Load account from Stellar
 const provisioner = await stellarServer.loadAccount(provisionerKeyPair.publicKey())

   // Generate a new key pair for the destination account
   const distributorKeyPair = StellarSdk.Keypair.random(); 

   console.log(`Creating user account in ledger, publickey:${distributorKeyPair.publicKey()}, secretKey:${distributorKeyPair.secret()}`);


    const transaction = new TransactionBuilder(provisioner,{
      /**
       * @dev This is 100 stroops
       *  @network This line specifies that the transaction is intended for the Stellar testnet. 
       * If you were targeting the public Stellar network, 
       * you would replace Networks.TESTNET with Networks.PUBLIC
       */
      fee: '100', // Replace with an appropriate fee value in stroops. The fee is specified in stroops, which is the smallest unit of XLM (1 XLM = 10^7 stroops).
      networkPassphrase: Networks.TESTNET, // Change to Networks.PUBLIC for pubnet
    })
    .addOperation(
      // Operation to create new accounts
      Operation.createAccount({
        destination:  distributorKeyPair.publicKey(),
        startingBalance: '100'
      })
    )
    .setTimeout(0) // Set timeout to 0 to indicate that the transaction is not time-sensitive
    .build();


      // Sign the transaction
      transaction.sign(provisionerKeyPair);

      // Submit transaction to the server
      const result = await stellarServer.submitTransaction(transaction);
  
      console.log('Account created:', result);

       // get the public key 
   const publicKey = distributorKeyPair.publicKey()
   const url = `https://horizon-testnet.stellar.org/accounts/${publicKey}`;

   console.log(`
   Loading account from the test network:
   ${url}
 `);


 const response = await fetch(url);
    const accountData = await response.json();
    console.log("Id for account: " + publicKey);
    console.log("Balances for account: " + publicKey);

    const account_id = accountData.id;

    console.log('source account id', account_id)

    let accountBalance: string | undefined;
    let asset_type: string | undefined;

    accountData.balances.forEach(function (balance: Balance) {
      console.log("Type:", balance.asset_type, ", Balance:", balance.balance);
       // Access the balance for further use
       accountBalance = balance.balance;
       asset_type = balance.asset_type

    });
    if(!accountBalance || !asset_type){
      throw new Error('error generating account balance and asset type');
    }

    const userAccount = await prisma.distributor.create({
      data: {
        id:account_id,
        username:username,
        distributorStellarAccount: distributorKeyPair.publicKey(),
        distributorStellarSecret: distributorKeyPair.secret(),
        balance:accountBalance,
        asset_type:asset_type
      },
    });

      console.log('Details of the newly account generated',userAccount)

      res.status(200).json({ success: true, newAccountCreated:distributorKeyPair.publicKey(), result });

  }catch(error: any){
    if (error.response) {
      const { result_codes } = error.response.data.extras;
      console.error('Stellar account not created. Transaction failed:', result_codes);
    } else {
      console.error('Stellar account not created.', error);
    }
    res.status(500).json({ success: false, error: 'Stellar account not created.' });
  }
}

