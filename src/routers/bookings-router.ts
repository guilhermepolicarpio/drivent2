import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { getBookingUser,postBooking, updateBooking } from "@/controllers/booking-controler"; 

const bookingsRouter = Router();

bookingsRouter
  .all("/*", authenticateToken)
  .get("/", getBookingUser)
  .post("/", postBooking)
  .put("/:bookingId", updateBooking)

export { bookingsRouter };
