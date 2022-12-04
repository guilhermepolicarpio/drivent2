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
      return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  export async function postBooking(req: AuthenticatedRequest, res: Response){
    const {userId} = req;
    const roomId = Number(req.body.roomId);

    try{
      const booking = await bookingService.postBooking(userId,roomId);
      return res.status(httpStatus.OK).send({booking});

    }catch (error) {
      
      if (error.name === "ForbiddenError") {
        return res.sendStatus(httpStatus.FORBIDDEN);
      }
      return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  export async function updateBooking(req: AuthenticatedRequest, res: Response){
    const {userId} = req;
    const roomId = Number(req.body.roomId);
    const bookingId = Number(req.params.bookingId);

    try{
      const booking = await bookingService.updateBooking(userId,roomId,bookingId);
      return res.status(httpStatus.OK).send({bookingId: booking.id});

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