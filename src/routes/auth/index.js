/**
 * Auth Routes
 */

import { Router } from "express";
import * as AuthController from "../../controllers/auth/index";
import { celebrate, Joi } from "celebrate";
import { authJwt } from "../../services/auth";
const routes = new Router();

/**
 * Login JWT
 */
routes.post(
  "/login",
  celebrate(AuthController.validation.login),
  AuthController.login,
);
/**
 * Get Me
 */
routes.get("/getMe", authJwt, AuthController.getMe);

/**
 * Refresh Token
 */
routes.post(
  "/refreshToken",
  celebrate(AuthController.validation.refreshToken),
  AuthController.refreshToken,
);

/**
 * Verification Account
 */
routes.get(
  "/verification/:id/:code",
  celebrate({
    params: {
      id: Joi.string().required(),
      code: Joi.string().required(),
    },
  }),
  AuthController.verification,
);
/**
 * Get User By Email
 */
routes.post(
  "/reset/send-code",
  celebrate({
    body: {
      email: Joi.string()
        .email({
          minDomainSegments: 2,
          //tlds: { allow: ['com', 'net', 'tn', 'fr'] },
        })
        .required(),
    },
  }),
  AuthController.findUserByEmail,
);

/**
 * Reset Password
 */
routes.post(
  "/reset/password",
  celebrate(AuthController.validation.resetPassword),
  AuthController.resetPassword,
);

export default routes;
