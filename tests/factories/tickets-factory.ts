import faker from "@faker-js/faker";
import { prisma } from "@/config";
import { TicketStatus,TicketType } from "@prisma/client";

export async function createTicketType(params: Partial<TicketType> = {}) {
  return prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote: params?.isRemote !== undefined ? params.isRemote : faker.datatype.boolean(),
      includesHotel: params?.includesHotel !== undefined ? params.includesHotel : faker.datatype.boolean(),
    },
  });
}

export async function createTicketTypeRemote() {
  return prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote: true,
      includesHotel: faker.datatype.boolean(),
    },
  });
}

export async function createTicketTypeWithHotel() {
  return prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote: false,
      includesHotel: true,
    },
  });
}

export async function createTicket(enrollmentId: number, ticketTypeId: number, status: TicketStatus) {
  return prisma.ticket.create({
    data: {
      enrollmentId,
      ticketTypeId,
      status,
    },
  });
}
