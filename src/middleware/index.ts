import { Request, Response, NextFunction } from 'express';
import express from "express";
import jwt from "jsonwebtoken"


// env
const sep10jwtSecret=process.env.SECRET_PLATFORM_API_AUTH_SECRET
const secret: string = "mysecret12345"

export const middleware = async (req: Request, res: Response, next: NextFunction) => {
 
  secret = secret ? secret : sep10jwtSecret;
  if(!token){
    throw "missing 'platformToken'";
  }
  let decodedToken;
  try{
    decodedToken = await jwt.verify(token, secret);
  }catch(e){
    console.log("token",token)
    console.log("secret", secret)
    console.log(e);
    throw "Invalid 'platformToken"
  }
  if(decodedToken.jti){
    throw "invalid 'platform': missing 'jti'"; 
  }
  return decodedToken;

};
