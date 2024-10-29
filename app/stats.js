import os from 'os';

const formatMemoryUsage = (data) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;

export const stats = () => {
    const memoryData = process.memoryUsage();
    return {
        env: process.env.NODE_ENV,
        cpu: (os.cpus() || []).length,
        app: {
            rss: formatMemoryUsage(memoryData.rss),
            heapTotal: formatMemoryUsage(memoryData.heapTotal),
            heapUsed: formatMemoryUsage(memoryData.heapUsed),
            external: formatMemoryUsage(memoryData.external),
        },
        os: {
            total: formatMemoryUsage(os.totalmem()),
            free: formatMemoryUsage(os.freemem()),
        }
    };
}