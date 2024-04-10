import express from "express";
import{createAccount} from "../methods/createAccount"

const router = express.Router();

router.route('/account').post(createAccount);
// router.route('/getAccount/:publicKey').get(getAccount);

export default router;
