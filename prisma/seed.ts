import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  console.log("Seeding...");

  // Admin user (role ADMIN). Password: admin12345
  const adminEmail = "auth@admin.com";
  const admin = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      name: "Admin",
      email: adminEmail,
      emailVerified: true,
      role: "ADMIN",
      username: "super",
      displayUsername: "super",
    },
  });
  await prisma.account.create({
    data: {
      id: crypto.randomUUID(),
      accountId: admin.id,
      providerId: "credential",
      userId: admin.id,
      password: await hashPassword("super_password"),
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
