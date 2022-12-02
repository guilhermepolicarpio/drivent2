import bookingRepository, {NewBooking} from "@/repositories/booking-repository";
import { notFoundError,forbiddenError } from "@/errors";
import { exclude } from "@/utils/prisma-utils";
import ticketRepository from "@/repositories/ticket-repository";

async function getBooking(userId: number){

    const userBooking = await bookingRepository.findBookingByUserId(userId);

    if(!userBooking){
        throw notFoundError()
    }

    return{
        ...exclude(userBooking,"createdAt", "updatedAt", "userId", "roomId"),
        Room:{... exclude(userBooking.Room, "createdAt", "updatedAt")}
    };
}

async function postBooking(userId: number, roomId: number){
    const ticket = await ticketRepository.findTicketByUserId(userId)

    if(ticket){
        throw forbiddenError()
    }

    const newBookingData: NewBooking ={
        userId,
        roomId
    }
    const newBooking = await bookingRepository.postNewBooking(newBookingData)

    return newBooking
}

const bookingService = {
    getBooking,
    postBooking
  };
  
  export default bookingService;