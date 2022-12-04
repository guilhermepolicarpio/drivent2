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

async function findBookingById(id: number){
  return prisma.booking.findUnique({
    where:{
      id
    },
    include:{
      Room: true
    }
  })
}

async function updateBooking(id: number, roomId: number){
  return prisma.booking.update({
    where:{
      id
    },
    data:{
      roomId
    }
  })
}

export type NewBooking = Pick<Booking, "userId" | "roomId">
const bookingRepository={
    findBookingByUserId,
    postNewBooking,
    findBookingByRoomId,
    findBookingById,
    updateBooking
}

export default bookingRepository;