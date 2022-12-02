import { AuthenticatedRequest } from "@/middlewares";
import bookingService from "@/services/bookings-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getBookingUser(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
  
    try {
      const hotels = await bookingService.getBooking(Number(userId));
      return res.status(httpStatus.OK).send(hotels);
    } catch (error) {
      if (error.name === "NotFoundError") {
        return res.sendStatus(httpStatus.NOT_FOUND);
      }
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
  }