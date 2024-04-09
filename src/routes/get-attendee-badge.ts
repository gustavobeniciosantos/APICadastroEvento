import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function getAttendeeBadge(app: FastifyInstance) {

    app
        .withTypeProvider<ZodTypeProvider>()
        .get('/attendees/:attendeeId/badge', {
            schema: {
                params: z.object({
                    attendeeId: z.coerce.number().int()//no BD é um int, mas na URL será uma String
                }),
                response: {
                    200: z.object({
                        badge: z.object({
                            name: z.string(),
                            email: z.string().email(),
                            eventTitle: z.string(),
                            checkinURL: z.string().url(),
                        })
                    })
                }
            }

        }, async (request, reply) => {

            const { attendeeId } = request.params

            const attendee = await prisma.attendee.findUnique({
                select: {
                    name: true,
                    email: true,
                    event: {
                        select: {
                            title: true,
                        }
                    }
                },
                where: {
                    id: attendeeId,
                }
            })

            if (attendee === null) {
                throw new Error('Attendee not found')
            }

            const baseURL = `${request.protocol}://${request.hostname}`

            const checkinURL = new URL(`/attendees/${attendeeId}/checkin`, baseURL)


            return reply.send({
                badge: {
                    name: attendee.name,
                    email: attendee.email,
                    eventTitle: attendee.event.title,
                    checkinURL: checkinURL.toString(),
                }
            })
        })

}