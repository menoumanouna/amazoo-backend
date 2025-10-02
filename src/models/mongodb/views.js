const { mongoDB } = require('../../../config/mongodb');

class ViewsModel {
  constructor() {
    this.collectionName = 'views';
  }

  async getCollection() {
    const db = await mongoDB.connect();
    return db.collection(this.collectionName);
  }

  // Créer une nouvelle vue
  async createView(animalId, userId = null, metadata = {}) {
    try {
      const collection = await this.getCollection();
      const viewDocument = {
        animalId: parseInt(animalId),
        userId: userId,
        timestamp: new Date(),
        ip: metadata.ip,
        userAgent: metadata.userAgent,
        sessionId: metadata.sessionId,
        ...metadata
      };

      const result = await collection.insertOne(viewDocument);
      return {
        success: true,
        viewId: result.insertedId,
        data: viewDocument
      };
    } catch (error) {
      console.error('Error creating view:', error);
      return { success: false, error: error.message };
    }
  }

  // Compter les vues pour un animal
  async getViewsCount(animalId) {
    try {
      const collection = await this.getCollection();
      const count = await collection.countDocuments({ 
        animalId: parseInt(animalId) 
      });
      return { success: true, count };
    } catch (error) {
      console.error('Error getting views count:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtenir les statistiques détaillées
  async getViewsStatistics(animalId, timeRange = null) {
    try {
      const collection = await this.getCollection();
      let query = { animalId: parseInt(animalId) };
      
      if (timeRange) {
        query.timestamp = {
          $gte: new Date(Date.now() - timeRange)
        };
      }

      const pipeline = [
        { $match: query },
        {
          $group: {
            _id: null,
            totalViews: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' },
            lastView: { $max: '$timestamp' },
            firstView: { $min: '$timestamp' }
          }
        },
        {
          $project: {
            _id: 0,
            totalViews: 1,
            uniqueUsers: { $size: '$uniqueUsers' },
            lastView: 1,
            firstView: 1
          }
        }
      ];

      const result = await collection.aggregate(pipeline).toArray();
      return { 
        success: true, 
        statistics: result[0] || { totalViews: 0, uniqueUsers: 0 }
      };
    } catch (error) {
      console.error('Error getting views statistics:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtenir le top des animaux les plus vus
  async getTopViewedAnimals(limit = 10, period = null) {
    try {
      const collection = await this.getCollection();
      let matchQuery = {};
      
      if (period) {
        const now = new Date();
        const startDate = new Date(now.getTime() - period * 24 * 60 * 60 * 1000);
        matchQuery.timestamp = { $gte: startDate };
      }

      const pipeline = [
        { $match: matchQuery },
        {
          $group: {
            _id: '$animalId',
            totalViews: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' },
            lastView: { $max: '$timestamp' }
          }
        },
        {
          $project: {
            animalId: '$_id',
            totalViews: 1,
            uniqueUsers: { $size: '$uniqueUsers' },
            lastView: 1,
            _id: 0
          }
        },
        { $sort: { totalViews: -1 } },
        { $limit: parseInt(limit) }
      ];

      const result = await collection.aggregate(pipeline).toArray();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error getting top viewed animals:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ViewsModel();
