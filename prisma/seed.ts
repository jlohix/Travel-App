import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean slate
  await prisma.vote.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.message.deleteMany();
  await prisma.pin.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 10);

  const alice = await prisma.user.create({
    data: {
      email: "alice@example.com",
      username: "alice",
      password,
      bio: "Solo traveler. Coffee, mountains, and old towns.",
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: "bob@example.com",
      username: "bob",
      password,
      bio: "Foodie exploring the world one street stall at a time.",
    },
  });

  const carol = await prisma.user.create({
    data: {
      email: "carol@example.com",
      username: "carol",
      password,
      bio: "Photographer chasing scenic viewpoints.",
    },
  });

  // Pins
  await prisma.pin.createMany({
    data: [
      { userId: alice.id, title: "Shibuya Crossing", note: "Insanely busy at night!", lat: 35.6595, lng: 139.7005, category: "sight" },
      { userId: alice.id, title: "Senso-ji Temple", note: "Go early to avoid crowds", lat: 35.7148, lng: 139.7967, category: "sight" },
      { userId: bob.id, title: "Tsukiji Outer Market", note: "Best sushi breakfast", lat: 35.6654, lng: 139.7707, category: "food" },
      { userId: carol.id, title: "Mount Fuji viewpoint", note: "Sunrise photos", lat: 35.3606, lng: 138.7274, category: "sight" },
    ],
  });

  // Forum posts
  const post1 = await prisma.post.create({
    data: {
      authorId: bob.id,
      title: "Best ramen in Shinjuku?",
      body: "Landing in Tokyo next week and staying in Shinjuku. Where do the locals actually eat ramen? Looking for non-touristy spots.",
      country: "Japan",
      region: "Tokyo",
      city: "Tokyo",
    },
  });

  const post2 = await prisma.post.create({
    data: {
      authorId: carol.id,
      title: "Sunrise spots near Mount Fuji",
      body: "Sharing my favorite viewpoints for sunrise photography around Lake Kawaguchi. Bring a tripod and warm clothes!",
      country: "Japan",
      region: "Yamanashi",
      city: "Fujikawaguchiko",
    },
  });

  const post3 = await prisma.post.create({
    data: {
      authorId: alice.id,
      title: "3 days in Kyoto - itinerary check",
      body: "Planning temples on day 1, Arashiyama on day 2, Nara day trip on day 3. Am I trying to do too much?",
      country: "Japan",
      region: "Kyoto",
      city: "Kyoto",
    },
  });

  await prisma.comment.createMany({
    data: [
      { postId: post1.id, authorId: alice.id, body: "Fuunji near Shinjuku station is amazing for tsukemen." },
      { postId: post1.id, authorId: carol.id, body: "Second Fuunji, but go before noon or the line is huge." },
      { postId: post2.id, authorId: bob.id, body: "The Chureito Pagoda view is unreal at sunrise." },
    ],
  });

  await prisma.vote.createMany({
    data: [
      { postId: post1.id, userId: alice.id, value: 1 },
      { postId: post1.id, userId: carol.id, value: 1 },
      { postId: post2.id, userId: alice.id, value: 1 },
      { postId: post2.id, userId: bob.id, value: 1 },
      { postId: post3.id, userId: bob.id, value: 1 },
    ],
  });

  await prisma.message.createMany({
    data: [
      { senderId: alice.id, recipientId: bob.id, body: "Hey Bob! Saw your ramen post - did you end up going to Fuunji?" },
      { senderId: bob.id, recipientId: alice.id, body: "Yes! Thanks for the tip, the tsukemen was incredible." },
      { senderId: carol.id, recipientId: alice.id, body: "Want to meet up in Kyoto next month?" },
    ],
  });

  console.log("Seed complete!");
  console.log("Demo logins (password: password123):");
  console.log("  alice@example.com / bob@example.com / carol@example.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
