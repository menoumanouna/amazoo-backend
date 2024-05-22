/**
 * CommentAnimals Routes
 */

import { Router } from "express";

import { authJwt } from "../../services/auth";
import * as CommentAnimalsController from "../../controllers/comment-animal";
import { celebrate, Joi } from "celebrate";

const routes = new Router();

/**
 * Get List Of CommentAnimals
 */
routes.get("/", authJwt, CommentAnimalsController.getListCommentAnimals);
/**
 * Add CommentAnimal
 */
routes.post(
  "/",
  authJwt,
  celebrate(CommentAnimalsController.validation.create),
  CommentAnimalsController.create,
);

/**
 * Update CommentAnimal By ID
 */
routes.patch(
  "/:id",
  authJwt,
  celebrate(CommentAnimalsController.validation.update),
  CommentAnimalsController.update,
);

/**
 * Delete CommentAnimal By ID
 */
routes.delete(
  "/:id",
  authJwt,
  celebrate({
    params: {
      id: Joi.number().positive().required(),
    },
  }),
  CommentAnimalsController.destroy,
);
export default routes;
