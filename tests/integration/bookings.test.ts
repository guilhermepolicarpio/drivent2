import app, { init } from "@/app";
import { prisma } from "@/config";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import { cleanDb, generateValidToken } from "../helpers";
import {
    createUser,
    createEnrollmentWithAddress,
    createTicket,
    createTicketType,
    createHotel,
  } from "../factories";
import { createRoom } from "../factories/room-factory";
import {createBooking} from "../factories/booking-factory"
import { DIGITABLE_LINE_TO_BOLETO_CONVERT_POSITIONS } from "@brazilian-utils/brazilian-utils/dist/utilities/boleto";

beforeAll(async () => {
    await init();
  });
  
  beforeEach(async () => {
    await cleanDb();
  });
  
  const server = supertest(app);
  
  describe("GET /booking", () => {
    it("should respond with status 401 if no token is given", async () => {
      const response = await server.get("/hotels");
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    it("should respond with status 401 if given token is not valid", async () => {
      const token = faker.lorem.word();
  
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    it("should respond with status 401 if there is no session for given token", async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    describe("when token is valid", () => {

      it("should return status 403 if capacity reached limit", async() =>{
        const user = await createUser();
        const user2= await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType({isRemote: false, includesHotel: true});
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const hotel = await createHotel();
        const room = await createRoom({ hotelId: hotel.id, capacity:1});
        await createBooking({userId: user2.id, roomId: room.id});
      
        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: room.id});
    
        expect(response.status).toBe(httpStatus.FORBIDDEN);
    
      })
        it("should respond with status 404 for invalid hotel id", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType({isRemote: false, includesHotel: true});
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            
            const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
            expect(response.status).toEqual(httpStatus.NOT_FOUND);           
          });

          it("should respond with status 200 and booking data if user does have a booking", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType({isRemote: false, includesHotel: true});
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const hotel = await createHotel();
            const room = await createRoom({hotelId: hotel.id, capacity:2});
            const booking = await createBooking({userId: user.id, roomId: room.id})
            
            const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
            expect(response.status).toEqual(httpStatus.OK);    
            expect(response.body).toEqual({
                id: booking.id,
                Room:{
                    id: room.id,
                    name: room.name,
                    capacity: room.capacity,
                    hotelId: room.hotelId,
                }
            })       
          });
    })


})

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
  it("should respond with status 404 if there is no room available for given roomId", async() =>{
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType({isRemote: false, includesHotel: true});
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await createHotel();
    const roomId = faker.datatype.number();

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`).send({roomId});

    expect(response.status).toBe(httpStatus.NOT_FOUND);

  })

  it("should return status 403 if capacity reached limit", async() =>{
    const user = await createUser();
    const user2= await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType({isRemote: false, includesHotel: true});
    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
    const hotel = await createHotel();
    const room = await createRoom({ hotelId: hotel.id, capacity:1});
    await createBooking({userId: user2.id, roomId: room.id});
  
    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: room.id});

    expect(response.status).toBe(httpStatus.FORBIDDEN);

  })

  it("should respond with status 200 and with booking data", async()=>{
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType({isRemote: false, includesHotel: true});
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const room = await createRoom({ hotelId: hotel.id, capacity:1});

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: room.id});

    expect(response.status).toBe(httpStatus.OK);
  })
})})

describe("PUT /booking/bookingId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });


  describe("when token is valid", () => {
    it("should return status 403 if capacity reached limit", async() =>{
      const user = await createUser();
      const user2= await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType({isRemote: false, includesHotel: true});
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoom({ hotelId: hotel.id, capacity:1});
      const room2 = await createRoom({ hotelId: hotel.id, capacity:1});
      const booking= await createBooking({userId: user.id, roomId: room2.id});
      await createBooking({userId: user2.id, roomId: room.id});

      const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({roomId: room.id});
  
      expect(response.status).toBe(httpStatus.FORBIDDEN);
  
    })

    it("should respond with status 404 if there is no room available for given roomId", async()=>{
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType({isRemote: false, includesHotel: true});
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const roomId = faker.datatype.number();
      const room = await createRoom({ hotelId: hotel.id, capacity: 2})
      const booking = await createBooking({userId: user.id, roomId: room.id})
  
      const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({roomId: roomId});
  
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    })

    it("should respond with status 200 and with bookingId if everything is ok", async()=>{
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType({isRemote: false, includesHotel: true});
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoom({ hotelId: hotel.id, capacity:2});
      const room2 = await createRoom({ hotelId: hotel.id, capacity:2});
      const booking= await createBooking({userId: user.id, roomId: room2.id});
     
  
      const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({roomId: room.id});
  
      expect(response.status).toBe(httpStatus.OK);
    })

  })

})