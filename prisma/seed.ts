import {PrismaClient} from "@prisma/client";

// initialize Prisma Client
const prisma = new PrismaClient();

async function main(){
    const gStart = Date.now();
    console.log(`\n✅  Seeding completed ! (${Date.now() - gStart}ms)`);
}

// eslint-disable-next-line @/no-unused-vars
async function seed(table: any, data: any[]){
    for(let i = 1; i <= data.length; i++){
        await table.upsert({
            where: {id: i},
            update: {
                ...data[i - 1],
            },
            create: {
                ...data[i - 1],
            },
        });
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(async() => {
    await prisma.$disconnect();
});
