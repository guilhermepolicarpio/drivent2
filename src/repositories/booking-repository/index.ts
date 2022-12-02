import { prisma } from "@/config";
import { Address } from "@prisma/client";

async function findBookingByUserId(userId:number) {
    return prisma.booking.findFirst({
      where: {userId},
        include: {
            Room: true
        }
    })
}

const bookingRepository={
    findBookingByUserId
}

export default bookingRepository