import { prisma } from "../prismaClient.js";
import { getPeriodDates } from "../utils/getPeriodDates.js";

export const getStatsMoodEntriesService = async (idUser: number, period: "week" | "month" | "year") => {

    const { startDate, endDate } = getPeriodDates(period);

    // Liste des entrées de LEVEL_1 sur la période
    const entries = await prisma.moodEntry.findMany({
        where: {
            userId: idUser,
            emotionDate: { gte: startDate, lte: endDate },
            emotion: { level: "LEVEL_1" }
        },
        include: { emotion: true }
    });

    // Nombre d'entrées de LEVEL_1 sur la période
    const totalEntries = entries.length;

    if (totalEntries === 0) {
        return { totalEntries, intensityByEmotion: [], evolutionByDay: [], mostFrequent: null, leastFrequent: null };
    }

    // 2️⃣ Grouper par émotion
    const intensityMap = new Map<string, { count: number; sum: number; label: string }>();

    for (const entry of entries) {
        const id = entry.emotionId;
        const label = entry.emotion.title;
        if (!intensityMap.has(id)) {
            intensityMap.set(id, { count: 0, sum: 0, label });
        }
        const stat = intensityMap.get(id)!;
        stat.count += 1;
        stat.sum += entry.parentEmotionIntensity;
    }

    const intensityByEmotion = Array.from(intensityMap.entries()).map(([emotionId, stat]) => ({
        emotionId,
        label: stat.label,
        count: stat.count,
        avgIntensity: +(stat.sum / stat.count).toFixed(2)
    }));

    // 3️⃣ Trouver la plus fréquente / la moins fréquente
    intensityByEmotion.sort((a, b) => b.count - a.count);
    const mostFrequent = intensityByEmotion[0];
    const leastFrequent = intensityByEmotion[intensityByEmotion.length - 1];

    // 4️⃣ Évolution de l’intensité par jour
    const evolutionMap = new Map<string, { sum: number; count: number }>();
    for (const entry of entries) {
        const dateStr = entry.emotionDate.toISOString().split("T")[0]; // YYYY-MM-DD
        if (!evolutionMap.has(dateStr)) evolutionMap.set(dateStr, { sum: 0, count: 0 });
        const stat = evolutionMap.get(dateStr)!;
        stat.sum += entry.parentEmotionIntensity;
        stat.count += 1;
    }
    const evolutionByDay = Array.from(evolutionMap.entries()).map(([date, stat]) => ({
        date,
        avgIntensity: +(stat.sum / stat.count).toFixed(2)
    })).sort((a, b) => a.date.localeCompare(b.date));

    return {
        totalEntries,
        intensityByEmotion,
        mostFrequent,
        leastFrequent,
        evolutionByDay
    };
}