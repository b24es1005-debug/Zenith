import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create users
  const users = await Promise.all([
    prisma.user.create({ data: { email: 'alice@example.com', name: 'Alice' } }),
    prisma.user.create({ data: { email: 'bob@example.com', name: 'Bob' } }),
    prisma.user.create({ data: { email: 'carol@example.com', name: 'Carol' } }),
  ])

  // Create locations
  const locations = await Promise.all([
    prisma.location.create({ data: { name: 'Dark Ridge', description: 'Open ridge with clear horizon', latitude: 34.05, longitude: -118.25, createdById: users[0].id } }),
    prisma.location.create({ data: { name: 'Valley Lake', description: 'Lake surrounded by hills', latitude: 36.17, longitude: -115.14, createdById: users[1].id } }),
    prisma.location.create({ data: { name: 'High Peak', description: 'High altitude, low light pollution', latitude: 39.74, longitude: -104.99, createdById: users[2].id } }),
    prisma.location.create({ data: { name: 'Coastal Bluff', description: 'Sea air, clear skies', latitude: 37.77, longitude: -122.42, createdById: users[0].id } }),
    prisma.location.create({ data: { name: 'Desert Plains', description: 'Remote and dark', latitude: 33.45, longitude: -112.07, createdById: users[1].id } }),
  ])

  // Create astronomical events
  await prisma.astronomicalEvent.deleteMany()

  const events = await Promise.all([
    prisma.astronomicalEvent.create({ data: { title: 'Perseids Meteor Shower', description: 'Annual Perseids with strong northern hemisphere activity.', startDate: new Date('2026-08-12T22:00:00Z'), endDate: new Date('2026-08-13T04:00:00Z'), eventType: 'METEOR_SHOWER', visibilityInfo: { bestViewedFrom: ['Northern Hemisphere'], peakNight: '2026-08-12' } } }),
    prisma.astronomicalEvent.create({ data: { title: 'Total Lunar Eclipse', description: 'A visible lunar eclipse for many regions.', startDate: new Date('2026-05-16T03:00:00Z'), endDate: new Date('2026-05-16T06:00:00Z'), eventType: 'LUNAR_ECLIPSE', visibilityInfo: { bestViewedFrom: ['Americas', 'Pacific'], type: 'Total lunar eclipse' } } }),
    prisma.astronomicalEvent.create({ data: { title: 'Partial Solar Eclipse', description: 'Solar eclipse event with partial visibility.', startDate: new Date('2026-10-14T15:00:00Z'), endDate: new Date('2026-10-14T18:00:00Z'), eventType: 'SOLAR_ECLIPSE', visibilityInfo: { bestViewedFrom: ['North America'], type: 'Partial solar eclipse' } } }),
    prisma.astronomicalEvent.create({ data: { title: 'Mars-Jupiter Conjunction', description: 'Close planetary approach in the morning sky.', startDate: new Date('2026-07-20T20:00:00Z'), endDate: new Date('2026-07-21T02:00:00Z'), eventType: 'PLANETARY_CONJUNCTION', visibilityInfo: { visiblePlanets: ['Mars', 'Jupiter'] } } }),
    prisma.astronomicalEvent.create({ data: { title: 'Venus Transit (simulated)', description: 'Rare transit-style event for planning and testing.', startDate: new Date('2026-09-01T18:00:00Z'), endDate: new Date('2026-09-01T21:00:00Z'), eventType: 'TRANSIT', visibilityInfo: { note: 'Simulated event for Zenith demo data' } } }),
  ])

  // Create meetups
  const meetups = await Promise.all([
    prisma.meetup.create({ data: { title: 'Weekend Stargaze', description: 'Bring your telescope', hostUserId: users[0].id, dateTime: new Date('2026-06-20T20:00:00Z'), maxParticipants: 20, latitude: locations[0].latitude, longitude: locations[0].longitude, locationName: locations[0].name } }),
    prisma.meetup.create({ data: { title: 'Astro Photography Night', description: 'Long exposure workshop', hostUserId: users[1].id, dateTime: new Date('2026-07-05T19:30:00Z'), maxParticipants: 12, latitude: locations[2].latitude, longitude: locations[2].longitude, locationName: locations[2].name } }),
  ])

  console.log('Seed data created:', { users: users.length, locations: locations.length, events: events.length, meetups: meetups.length })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
