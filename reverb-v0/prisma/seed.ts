import { PrismaClient, Provider, StreamType } from "@prisma/client"

const prisma = new PrismaClient()


const teluguFirstNames = [
  "Sairam", "Arjun", "Chaitanya", "Bhargav", "Atharv", "Rohan", "Rudra", "Samarth",
  "Tejas", "Prakash", "Charan", "Ram", "Krishna", "Gautham", "Harsha", "Ravi",
  "Sagar", "Sai", "Shankar", "Srinivas", "Sundar", "Ananya", "Aarti", "Gayatri",
  "Bhavya", "Chandrika", "Harini", "Manasa", "Mounika", "Navya", "Pallavi", "Pavani",
  "Pragya", "Radha", "Sandhya", "Siri", "Sneha", "Soumya", "Veda", "Vidya",
  "Mahesh", "Nikhil", "Varun", "Prabhas", "Karthik", "Gopi", "Anil", "Rajesh",
  "Suresh", "Ramesh", "Vikram", "Aditya", "Kiran", "Naveen", "Pavan", "Kalyan",
]

const teluguLastNames = [
  "Reddy", "Raju", "Yadav", "Akkineni", "Allu", "Bandaru", "Challa", "Gaddam",
  "Gollapudi", "Konda", "Kosaraju", "Malladi", "Mandala", "Thota", "Vemuri",
  "Yarlagadda", "Dasari", "Devulapalli", "Daggubati", "Jonnalagadda", "Kancherla",
  "Nadella", "Pemmaraju", "Vallabhaneni", "Goparaju", "Kanukollu", "Rao", "Gupta",
  "Sharma", "Varma", "Kumar", "Murthy", "Naidu", "Chowdary", "Sastry", "Goud",
]

const emailDomains = [
  "@gmail.com",
  "@yahoo.com",
]

const youtubeTeluguSongs = [
  { title: "Kurchi Madathapetti", videoId: "hYmBxERujs8" },
  { title: "Oo Antava Mawa..Oo Oo Antava", videoId: "u_wB6byrl5k" },
  { title: "Jaragandi", videoId: "MXCD0PDSdvI" },
  { title: "Nee Chuttu Chuttu", videoId: "AzAbc_7F0hE" },
  { title: "Ganesh Anthem", videoId: "S5TkFh8H9JQ" },
  { title: "Ayyo Paapam Saaru", videoId: "N0bDAbJdHH4" },
  { title: "Bhairava Anthem", videoId: "U_3YGMUHdZg" },
  { title: "Dum Masala", videoId: "AKkJIOknE0k" },
  { title: "Jam Jam Jajjanaka", videoId: "pYA0uU-P1nU" },
  { title: "Naa Saami Ranga", videoId: "rtDKZiNm9no" },
  { title: "Mawaa Enthaina", videoId: "BQ1ICH_ZNc4" },
  { title: "Gandarabai (Telugu)", videoId: "u17ZAzegA2w" },
  { title: "Bujjima Bujjima (Run Raja Run)", videoId: "ffgbJ8tLz-w" },
  { title: "Yedo Yedo Maaya", videoId: "tUXHyh7Jzz0" },
  { title: "Gaali Soundullo", videoId: "l1S911vGlIY" },
  { title: "Darlingey (Mirchi)", videoId: "sdg7N5UjSBA" },
  { title: "Roar Of Kesari", videoId: "wtQ72l8MvXE" },
  { title: "Nee Kalle Diwali", videoId: "rCQlDMpkbl8" },
  { title: "Srivalli", videoId: "txHO7PLGE3o" },
  { title: "ButtaBomma", videoId: "zXWJLEE7LeI" },
]


function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateEmail(firstName: string, lastName: string): string {
  const providers = ["", ".", "_"]
  const separator = getRandomElement(providers)
  const number = Math.random() > 0.5 ? getRandomInt(1, 99) : ""
  const domain = getRandomElement(emailDomains)
  return `${firstName.toLowerCase()}${separator}${lastName.toLowerCase()}${number}${domain}`
}

function getYoutubeData(title: string, videoId: string) {
  return {
    type: StreamType.Youtube,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    extractedId: videoId,
    title: title,
    smallImg: `https://img.youtube.com/vi/${videoId}/default.jpg`,
    bigImg: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    active: true,
    played: false,
  }
}

async function main() {
  console.log("Deleting existing data...")
  // Delete in reverse order of dependency to avoid constraint errors
  await prisma.upvote.deleteMany({})
  await prisma.stream.deleteMany({})
  await prisma.user.deleteMany({})
  console.log("Existing data deleted.\n")
  
  console.log("Seeding 100 users...")
  const usersData = []
  const emailSet = new Set<string>()

  while (usersData.length < 100) {
    const firstName = getRandomElement(teluguFirstNames)
    const lastName = getRandomElement(teluguLastNames)
    const email = generateEmail(firstName, lastName)

    if (!emailSet.has(email)) {
      emailSet.add(email)
      usersData.push({
        email: email,
        provider: Provider.Google,
      })
    }
  }

  await prisma.user.createMany({
    data: usersData,
  })

  // Get all created users back from DB (to get their IDs)
  const allUsers = await prisma.user.findMany()
  const userIds = allUsers.map((u) => u.id)
  console.log(`Created ${allUsers.length} users.`)

  console.log("Seeding streams...")
  const streamsData = []

  for (const song of youtubeTeluguSongs) {
    const streamDetails = getYoutubeData(song.title, song.videoId)
    streamsData.push({
      ...streamDetails,
      // Assign a random user as the "owner" and another as "addedBy"
      userId: getRandomElement(userIds),
      addedById: getRandomElement(userIds),
    })
  }

  await prisma.stream.createMany({
    data: streamsData,
  })

  // Get all created streams back from DB (to get their IDs)
  const allStreams = await prisma.stream.findMany()
  console.log(`Created ${allStreams.length} streams.`)

  // --- 3. Create Upvotes (5-15 per stream) ---
  console.log("Seeding upvotes for each stream...")
  const upvotesData = []

  for (const stream of allStreams) {
    const numUpvotes = getRandomInt(5, 15)
    
    // Use a Set to track users who upvoted *this* stream
    // to prevent violating the @@unique([userId, streamId]) constraint
    const usersWhoUpvotedThisStream = new Set<string>()

    for (let i = 0; i < numUpvotes; i++) {
      let randomUserId = getRandomElement(userIds)
      
      // Keep trying to find a user who hasn't upvoted this stream yet
      while (usersWhoUpvotedThisStream.has(randomUserId)) {
        randomUserId = getRandomElement(userIds)
      }

      usersWhoUpvotedThisStream.add(randomUserId)
      upvotesData.push({
        userId: randomUserId,
        streamId: stream.id,
      })
    }
  }

  await prisma.upvote.createMany({
    data: upvotesData,
  })
  console.log(`Created ${upvotesData.length} total upvotes.`)
  
  console.log("\n Seeding finished successfully!")
}

main()
  .catch((e) => {
    console.error("Seeding error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })