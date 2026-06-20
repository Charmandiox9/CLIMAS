const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.consultation.create({
      data: {
        dateTime: "2026-06-02T10:00:00.000Z",
        reason: "Dolor de espalda agudo y persistente",
        status: "SCHEDULED",
        doctorId: "cmqfe6mi90000dc56axxx30ae",
        patientId: "cmq5fp8vc0001jm85jrs58mme",
        services: {
          connect: [
            { id: "cmq5g5mcu000ajm85jpjd0vtq" }
          ]
        }
      }
    });
    console.log("Success");
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
