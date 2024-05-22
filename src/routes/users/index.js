/**
 * Users Routes
 */

import { Router } from "express";
import * as UserController from "../../controllers/users/index";
import { celebrate, Joi } from "celebrate";
import { update } from "../../controllers/users/index";
import { authJwt } from "../../services/auth";
const routes = new Router();

/**
 * Get users
 */
routes.get("/", authJwt, UserController.getListUsers);
/**
 * Create user
 */
routes.post(
  "/",
  celebrate(UserController.validation.create),
  UserController.create,
);
/**
 * Update user
 */
routes.patch(
  "/:id",
  authJwt,
  celebrate(UserController.validation.update),
  UserController.update,
);
/**
 * Delete user
 */
routes.delete(
  "/:id",
  authJwt,
  celebrate({
    params: {
      id: Joi.number().positive().required(),
    },
  }),
  UserController.destroy,
);
export default routes;
