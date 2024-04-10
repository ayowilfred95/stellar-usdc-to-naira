import express from "express";
import{setupIssuer,createTrustline,allowTrust} from "../methods/customAssets"

const router = express.Router();

router.route('/issuer').get(setupIssuer);
router.route('/trustline').get(createTrustline)
router.route('/allow-trust').get(allowTrust)

export default router;
