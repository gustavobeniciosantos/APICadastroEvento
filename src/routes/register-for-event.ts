import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { BadRequest } from "./_errors/bad-request";

export async function registerForEvent(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .post('/events/:eventId/attendees', {
            schema: {
                body: z.object({//variaveis que tem que ter no body da req
                    name: z.string().min(4),
                    email: z.string().email(),
                }),
                params: z.object({//parametro que é o id do evento em questão
                    eventId: z.string().uuid()
                }),
                response: {
                    201: z.object({
                        attendeeId: z.number(),
                    })
                }

            }
        }, async (request, reply) => {

            const { eventId } = request.params
            const { name, email } = request.body

            const attendeeFromEmail = await prisma.attendee.findUnique({
                where: {
                    eventId_email: {
                        email,
                        eventId
                    }
                }
            })

            if (attendeeFromEmail !== null) {//encontrou o participante no evento
                throw new BadRequest('This e-mail is already registred for this event')
            }


            const [event, amountOfAttendeesForEvent] = await Promise.all([ //essas 2 querys vao executar ao msm tempo
                prisma.event.findUnique({
                    where: {
                        id: eventId,
                    }
                }),

                prisma.attendee.count({
                    where: {
                        eventId,
                    }
                })

            ])

            if (event?.maximumAttendees && amountOfAttendeesForEvent >= event.maximumAttendees) {
                throw new BadRequest('The maximum number of attendees for this event hass been reached')
            }

            const attendee = await prisma.attendee.create({
                data: {
                    name,
                    email,
                    eventId
                }
            })

            return reply.status(201).send({ attendeeId: attendee.id })

        })
}