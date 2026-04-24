import { prisma } from "../../src/prismaClient.js";
import bcrypt from "bcrypt";

async function main() {
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" }
  });

  if (existingAdmin) {
    console.log("Admin déjà existant ✅");
    return;
  }

  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  await prisma.user.create({
    data: {
      username: "SuperAdmin",
      email: "admin@test.com",
      passwordHash: hashedPassword,
      role: "ADMIN",
      termsConsentAt: new Date,
      privacyConsentAt: new Date
    }
  });

  console.log("Admin créé ✅");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });