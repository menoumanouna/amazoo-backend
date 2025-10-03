require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const MONGO_CONFIG = {
  uri: process.env.MONGO_URI || 'mongodb://localhost:27017',
  database: process.env.MONGO_DATABASE || 'amazoo',
  options: {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }
};

class MongoDBConnection {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      this.client = new MongoClient(MONGO_CONFIG.uri, MONGO_CONFIG.options);
      await this.client.connect();
      this.db = this.client.db(MONGO_CONFIG.database);
      console.log('✅ MongoDB connected successfully');
      return this.db;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log('🔌 MongoDB disconnected');
    }
  }

  getDatabase() {
    return this.db;
  }

  getCollection(collectionName) {
    return this.db.collection(collectionName);
  }
}

// Instance singleton
const mongoDB = new MongoDBConnection();

module.exports = {
  mongoDB,
  MONGO_CONFIG
};
