import HTTPStatus from 'http-status';
import viewsModel from '../../models/mongodb/views';
import { formatJSONResponse, Error, Success } from '../../utils/helpres';
import APIError from '../../services/error';

/**
 * Incrémenter les vues d'un animal
 */
export async function incrementViews(req, res, next) {
  try {
    const { animal_id } = req.params;
    const { user } = req;
    
    // Métadonnées de la requête
    const metadata = {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID,
      userId: user?.id || null
    };

    // Créer la vue dans MongoDB
    const result = await viewsModel.createView(animal_id, user?.id, metadata);

    if (!result.success) {
      throw new APIError(HTTPStatus.INTERNAL_SERVER_ERROR, Error, result.error);
    }

    // Obtenir le nouveau compteur
    const countResult = await viewsModel.getViewsCount(animal_id);
    
    return res.status(HTTPStatus.OK).json(
      formatJSONResponse(
        HTTPStatus.OK,
        Success,
        "Vue ajoutée avec succès",
        {
          animalId: parseInt(animal_id),
          totalViews: countResult.count,
          viewId: result.viewId
        }
      )
    );
  } catch (err) {
    err.status = HTTPStatus.INTERNAL_SERVER_ERROR;
    return next(err);
  }
}

/**
 * Obtenir les statistiques de vues d'un animal
 */
export async function getViewsStatistics(req, res, next) {
  try {
    const { animal_id } = req.params;
    const { period, timeRange } = req.query;

    // Obtenir les statistiques générales
    const statistics = await viewsModel.getViewsStatistics(animal_id, timeRange);
    
    if (!statistics.success) {
      throw new APIError(HTTPStatus.INTERNAL_SERVER_ERROR, Error, statistics.error);
    }

    return res.status(HTTPStatus.OK).json(
      formatJSONResponse(
        HTTPStatus.OK,
        Success,
        "Statistiques récupérées avec succès",
        {
          animalId: parseInt(animal_id),
          statistics: statistics.statistics
        }
      )
    );
  } catch (err) {
    err.status = HTTPStatus.INTERNAL_SERVER_ERROR;
    return next(err);
  }
}

/**
 * Obtenir le top des animaux les plus vus
 */
export async function getTopViewedAnimals(req, res, next) {
  try {
    const { limit = 10, period } = req.query;
    
    const result = await viewsModel.getTopViewedAnimals(limit, period);
    
    if (!result.success) {
      throw new APIError(HTTPStatus.INTERNAL_SERVER_ERROR, Error, result.error);
    }

    return res.status(HTTPStatus.OK).json(
      formatJSONResponse(
        HTTPStatus.OK,
        Success,
        "Top des animaux récupéré avec succès",
        result.data
      )
    );
  } catch (err) {
    err.status = HTTPStatus.INTERNAL_SERVER_ERROR;
    return next(err);
  }
}
