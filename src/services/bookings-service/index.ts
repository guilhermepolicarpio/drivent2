import bookingRepository, {NewBooking} from "@/repositories/booking-repository";
import { notFoundError,forbiddenError } from "@/errors";
import { exclude } from "@/utils/prisma-utils";
import ticketRepository from "@/repositories/ticket-repository";
import roomsRepository from "@/repositories/room-repository";

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

    const room = await roomsRepository.findRoomById(roomId)
   
    const checkCapacity = await bookingRepository.findBookingByRoomId(roomId);
   
    if(checkCapacity.length >= room.capacity)
    throw forbiddenError();

    const newBookingData: NewBooking ={
        userId,
        roomId
    }
    const newBooking = await bookingRepository.postNewBooking(newBookingData)

    return newBooking
}

async function updateBooking(userId: number, roomId: number, bookingId: number){
    const ticket = await ticketRepository.findTicketByUserId(userId)

    if(!ticket){
        throw forbiddenError()
    }

    const booking = await bookingRepository.findBookingById(bookingId);
    if(!booking || booking.userId !== userId){
        throw forbiddenError()
    }

    const room = await roomsRepository.findRoomById(roomId)
    if(!room){
        throw notFoundError()
    }

    if(booking.Room.id === room.id){
        throw forbiddenError()
    }

    const checkCapacity = await bookingRepository.findBookingByRoomId(roomId);
   
    if(checkCapacity.length >= room.capacity)
    throw forbiddenError();

    await bookingRepository.updateBooking(booking.id, room.id)

    return booking
}

const bookingService = {
    getBooking,
    postBooking,
    updateBooking
  };
  
  export default bookingService;