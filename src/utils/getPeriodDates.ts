export const getPeriodDates = (period: "week" | "month" | "year") => {
    const now = new Date();

    switch (period) {

        case "week": {
            const day = now.getUTCDay() || 7;

            const start = new Date(now);
            start.setUTCDate(now.getUTCDate() - day + 1);

            const end = new Date(start);
            end.setUTCDate(start.getUTCDate() + 6);

            return { startDate: start, endDate: end };
        }

        case "month":
            return {
                startDate: new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)),
                endDate: new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0))
            };

        case "year":
            return {
                startDate: new Date(Date.UTC(now.getFullYear(), 0, 1)),
                endDate: new Date(Date.UTC(now.getFullYear(), 11, 31))
            };

        default:
            throw new Error("INVALID_PERIOD");
    }
};