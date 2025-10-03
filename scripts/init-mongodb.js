const { MongoClient } = require('mongodb');

async function initializeMongoDB() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('✅ Connexion à MongoDB réussie');
    
    const db = client.db('amazoo');
    
    // Créer la collection views (si elle n'existe pas)
    try {
      await db.createCollection('views');
      console.log('✅ Collection "views" créée');
    } catch (error) {
      if (error.code === 48) {
        console.log('ℹ️  Collection "views" existe déjà');
      } else {
        throw error;
      }
    }
    
    // Créer les index
    const viewsCollection = db.collection('views');
    await viewsCollection.createIndex({ animalId: 1 });
    await viewsCollection.createIndex({ animalId: 1, timestamp: -1 });
    await viewsCollection.createIndex({ userId: 1 });
    console.log('✅ Index créés');
    
    // Vérifier les données existantes
    const existingCount = await viewsCollection.countDocuments();
    console.log(`ℹ️  ${existingCount} documents existants dans la collection views`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
  }
}

initializeMongoDB();
