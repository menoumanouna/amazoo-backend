/**
 * Services Routes
 */

import { Router } from "express";

import { authJwt } from "../../services/auth";
import * as ServiceController from "../../controllers/services";
import { celebrate, Joi } from "celebrate";
import multer from "multer";
const upload = multer({ dest: "/tmp" });

const routes = new Router();

/**
 * Get List Of Services
 */
routes.get(
  "/",
  //authJwt,
  ServiceController.getListService,
);
/**
 * Add Service
 */
routes.post(
  "/",
  authJwt,
  upload.any(),
  celebrate(ServiceController.validation.create),
  ServiceController.create,
);

/**
 * Update Service By ID
 */
routes.patch(
  "/:id",
  authJwt,
  upload.any(),
  celebrate(ServiceController.validation.update),
  ServiceController.update,
);

/**
 * Delete Service By ID
 */
routes.delete(
  "/:id",
  authJwt,
  celebrate({
    params: {
      id: Joi.number().positive().required(),
    },
  }),
  ServiceController.destroy,
);
export default routes;
