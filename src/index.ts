import express, { Request, Response } from 'express';
import {Express} from "express"
import bodyParser from 'body-parser';
import dotenv from "dotenv"
import router from "./routes/index" 
import axios from 'axios';
import { Keypair, Operation, Networks, Server, TransactionBuilder,Transaction } from 'stellar-sdk';
import jwt, { JwtPayload } from "jsonwebtoken";

// import {middleware} from "./middleware"

require('dotenv').config({ path:'dev.env' });
const SERVER_SIGNING_KEY = String(process.env.SECRET_SEP10_SIGNING_SEED);

dotenv.config();
const app:Express = express();
const port = process.env.BUSINESS_SERVER_PORT;
const platform = String(process.env.PLATFORM_API_BASE_URL);
const sep10JwtSecret = String(process.env.SECRET_SEP10_JWT_SECRET);
const sep24InteractUrl = String(process.env.SEP24_MORE_INFO_URL_BASE_URL);
const platformSignSecret = String(process.env.SECRET_PLATFORM_API_AUTH_SECRET);
const sep24InfoJwtSecret = String(process.env.SECRET_SEP24_INTERACTIVE_URL_JWT_SECRET);
const sep24InteractJwtSecret = String(process.env.SECRET_SEP24_INTERACTIVE_URL_JWT_SECRET);


const bootstrapServer = async() =>{

    app.use(express.json())
    app.use(bodyParser.json());
    app.use(express.urlencoded({extended: true}))

    // app.use("./static/well_known",middleware)

    /*
 * Create an authenticated session for the user.
 *
 * Return a session token to be used in future requests as well as the
 * user data. Note that you may not have a user for the stellar account
 * provided, in which case the user should go through your onboarding
 * process.
 */
    const sessions: { [key: string]: any } = {};


    app.post("/session", async (req: Request, res: Response) => {
        let decodedPlatformToken: any; 

        try {
            const decodedPlatformToken = validatePlatformToken(req.body.platformToken);
        } catch (err) {
            return res.status(400).send({ "error": err });
        }

        if (!decodedPlatformToken) {
            return res.status(400).send({ "error": "Platform token is invalid" });
        }

        let user: any; 

        try {
            user = getUser(decodedPlatformToken.sub);
        } catch (err) {
            return res.status(404).send({ "error": "User not found" });
        }
    
        let sessionToken = jwt.sign(
            { "jti": decodedPlatformToken.jti },
            sep10JwtSecret
        );
    
        sessions[sessionToken] = user;
    
        res.status(200).send({
            "token": sessionToken,
            "user": user
        });
      });



      /*
 * Validate the signature and contents of the platform's token
 */
function validatePlatformToken(token: string): any {
    if (!token) {
      throw "missing 'platformToken'";
    }
    let decodedToken: any;
    try {
        decodedToken = jwt.verify(token, sep10JwtSecret);
    } catch(e) {
      throw "invalid 'platformToken'";
    }
    if (!decodedToken.jti) {
      throw "invalid 'platformToken': missing 'jti'";
    }
    return decodedToken;
  }
  
  /*
   * Query your own database for the user based on account:memo string parameter
   */
  function getUser(sub: string): any {
    // Assuming you use 'sub' parameter to retrieve user data from somewhere
    // Replace this with your actual logic
    return null;
}
  






    


    

    // Sign requests from the demo wallet client for sep-10 client attribution
    app.post("/sign", (req: Request, res: Response) => {
        console.log("request to /sign");
      
        // Check if 'transaction' property exists in the request body
        if (!req.body || !req.body.transaction) {
          res.status(400).send("Missing or invalid 'transaction' property in the request body");
          return;
        }
      
        const envelope_xdr = req.body.transaction;
        const network_passphrase = Networks.TESTNET;
        const transaction = new Transaction(envelope_xdr, network_passphrase);
      
        // if (Number.parseInt(transaction.sequence, 10) !== 0) {
        //   res.status(400).send("Transaction sequence value must be '0'");
        //   return;
        // }
      
        transaction.sign(Keypair.fromSecret(SERVER_SIGNING_KEY));
      
        res.set("Access-Control-Allow-Origin", "*");
        res.status(200).send({
          "transaction": transaction.toEnvelope().toXDR("base64"),
          "network_passphrase": network_passphrase,
        });
      });
      


    /*
 * We'll store user session data in memory, but production systems
 * should store this data somewhere more persistent.
 */
    // const sessions = {};

    // Import and use the router for your routes
    app.use(router);

    app.get("/",(req,res)=>{
        res.send("Hello graphql");
    })


    app.listen(port,()=>{
        console.log(`Business server listening on http://localhost:${port} & Database connected successsfully`)
    })
}

bootstrapServer()

