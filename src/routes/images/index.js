/**
 * Image Routes
 */

import { Router } from "express";

import { authJwt } from "../../services/auth";
import * as ImagesController from "../../controllers/images";
import { celebrate, Joi } from "celebrate";

const routes = new Router();

/**
 * Delete Image By ID
 */
routes.delete(
  "/:id",
  authJwt,
  celebrate({
    params: {
      id: Joi.number().positive().required(),
    },
  }),
  ImagesController.destroy,
);
export default routes;
