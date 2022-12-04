import { prisma } from "@/config";
import { Address, Booking } from "@prisma/client";

async function findBookingByUserId(userId:number) {
    return prisma.booking.findFirst({
      where: {userId},
        include: {
            Room: true
        }
    })
}

async function postNewBooking(newBookingData:NewBooking) {
    return prisma.booking.create({
      data:{
        ...newBookingData
      }
    })
}

async function findBookingByRoomId(roomId: number){
  return prisma.booking.findMany({
    where:{
      roomId,
    },
  });
}

export type NewBooking = Pick<Booking, "userId" | "roomId">
const bookingRepository={
    findBookingByUserId,
    postNewBooking,
    findBookingByRoomId
}

export default bookingRepository;