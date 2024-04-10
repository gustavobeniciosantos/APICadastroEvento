import { serializerCompiler, ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod';//verificador de dados
import { generateSlug } from "../utils/generate-slugs";
import { prisma } from '../lib/prisma';
import { FastifyInstance } from 'fastify';
import { BadRequest } from './_errors/bad-request';

export async function createEvent(app: FastifyInstance) { //Aqui eu exporto o create event parao server com a lógica do post
    app.withTypeProvider<ZodTypeProvider>()
        .post('/events', {
            schema: {
                body:
                    z.object({
                        title: z.string({invalid_type_error: 'O título precisa ser um texto'}).min(4),
                        details: z.string().nullable(),
                        maximumAttendees: z.number().int().positive().nullable(),
                    }),//faz a validação de cada item do BD
                response: {
                    201: z.object({
                        eventId: z.string().uuid()
                    })
                }
            }
        }, async (request, reply) => {

            const {
                title,
                details,
                maximumAttendees
            } = request.body//pega o request.body e ve se segue a estrutura do createEventSchema

            const slug = generateSlug(title)
            const eventWithSameSlug = await prisma.event.findUnique({
                where: {
                    slug,
                }
            })//verifica se já existe o mesmo slug no BD

            if (eventWithSameSlug !== null) {
                throw new BadRequest("Another event with same title already exist")
            }//Caso exista (não for nulo), aparecerá esse erro no resp Json


            //await = Algo que vai demorar pra acontecer. Espera o data processar para então executar o restante.
            const event = await prisma.event.create({
                data: {
                    title,
                    details,
                    maximumAttendees,
                    slug,


                }
            })

            return reply.status(201).send({ eventId: event.id })//retorno o ID com uma mensagem que foi criado (cod 201)
        })
}

