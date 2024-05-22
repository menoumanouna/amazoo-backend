/**
 * Habitats Routes
 */

import { Router } from "express";

import { authJwt } from "../../services/auth";
import * as HabitatsController from "../../controllers/habitats";
import { celebrate, Joi } from "celebrate";
import multer from "multer";
const upload = multer({ dest: "/tmp" });

const routes = new Router();

/**
 * Get List Of Habitats
 */
routes.get(
  "/",
  //authJwt,
  HabitatsController.getListHabitats,
);
/**
 * Add Habitat
 */
routes.post(
  "/",
  authJwt,
  upload.any(),
  celebrate(HabitatsController.validation.create),
  HabitatsController.create,
);

/**
 * Update Habitat By ID
 */
routes.patch(
  "/:id",
  authJwt,
  upload.any(),
  celebrate(HabitatsController.validation.update),
  HabitatsController.update,
);

/**
 * Delete Habitat By ID
 */
routes.delete(
  "/:id",
  authJwt,
  celebrate({
    params: {
      id: Joi.number().positive().required(),
    },
  }),
  HabitatsController.destroy,
);
export default routes;
