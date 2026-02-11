const { PrismaClient } = require('@prisma/client');

// Lazy initialization - don't connect immediately
let prisma;

function getPrisma() {
    if (!prisma) {
        prisma = new PrismaClient({
            log: ['error', 'warn'],
        });
    }
    return prisma;
}

// Export getter instead of direct instance
module.exports = { getPrisma };
