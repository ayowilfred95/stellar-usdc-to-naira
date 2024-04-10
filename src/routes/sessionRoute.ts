import express from "express";
import{anchor,fetchStellarToml,getAnchorInfo} from "../anchor/anchor"

const router = express.Router();

router.route('/session').get(anchor);
router.route('/toml/:domain').get(fetchStellarToml)
router.route('/anchorinfo').get(getAnchorInfo);

export default router;
