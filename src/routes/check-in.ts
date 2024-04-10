import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { BadRequest } from "./_errors/bad-request";


export async function checkIn(app: FastifyInstance) {

    app
    .withTypeProvider<ZodTypeProvider>()
    .get('/attendees/:attendeeId/check-in', {

        schema: {
            params: z.object({
                attendeeId: z.coerce.number().int()
            }),
            response: {
                201: z.null(),
            }
        }

    }, async (request, reply) =>{

        const {attendeeId} = request.params

        const attendeeCheckIn = await prisma.checkIn.findUnique({
           where:{
            attendeeId,
           } 
        })

        if(attendeeCheckIn !== null){//caso o attendee id for nulo, significa que o cliente já fez o checkin
            throw new BadRequest('Attendee already checked in')
        }

        await prisma.checkIn.create({//se não for nulo, ele cria um checkin e põe no BD
            data:{
                attendeeId,
            }
        })

        return reply.status(201).send()
    })    
}