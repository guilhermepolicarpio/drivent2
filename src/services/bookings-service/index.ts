import bookingRepository from "@/repositories/booking-repository";
import { notFoundError } from "@/errors";


async function getBooking(userId: number){

    const userBooking = await bookingRepository.findBookingByUserId(userId);

    if(!userBooking){
        throw notFoundError()
    }

    return userBooking;
}

const bookingService = {
    getBooking
  };
  
  export default bookingService;