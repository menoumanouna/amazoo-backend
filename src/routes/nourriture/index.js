/**
 * Nourriture Routes
 */

import { Router } from "express";

import { authJwt } from "../../services/auth";
import * as NourrituresController from "../../controllers/nourriture";
import { celebrate, Joi } from "celebrate";

const routes = new Router();

/**
 * Get List Of Nourritures
 */
routes.get("/", authJwt, NourrituresController.getListNourritures);
/**
 * Add Nourriture
 */
routes.post(
  "/",
  authJwt,
  celebrate(NourrituresController.validation.create),
  NourrituresController.create,
);

/**
 * Update Nourriture By ID
 */
routes.patch(
  "/:id",
  authJwt,
  celebrate(NourrituresController.validation.update),
  NourrituresController.update,
);

/**
 * Delete Nourriture By ID
 */
routes.delete(
  "/:id",
  authJwt,
  celebrate({
    params: {
      id: Joi.number().positive().required(),
    },
  }),
  NourrituresController.destroy,
);
export default routes;
