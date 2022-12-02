import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { getBookingUser } from "@/controllers/booking-controler"; 

const bookingsRouter = Router();

bookingsRouter
  .all("/*", authenticateToken)
  .get("/", getBookingUser)

export { bookingsRouter };
