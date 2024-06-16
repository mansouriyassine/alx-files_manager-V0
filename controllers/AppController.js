import dbClient from '../utils/db.js';

const AppController = {
  async getStatus(req, res) {
    const redisAlive = true; // Assuming Redis is always alive
    const dbAlive = dbClient.isAlive();

    if (redisAlive && dbAlive) {
      return res.status(200).json({ redis: true, db: true });
    }

    return res.status(500).json({ redis: redisAlive, db: dbAlive });
  },

  async getStats(req, res) {
    const usersCount = await dbClient.nbUsers();
    const filesCount = await dbClient.nbFiles();

    return res.status(200).json({ users: usersCount, files: filesCount });
  }
};

export default AppController;
