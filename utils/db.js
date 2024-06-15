import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;

    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.dbName = database;
    this.connected = false;

    this.client.connect()
      .then(() => {
        this.connected = true;
        console.log('Connected to MongoDB');
      })
      .catch((err) => {
        console.error('MongoDB connection error:', err);
      });
  }

  async isAlive() {
    try {
      if (!this.connected) throw new Error('Not connected to MongoDB');
      const db = this.client.db(this.dbName);
      await db.command({ ping: 1 });
      return true;
    } catch (err) {
      console.error('MongoDB isAlive error:', err);
      return false;
    }
  }

  async nbUsers() {
    try {
      if (!this.connected) throw new Error('Not connected to MongoDB');
      const db = this.client.db(this.dbName);
      const usersCollection = db.collection('users');
      return usersCollection.countDocuments();
    } catch (err) {
      console.error('MongoDB nbUsers error:', err);
      return 0;
    }
  }

  async nbFiles() {
    try {
      if (!this.connected) throw new Error('Not connected to MongoDB');
      const db = this.client.db(this.dbName);
      const filesCollection = db.collection('files');
      return filesCollection.countDocuments();
    } catch (err) {
      console.error('MongoDB nbFiles error:', err);
      return 0;
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
