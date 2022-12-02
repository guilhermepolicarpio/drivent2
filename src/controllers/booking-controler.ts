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

  export async function postBooking(req: AuthenticatedRequest, res: Response){
    const {userId} = req;
    const {roomId} = req.body;

    try{
      const booking = await bookingService.postBooking(userId,roomId);
      return res.status(httpStatus.OK).send(booking.id);

    }catch (error) {
      if (error.name === "NotFoundError") {
        return res.sendStatus(httpStatus.NOT_FOUND);
      }

      if (error.name === "ForbiddenError") {
        return res.sendStatus(httpStatus.FORBIDDEN);
      }
      return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }

  }