import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.ticketStatus.createMany({
    data: [
      {
        title: 'Todo',
        sequence: 1,
      },
      {
        title: 'In Progress',
        sequence: 2,
      },
      {
        title: 'In Review',
        sequence: 3,
      },
      {
        title: 'Done',
        sequence: 4,
      },
    ],
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
