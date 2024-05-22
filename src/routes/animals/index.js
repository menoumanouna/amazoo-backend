/**
 * Animals Routes
 */

import { Router } from "express";

import { authJwt } from "../../services/auth";
import * as AnimalsController from "../../controllers/animals";
import { celebrate, Joi } from "celebrate";
const routes = new Router();
import multer from "multer";
const upload = multer({ dest: "/tmp" });

/**
 * Get List Of Animals
 */
routes.get(
  "/",
  //authJwt,
  AnimalsController.getListAnimals,
);
/**
 * Add Animal
 */
routes.post(
  "/",
  authJwt,
  upload.any(),
  celebrate(AnimalsController.validation.create),
  AnimalsController.create,
);

/**
 * Update Animal By ID
 */
routes.patch(
  "/:id",
  authJwt,
  upload.any(),
  celebrate(AnimalsController.validation.update),
  AnimalsController.update,
);

/**
 * Delete Animal By ID
 */
routes.delete(
  "/:id",
  authJwt,
  celebrate({
    params: {
      id: Joi.number().positive().required(),
    },
  }),
  AnimalsController.destroy,
);

/**
 * Increment views
 */
routes.post("/incrementViews", AnimalsController.incrementViews);
export default routes;
