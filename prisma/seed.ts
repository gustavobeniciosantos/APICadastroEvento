import { prisma } from '../src/lib/prisma'
async function seed() {
    await prisma.event.create({
        data: {
            id: '3a02a451-c9bc-45b9-8820-4632a219a6d8',
            title: 'Unite Summit',
            slug: 'unite-summit',
            details: 'Um evento p/ devs',
            maximumAttendees: 120,

        }
    })
}

seed().then(() => {
    console.log('DB seeded')
    prisma.$disconnect()
})