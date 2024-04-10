import express from "express";
import{ulegoUser,distributorAccount} from "../methods/createNonExistAccount"

const router = express.Router();

router.route('/ulegouser').post(ulegoUser);
router.route('/distributor').post(distributorAccount)

export default router;
