import express, { Request, Response } from 'express';
import StellarSdk, { Keypair,TransactionBuilder, Networks,Server } from 'stellar-sdk';
import CryptoJS from 'crypto-js'; 
import axios from 'axios';
import { walletSdk } from '@stellar/typescript-wallet-sdk';
import txBuilder from '@stellar/typescript-wallet-sdk';



import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
  throw new Error('SECRET_KEY is not provided in the environment variables');
}


interface Balance {
  asset_type: string;
  balance: string;
}

export const createAccount=async(req: Request, res: Response)=>{

        const  username: string = req.body.username;
    
        if (!username) {
          throw new Error('Please provide a usernane');
        }
    
        const keypair = StellarSdk.Keypair.random();
    
        await axios(`https://friendbot.stellar.org?addr=${keypair.publicKey()}`);
    
         // Encrypting with CryptoJS instead of sjcl
    const encryptedSecret = CryptoJS.AES.encrypt(keypair.secret(), username).toString();


    const publicKey = keypair.publicKey()

    const url = `https://horizon-testnet.stellar.org/accounts/${publicKey}`;

    console.log(`
    Loading account from the test network:
    ${url}
  `);


  try{
    
      // Tell the Stellar SDK you are using the testnet
      StellarSdk.Networks.TESTNET

    const response = await fetch(url);
    const accountData = await response.json();
    console.log("Id for account: " + publicKey);
    console.log("Balances for account: " + publicKey);



    const account_id = accountData.id;

    console.log('source account id', account_id)

    let accountBalance: string | undefined;

    accountData.balances.forEach(function (balance: Balance) {
      console.log("Type:", balance.asset_type, ", Balance:", balance.balance);
       // Access the balance for further use
       accountBalance = balance.balance;
    });
    if(!accountBalance){
      throw new Error('Please provide a usernane');
    }

    const sourceAccount = await prisma.sourceAccount.create({
      data: {
        id:account_id,
        username:username,
        stellarAccount: keypair.publicKey(),
        stellarSecret: keypair.secret(),
        keystore: encryptedSecret,
        balance:accountBalance

      },
    });

        // Responding with the created account
        res.status(201).json({"Database data":sourceAccount});
      } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
      }

}

