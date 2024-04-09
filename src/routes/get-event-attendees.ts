import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { number, z } from "zod";
import { prisma } from "../lib/prisma";

export async function getEventAttendees(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .get('/events/:eventId/attendees', {
            schema: {
                params: z.object({
                    eventId: z.string().uuid(),
                }),
                querystring: z.object({
                    query: z.string().nullish(),
                    pageIndex: z.string().nullish().nullable().default('0').transform(Number),
                }),
                response: {
                    200: z.object({
                        attendees: z.array(
                            z.object({
                                id: z.number(),
                                name: z.string(),
                                email: z.string().email(),
                                createdAt: z.date(),
                                checkedInAt: z.date().nullable(),

                            })
                        )
                    })
                }
            }
        }, async (request, reply) => {

            const { eventId } = request.params
            const { pageIndex, query } = request.query

            const attendees = await prisma.attendee.findMany({
                select:{
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                    checkIn: {
                        select:{
                            createdAt: true,
                        }
                    }
                },

                where: query ? {name:{
                    contains: query,
                }} : {
                    eventId,
                    
                },
                take: 10,
                skip: pageIndex * 10,
                orderBy:{
                    createdAt: 'desc'
                }
            })
            return reply.send({ 
                attendees: attendees.map(attendee => {
                    return{
                        id: attendee.id,
                        name: attendee.name,
                        email: attendee.email,
                        createdAt: attendee.createdAt,
                        checkedInAt: attendee.checkIn?.createdAt ?? null,
                    }
                })
            })
        })
}