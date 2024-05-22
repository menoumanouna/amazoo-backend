/**
 * Reports Routes
 */

import { Router } from "express";

import { authJwt } from "../../services/auth";
import * as ReportsController from "../../controllers/reports";
import { celebrate, Joi } from "celebrate";

const routes = new Router();

/**
 * Get List Of Reports
 */
routes.get(
  "/",
  //authJwt,
  ReportsController.getListReports,
);
/**
 * Add Report
 */
routes.post(
  "/",
  authJwt,
  celebrate(ReportsController.validation.create),
  ReportsController.create,
);

/**
 * Update Report By ID
 */
routes.patch(
  "/:id",
  authJwt,
  celebrate(ReportsController.validation.update),
  ReportsController.update,
);

/**
 * Delete Report By ID
 */
routes.delete(
  "/:id",
  authJwt,
  celebrate({
    params: {
      id: Joi.number().positive().required(),
    },
  }),
  ReportsController.destroy,
);
export default routes;
