import { Router } from "express";
import { getOrderbook } from "../controllers/orderbookController";

const router = Router();

router.get("/", getOrderbook);

export default router;
