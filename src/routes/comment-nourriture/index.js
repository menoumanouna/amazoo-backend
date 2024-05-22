/**
 * CommentNourriture Routes
 */

import { Router } from "express";

import { authJwt } from "../../services/auth";
import * as CommentNourrituresController from "../../controllers/comment-nourriture";
import { celebrate, Joi } from "celebrate";

const routes = new Router();

/**
 * Get List Of CommentNourriture
 */
routes.get("/", authJwt, CommentNourrituresController.getListCommentNourriture);
/**
 * Add CommentNourriture
 */
routes.post(
  "/",
  authJwt,
  celebrate(CommentNourrituresController.validation.create),
  CommentNourrituresController.create,
);

/**
 * Update CommentNourriture By ID
 */
routes.patch(
  "/:id",
  authJwt,
  celebrate(CommentNourrituresController.validation.update),
  CommentNourrituresController.update,
);

/**
 * Delete CommentNourriture By ID
 */
routes.delete(
  "/:id",
  authJwt,
  celebrate({
    params: {
      id: Joi.number().positive().required(),
    },
  }),
  CommentNourrituresController.destroy,
);
export default routes;
