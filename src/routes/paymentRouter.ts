import express from "express";
import{payment,fundDistributor} from "../methods/payments"

const router = express.Router();

router.route('/payment').post(payment);
router.route('/fund-distributor').post(fundDistributor)

export default router;
