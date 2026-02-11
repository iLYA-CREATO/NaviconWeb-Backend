const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware для проверки токена
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Получить отчет по зарплате для пользователя(ей) за период
router.get('/report', authenticateToken, async (req, res) => {
    try {
        const { userId, startDate, endDate } = req.query;

        // Parse executorIds from JSON string (MySQL)
        let whereClause = {
            createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
            },
        };

        // For MySQL, we need to filter manually since JSON contains arrays
        const bidSpecifications = await prisma.bidSpecification.findMany({
            where: whereClause,
            include: {
                specification: {
                    include: {
                        category: true,
                    },
                },
                bid: {
                    include: {
                        client: true,
                        clientObject: true,
                        creator: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Filter by userId if specified (since executorIds is JSON in MySQL)
        let filteredSpecs = bidSpecifications;
        if (userId && userId !== 'all') {
            const targetUserId = parseInt(userId);
            filteredSpecs = bidSpecifications.filter(spec => {
                try {
                    const executorIds = JSON.parse(spec.executorIds || '[]');
                    return executorIds.includes(targetUserId);
                } catch (e) {
                    return false;
                }
            });
        }

        // Fetch executors for each spec
        const specsWithExecutors = await Promise.all(filteredSpecs.map(async (spec) => {
            let executors = [];
            try {
                const executorIds = JSON.parse(spec.executorIds || '[]');
                if (executorIds.length > 0) {
                    executors = await prisma.user.findMany({
                        where: { id: { in: executorIds } },
                        select: { id: true, fullName: true, username: true },
                    });
                }
            } catch (e) {
                console.error('Error parsing executorIds:', e);
            }
            return { ...spec, executors };
        }));

        res.json(specsWithExecutors);
    } catch (error) {
        console.error('Error fetching salary report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;