import express, { Request, Response } from 'express';
import stellarServer from '../config/StellarSdk';
import { Keypair, Operation, Networks, Server, TransactionBuilder,Transaction,StellarTomlResolver } from 'stellar-sdk';
import axios from 'axios';
import {walletSdk,SigningKeypair} from "@stellar/typescript-wallet-sdk"
const jwt = require("jsonwebtoken");

// Define the structure of the response
interface AnchorServiceInfoResponse {
  deposit: Record<string, {
    enabled: boolean;
    fee_fixed?: number;
    fee_percent?: number;
    fee_minimum?: number;
    min_amount?: number;
    max_amount?: number;
  }>;
  withdraw: Record<string, {
    enabled: boolean;
    fee_fixed?: number;
    fee_percent?: number;
    fee_minimum?: number;
    min_amount?: number;
    max_amount?: number;
  }>;
  fee: {
    enabled: boolean;
  };
  features: {
    [feature: string]: boolean;
  };
}


export const getAnchorInfo=async(req:Request, res:Response): Promise<void>=>{
  try{
    const wallet = walletSdk.Wallet.TestNet();
    const stellar = wallet.stellar();
    const anchor = wallet.anchor({ homeDomain: "http://localhost/dev.stellar.toml" });
    console.log("fetching response successfully")

    // const sep24 = await anchor.sep24();
    // res.json(sep24)


      // Retrieve anchor service information
      const anchorServiceInfoResponse = await anchor.getServicesInfo() as AnchorServiceInfoResponse;
      // Return the anchor service information as JSON response
      res.json(anchorServiceInfoResponse);

    
  }catch(error){
    console.error("Error fetching anchor information:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}




export const fetchStellarToml=async(req:Request,res:Response)=>{
  const { domain } = req.params;
  try {
    const stellarToml = await StellarTomlResolver.resolve(domain);
    res.json({ stellarToml });
} catch (error:any) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
}

}



export const anchor = async(req:Request, res:Response)=>{
  try{
    const wallet = walletSdk.Wallet.TestNet();
    const stellar = wallet.stellar();
    let anchor = wallet.anchor({ homeDomain: "https://testanchor.stellar.org"  });
    const sep10 = await anchor.sep10();
    const authKey = SigningKeypair.fromSecret("SCBNJQXKOIAFHB4XD3NGLWTR6WTKUZJKVC2OHVNGRSVB2Y2OKLSHKMEQ");
    // const authKey = Keypair.fromSecret("SCBNJQXKOIAFHB4XD3NGLWTR6WTKUZJKVC2OHVNGRSVB2Y2OKLSHKMEQ");
    const authToken = await sep10.authenticate({ accountKp: authKey });
    res.status(200).json({"authToken":authToken});
    console.log("authentication token",authToken);

  }catch(error){
    console.log(error)
    res.send(error)
    throw error; 
  }

}



// /*
//  * Validate the signature and contents of the platform's token
//  */
// function validatePlatformToken(token: string): any {
//     if (!token) {
//       throw new Error("Missing 'platformToken'");
//     }
  
//     try {
//         const decodedToken = jwt.verify(token, process.env.SECRET_SEP10_JWT_SECRET as string) as any;

      
//       if (!decodedToken.jti) {
//         throw new Error("Invalid 'platformToken': missing 'jti'");
//       }
  
//       return decodedToken;
//     } catch (error) {
//       throw new Error("Invalid 'platformToken'");
//     }
//   }

//   /*
//  * Query your own database for the user based on account:memo string parameter
//  */
// function getUser(sub: string): any {
//     return null;
//   }

//   // Example: Fetch user based on account:memo

// export const session = async(req:Request, res:Response)=>{

//     try{
//        const decodedPlatformToken = validatePlatformToken(req.body.platformToken);
//        const user = getUser(decodedPlatformToken.sub);
//        res.status(200).json({decodedPlatformToken,user})
//     }catch(error: any){
//         return res.status(400).json({ error: error.message });
//     }
// }



// export async function fetchStellarToml(domain: string) {
//     try {
//       // Assuming the Stellar.toml file is located at the root of the domain
//       const response = await axios.get(`https://${domain}/.well-known/stellar.toml`);
      
//       if (response.status === 200) {
//         // Extract relevant information from the Stellar.toml file
//         const { TRANSFER_SERVER } = response.data;
//         return { TRANSFER_SERVER };
//       } else {
//         throw new Error(`Failed to fetch Stellar.toml. Status code: ${response.status}`);
//       }
//     } catch (error: any) {
//       throw new Error(`Error fetching Stellar.toml: ${error.message}`);
//     }
//   }




//   // Stellar Authentication

//   const aunthenticate =async()=>{
//     const anchor = stellarServer.anchor({ homeDomain: "https://testanchor.stellar.org" });
//     // i created a new account from the stellar lab to handle aunthentication
//     // public key -  GDS2TJAAQEFOGM3X63KHUGSHFO4DAQ6LWQU22PG3YYP3OX332ODNPII4
//     const authKey = Keypair.fromSecret("SAARM7VVD57WFQF2E6YZ4BME2D22MQ7FU5XHKL5I6RBMQPNHOJ3RLODC")
//     const sep10 = await anchor.sep10();
//     const authToken = await sep10.authenticate({ accountKp: authKey });
//     return authToken

//   }


//   export const signin = async (req: Request, res: Response) => {
//     try {
//       const envelope_xdr = req.body.transaction;
//       const network_passphrase = Networks.TESTNET;
      
//       // Check if envelope_xdr is provided
//       if (!envelope_xdr) {
//         res.status(400).send("Missing 'transaction' field in the request body");
//         return;
//       }
  
//       const transaction = new Transaction(envelope_xdr, network_passphrase);
//       const SERVER_SIGNING_KEY = 'SAARM7VVD57WFQF2E6YZ4BME2D22MQ7FU5XHKL5I6RBMQPNHOJ3RLODC';
  
//       if (Number.parseInt(transaction.sequence, 10) !== 0) {
//         res.status(400).send("Transaction sequence value must be '0'");
//         return;
//       }
  
//       transaction.sign(Keypair.fromSecret(SERVER_SIGNING_KEY));
      
//       res.set("Access-Control-Allow-Origin", "*");
//       res.status(200).send({
//         transaction: transaction.toEnvelope().toXDR("base64"),      
//         network_passphrase: network_passphrase,
//       });
//     } catch (error: any) {
//       console.error('Error in signin:', error);
//       res.status(500).send('Internal Server Error');
//     }
//   };

