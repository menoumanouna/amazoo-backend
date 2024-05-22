import express from "express";
import HTTPStatus from "http-status";
import { errors } from "celebrate";
import APIError from "../services/error";
// Middlewares
import logErrorService from "../services/log";
import AuthRoutes from "./auth";
import UsersRoutes from "./users";
import ServicesRoutes from "./services";
import HabitatsRoutes from "./habitats";
import Animalsoutes from "./animals";
import ReportsRoutes from "./reports";
import CommentAnimalsRoutes from "./comment-animal";
import CommentNourrituresRoutes from "./comment-nourriture";
import NourrituresRoutes from "./nourriture";
import ImageRoutes from "./images";
import EmailRoutes from "./email";

const routes = express.Router();

routes.use("/auth", AuthRoutes);
routes.use("/users", UsersRoutes);
routes.use("/services", ServicesRoutes);
routes.use("/services", ServicesRoutes);
routes.use("/habitats", HabitatsRoutes);
routes.use("/animals", Animalsoutes);
routes.use("/reports", ReportsRoutes);
routes.use("/comment-animal", CommentAnimalsRoutes);
routes.use("/comment-nourriture", CommentNourrituresRoutes);
routes.use("/nourritures", NourrituresRoutes);
routes.use("/images", ImageRoutes);
routes.use("/email", EmailRoutes);

routes.all("*", (req, res, next) =>
  next(new APIError("Not Found!", HTTPStatus.NOT_FOUND, true)),
);

routes.use(logErrorService);

routes.use(errors());

export default routes;
