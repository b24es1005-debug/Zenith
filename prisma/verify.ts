import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.count()
  const locations = await prisma.location.count()
  const events = await prisma.astronomicalEvent.count()
  const meetups = await prisma.meetup.count()

  console.log({ users, locations, events, meetups })

  const meetup = await prisma.meetup.findFirst({ include: { host: true, participants: true } })
  console.log('Sample meetup join:', meetup ? { id: meetup.id, title: meetup.title, host: meetup.host?.email, locationName: meetup.locationName, participants: meetup.participants.length } : null)

  const aUser = await prisma.user.findFirst({ include: { createdLocations: true, participants: true, observations: true } })
  console.log('Sample user relations:', aUser ? { id: aUser.id, createdLocations: aUser.createdLocations.length, participants: aUser.participants.length, observations: aUser.observations.length } : null)

  // Check indexes on the locations table
  try {
    const indexes = await prisma.$queryRaw<Array<{ indexname: string; indexdef: string }>>`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'Location' OR tablename = 'location'
    `;
    console.log('Indexes on location table:', indexes)
  } catch (e) {
    console.warn('Could not query pg_indexes:', e)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
