import { Router } from "express";
import { getTrades } from "../controllers/tradesController";

const router = Router();

router.get("/", getTrades);

export default router;
