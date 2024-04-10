import express, { Request, Response } from 'express';
import StellarSdk,{
    Asset,
    AuthRequiredFlag,
    AuthRevocableFlag,
    Server,
    Keypair,
    Networks,
    Operation,
    TransactionBuilder,
    AuthFlag,
  } from 'stellar-sdk';

  import stellarServer from '../config/StellarSdk'

  import { PrismaClient } from '@prisma/client';
  const prisma = new PrismaClient();

  interface Balance {
    asset_type: string;
    balance: string;
  }

  

  const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
  throw new Error('SECRET_KEY is not provided in the environment variables');
}

  /**
   * @dev StellarSdk can be called or used the methods 
   * without calling StellarSdk
   */

// Create issuing account

  export const setupIssuer=async(req: Request, res: Response)=>{
    try{
        // Tell the Stellar SDK you are using the testnet
        StellarSdk.Networks.TESTNET


        const issuerAccount = await prisma.sourceAccount.findFirst({
            where:{
                username:'Nupat',
            }
        });
        if (!issuerAccount|| !issuerAccount.balance) {
            return res.status(500).json({ success: false, error: 'Issuer account not found or missing secret key' });
        }
         

          console.log('issuerAccount',issuerAccount.stellarSecret)

          const issuerKeyPair = Keypair.fromSecret(issuerAccount.stellarSecret);
    
            const issuingAccount = await stellarServer.loadAccount(issuerKeyPair.publicKey());
          console.log("issuingAccount",issuingAccount)
    
           const transaction = new StellarSdk.TransactionBuilder(issuingAccount, {
      fee: '100', // Replace with an appropriate fee value in stroops
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        StellarSdk.Operation.setOptions({
          setFlags: StellarSdk.AuthRevocableFlag | StellarSdk.AuthRequiredFlag,
        })
      )
      .setTimeout(0) // Set timeout to 0 to indicate that the transaction is not time-sensitive
      .build();

          transaction.sign(issuerKeyPair);
      const result =  await stellarServer.submitTransaction(transaction);
        res.status(200).json({ success: true, message: 'Issuer setup successful' , data:result});

    }catch(error){
        console.error('Error setting up issuer:', error);
        res.status(500).json({ success: false, error: 'Error setting up issuer' });

    }

  }



// Allow trustline

export const allowTrust=async(req:Request, res:Response)=>{
  try{
     // Tell the Stellar SDK you are using the testnet
   StellarSdk.Networks.TESTNET
   // Point to testnet host
   const stellarServer = new StellarSdk.Server('https://horizon-testnet.stellar.org');

   const issuerAccount = await prisma.sourceAccount.findFirst({
    where:{
        balance:{
            gt:'0'
        }
    }
});
if (!issuerAccount|| !issuerAccount.balance) {
    return res.status(500).json({ success: false, error: 'Issuer account not found or missing secret key' });
}

console.log('issuerAccount',issuerAccount.stellarSecret)

const issuerKeyPair = Keypair.fromSecret(issuerAccount.stellarSecret);
  const issuingAccount = await stellarServer.loadAccount(issuerKeyPair.publicKey());


  const NGNC = {
    code: 'NGNC', // Replace with the actual asset code
  };
  


  // const trustor = 

  const transaction = new StellarSdk.TransactionBuilder(issuingAccount, {
   /**
                 * @dev This is 100 stroops
                 *  @network This line specifies that the transaction is intended for the Stellar testnet. 
                 * If you were targeting the public Stellar network, 
                 * you would replace Networks.TESTNET with Networks.PUBLIC
                 */
   fee: '100', // Replace with an appropriate fee value in stroops. The fee is specified in stroops, which is the smallest unit of XLM (1 XLM = 10^7 stroops).
   networkPassphrase: Networks.TESTNET, // Change to Networks.PUBLIC for pubnet
 })
 .addOperation(Operation.allowTrust({
  trustor:'fggh',
   assetCode:NGNC.code
 }))
 .setTimeout(0) // Set timeout to 0 to indicate that the transaction is not time-sensitive
 .build();


        transaction.sign(issuerKeyPair);
    const result =  await stellarServer.submitTransaction(transaction);
    console.log('trust allowed',result)
      res.status(200).json({ success: true, message: 'Issuer setup successful' , data:result});




  }catch(error){

    console.error('allow trust failed.', error);
    res.status(500).json({ success: false, error: 'Error creating trust' });

  }
}







// create trustline to allow distributor account to trust the issuer account and be able to hold the aset from the issuer

export const createTrustline=async(req: Request, res: Response)=>{
  try{

    StellarSdk.Networks.TESTNET

    const issuerAccount = await  prisma.sourceAccount.findFirst({
      where:{
            username:'Nupat',
      }
    });

    if (!issuerAccount) {
      throw new Error('Source account not found');
    }

      // Never put values like the an account seed in code.
    const provisionerKeyPair = Keypair.fromSecret(issuerAccount.stellarSecret);
    const provisioner = await stellarServer.loadAccount(provisionerKeyPair.publicKey())
    
    const distributorAccount = await prisma.distributor.findFirst({
      where:{
        username:'Habeedat',
      }
    })

    if (!distributorAccount) {
      throw new Error('Distributor account not found');
    }

    const distributorKeypair = Keypair.fromSecret(distributorAccount.distributorStellarSecret)

    const distributor = await stellarServer.loadAccount(distributorKeypair.publicKey())

    console.log("public key:",distributorKeypair.publicKey())

    // issuer id has to be used
    const NGNC = new StellarSdk.Asset("NGNC",provisionerKeyPair.publicKey())

    const transaction = new TransactionBuilder(distributor,{
                      /**
                       * @dev This is 100 stroops
                       *  @network This line specifies that the transaction is intended for the Stellar testnet. 
                       * If you were targeting the public Stellar network, 
                       * you would replace Networks.TESTNET with Networks.PUBLIC
                       */
                      fee: '100', // Replace with an appropriate fee value in stroops. The fee is specified in stroops, which is the smallest unit of XLM (1 XLM = 10^7 stroops).
                      networkPassphrase: Networks.TESTNET, // Change to Networks.PUBLIC for pubnet
                    })
                    .addOperation(Operation.changeTrust({
                      asset:NGNC,
                      limit:'1000000',
                      source:distributorKeypair.publicKey(),
                    }))
                   
                    .setTimeout(0) // Set timeout to 0 to indicate that the transaction is not time-sensitive
                    .build();
      
      
       // Sign the transaction
       transaction.sign(distributorKeypair);
      
        // Submit the transaction to the Stellar network
        const result = await stellarServer.submitTransaction(transaction);
        res.status(200).json({message:"success",data:result});

    
  }catch(error){

    console.error('Create trustline failed.', error);
    res.status(500).json({ success: false, error: 'Error creating trustline' });
  }
}
