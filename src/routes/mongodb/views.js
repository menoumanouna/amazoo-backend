import express from 'express';
import { Joi } from 'celebrate';
import { 
  incrementViews, 
  getViewsStatistics, 
  getTopViewedAnimals 
} from '../../controllers/mongodb/views';

const router = express.Router();

// Validation schemas
const validation = {
  incrementViews: {
    params: {
      animal_id: Joi.number().positive().required()
    }
  },
  getViewsStatistics: {
    params: {
      animal_id: Joi.number().positive().required()
    },
    query: {
      period: Joi.string().valid('hour', 'day', 'week', 'month').optional(),
      timeRange: Joi.number().positive().optional()
    }
  },
  getTopViewedAnimals: {
    query: {
      limit: Joi.number().positive().max(100).optional(),
      period: Joi.number().positive().optional()
    }
  }
};

// Routes
router.post('/animals/:animal_id/views', 
  validation.incrementViews, 
  incrementViews
);

router.get('/animals/:animal_id/views', 
  validation.getViewsStatistics, 
  getViewsStatistics
);

router.get('/animals/top-viewed', 
  validation.getTopViewedAnimals, 
  getTopViewedAnimals
);

export default router;
