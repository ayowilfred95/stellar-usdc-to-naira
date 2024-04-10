import express, { Request, Response } from 'express';
import  StellarSdk,{ Keypair, Operation, Networks, Server, TransactionBuilder } from 'stellar-sdk';

import CryptoJS from 'crypto-js'; 
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';
import stellarServer from '../config/StellarSdk';



const prisma = new PrismaClient();


export const payment = async(req: Request, res: Response)=>{
    try{


        const { amount, senderUsername, recipientUsername } = req.body;

        const findSender = await prisma.sourceAccount.findMany({
            where:{
                username:{
                    in: [senderUsername]
                }
            }

        })


        const findRecipient = await prisma.user.findMany({
            where:{
                username:{
                    in: [recipientUsername]
                }
            }

        })


        const sender = findSender.find((u) => u.username === senderUsername);
        const recipient = findRecipient .find((u) => u.username === recipientUsername);



          // Check if sender is found
    if (!sender) {
        return res.status(404).json({ success: false, error: 'Sender not found' });
      }
        // Tell the Stellar SDK you are using the testnet
       StellarSdk.Networks.TESTNET

      


     const sourceKeyPair = Keypair.fromSecret(sender.stellarSecret);
     const sourceAccount = await stellarServer.loadAccount(sourceKeyPair.publicKey());

     const recipientAccount = recipient?.userStellarAccount
     // Check if recipientAccount is defined
    if (recipientAccount === undefined) {
    return res.status(404).json({ success: false, error: 'Recipient account not found' });
    }

     const transaction = new TransactionBuilder(sourceAccount,{
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
       Operation.payment({
         destination: recipientAccount, 
         asset: StellarSdk.Asset.native(),
         amount: amount.toString(),
       })
     )
     .setTimeout(0) // Set timeout to 0 to indicate that the transaction is not time-sensitive
    .build();

   transaction.sign(sourceKeyPair);

   const result = await stellarServer.submitTransaction(transaction);
   res.status(200).json(result)

    }catch(error){

        console.error('Error processing Stellar payment:', error);
        res.status(500).json({ success: false, error: 'Error processing Stellar payment' });
    }
}




// let fund the distributor account with the USD Asset we created

export const fundDistributor =async(req:Request, res:Response)=>{
    try{
        const { amount, senderUsername, recipientUsername } = req.body;

        const findSender = await prisma.sourceAccount.findMany({
            where:{
                username:{
                    in: [senderUsername]
                }
            }

        });


        const findRecipient = await prisma.distributor.findMany({
            where:{
                username:{
                    in: [recipientUsername]
                }
            }

        });

        const sender = findSender.find((u) => u.username === senderUsername);
        const recipient = findRecipient .find((u) => u.username === recipientUsername);



          // Check if sender is found
    if (!sender) {
        return res.status(404).json({ success: false, error: 'Sender not found' });
      }
        // Tell the Stellar SDK you are using the testnet
       StellarSdk.Networks.TESTNET


       const issuerKeyPair = Keypair.fromSecret(sender.stellarSecret);
       const issuerAccount = await stellarServer.loadAccount(issuerKeyPair.publicKey());


       const recipientAccount = recipient?.distributorStellarAccount

        // Check if recipientAccount is defined
    if (recipientAccount === undefined) {
        return res.status(404).json({ success: false, error: 'Recipient account not found' });
        }

         // issuer id has to be used
    const NGNC = new StellarSdk.Asset("NGNC",issuerKeyPair.publicKey())

        const transaction = new TransactionBuilder(issuerAccount,{
            fee: '100', 
            networkPassphrase: Networks.TESTNET, 
        })
        .addOperation(
            Operation.payment({
              destination: recipientAccount, 
              asset: NGNC,
              amount: amount.toString(),
            })
          )
          .setTimeout(0) // Set timeout to 0 to indicate that the transaction is not time-sensitive
        .build();

          transaction.sign(issuerKeyPair);

          const result = await stellarServer.submitTransaction(transaction);
          res.status(200).json(result)
    }catch(error){


        console.error('Error processing Stellar payment:', error);
        res.status(500).json({ success: false, error: 'Error processing Stellar payment' });
    }
}






