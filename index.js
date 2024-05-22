import express from "express";
import bodyParser from "body-parser";
// This will be our application entry. We'll setup our server here.
import http from "http";
import session from "express-session";
import passport from "passport";
import { logger } from "./src/services/logger";
import ApiRoutes from "./src/routes";
import cors from "cors";
import * as path from "path";

// Set up the express app
const app = express();
app.use(cors());

const server = http.createServer(app);
app.use(
  session({
    key: "test",
    proxy: "true",
    accountId: null,
    secret: "keyboard cat",
  }),
);

// Log requests to the console.
// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());

app.use("/api", ApiRoutes);
app.use("/public", express.static(path.resolve(process.cwd(), "public")));

app.get("/fail", (req, res) => {
  res.status(200).send({
    message: "Error",
  });
});

const port = parseInt(process.env.PORT, 10) || 4000;
app.set("port", port);

server.listen(port, (err) => {
  if (err) {
    logger.error("Cannot run!");
  } else {
    logger.info(new Date());
    logger.info(`
          Yep this is working 🍺
          App listen on port: ${port} 🍕
          Env: ${process.env.NODE_ENV || "none"} 🦄
        `);
  }
});

export default app;
