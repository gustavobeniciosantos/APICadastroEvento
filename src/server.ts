import fastify from "fastify";

const app = fastify()

app.get('/',()=>{
   return 'hello caralho'
})

app.listen({port: 3333}).then(()=>{
    console.log("Http server running")
})