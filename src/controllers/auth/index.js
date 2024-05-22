import HTTPStatus from "http-status";
// models
import passwordHash from "password-hash";
import jwt from "jsonwebtoken";
import { Joi } from "celebrate";
// helpers
import {
  Error,
  formatJSONResponse,
  sendMail,
  Success,
} from "../../utils/helpres";
import APIError from "../../services/error";
import config from "../../../database/config";
import db from "../../models";
import { validationBodyResetPassword } from "../../utils/validation";
import { filteredBody } from "../../utils/filteredBody";
import randomstring from "randomstring";
import models from "../../models";
import { getUserById } from "../../models/user";

const requestWhiteList = {
  resetPassword: Object.keys(validationBodyResetPassword),
};

export const validation = {
  resetPassword: {
    body: Joi.object(validationBodyResetPassword),
  },
  login: {
    body: {
      username: Joi.string()
        .email({
          minDomainSegments: 2,
        })
        .required(),
      password: Joi.string()
        .min(8)
        .max(20)
        .regex(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})"))
        .required(),
    },
  },
  refreshToken: {
    body: {
      token: Joi.string().required(),
    },
  },
};

export async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    const user = await db.utilisateur.findOne({
      attributes: ["password", "id", "username", "type"],
      where: { username },
    });
    if (!user) {
      throw new APIError(
        HTTPStatus.UNAUTHORIZED,
        Error,
        "Informations d'identification incorrectes",
      );
    } else {
      //if (user.status === 'pending' || user.status === 'pending') {
      if (passwordHash.verify(password, user.password)) {
        const token = jwt.sign(
          {
            id: user.id,
            username,
            type: user.type,
          },
          config.JWT_SECRET,
          { expiresIn: config.JWT_EXPIRATION },
        );
        let account;
        account = await getUserById(user.id);
        return res.status(HTTPStatus.OK).json(
          formatJSONResponse(HTTPStatus.OK, Success, "S'identifier", {
            token,
            account,
          }),
        );
      } else {
        throw new APIError(
          HTTPStatus.UNAUTHORIZED,
          Error,
          "Informations d'identification incorrectes",
        );
      }
    }
  } catch (err) {
    err.status = HTTPStatus.UNAUTHORIZED;
    return next(err);
  }
}

export async function refreshToken(req, res, next) {
  try {
    const decoded = jwt.verify(req.body.token, config.JWT_SECRET, {
      ignoreExpiration: true, //handled by OAuth2 server implementation
    });
    if (decoded.username) {
      const account = await db.utilisateur.findOne({
        attributes: ["id", "username", "type"],
        where: { email: decoded.email },
      });

      const token = jwt.sign(
        {
          id: account.id,
          username: account.username,
          type: account.type,
        },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRATION },
      );

      return res.status(HTTPStatus.OK).json(
        formatJSONResponse(HTTPStatus.OK, Success, "", {
          token,
          account,
        }),
      );
    }
  } catch (err) {
    err.status = HTTPStatus.BAD_REQUEST;
    return next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const { user } = req;
    let account;
    account = await getUserById(user.id);
    return res.status(HTTPStatus.OK).json(account);
  } catch (err) {
    err.status = HTTPStatus.BAD_REQUEST;
    return next(err);
  }
}

/**
 * Verification Url
 */
// eslint-disable-next-line consistent-return
export async function verification(req, res, next) {
  try {
    const { id, code } = req.params;
    const user = await db.utilisateur.findOne({
      attributes: ["type"],
      where: { verificationCode: code, id },
    });
    if (!user) {
      res.redirect(`http://localhost:3000/auth/login?code=2`);
    }
    if (user.status === "accepted") {
      res.redirect(`https://localhost:3000/auth/login?code=1`);
    }
  } catch (err) {
    err.status = HTTPStatus.BAD_REQUEST;
    return next(err);
  }
}

export async function findUserByEmail(req, res, next) {
  try {
    let result;
    const { username } = req.body;
    // Get User By Email
    const userInfo = await db.utilisateur.findOne({
      attributes: ["id", "username"],
      where: { username },
    });
    if (!userInfo)
      throw new APIError(
        HTTPStatus.BAD_REQUEST,
        Error,
        "Compte non trouvé! Veuillez vérifier votre adresse e-mail.",
      );
    else {
      const code = randomstring.generate({
        length: 6,
        charset: "numeric",
      });
      await db.utilisateur.update(
        {
          password_reinit_code: code,
        },
        { where: { id: userInfo.id } },
      );
      const send = await sendMail({
        from: "",
        to: [userInfo.email],
        subject: "Mot de passe oublié ",
        type: "pwd",
        locals: {
          name: `Bonjour`,
          code,
        },
        attachments: "",
      });
      if (send) {
        await userInfo.update({
          passwordCode: code,
        });
        return res
          .status(HTTPStatus.CREATED)
          .json(
            formatJSONResponse(
              HTTPStatus.CREATED,
              Success,
              "E-mail a été envoyé",
            ),
          );
      } else {
        throw new APIError(
          HTTPStatus.BAD_REQUEST,
          true,
          "Vérifiez votre adresse e-mail",
        );
      }
    }
  } catch (err) {
    err.status = HTTPStatus.BAD_REQUEST;
    return next(err);
  }
}
/**
 *Reset Password
 */
export async function resetPassword(req, res, next) {
  try {
    const data = filteredBody(req.body, requestWhiteList.resetPassword);
    // Get User By Email
    const userExist = await db.utilisateur.findOne({
      where: { passwordCode: data.code },
    });
    if (!userExist) {
      throw new APIError(HTTPStatus.BAD_REQUEST, Error, "Compte non trouvé");
    }
    await db.sequelize.transaction(async (transaction) => {
      let password;
      if (data.password) password = passwordHash.generate(data.password);
      const resultUser = await db.utilisateur.update(
        { password },
        { where: { id: userExist.id } },
        { transaction },
      );
      if (!resultUser) {
        throw new APIError(
          HTTPStatus.BAD_REQUEST,
          Error,
          "Mot de passe non modifié !",
        );
      }
    });

    return res
      .status(HTTPStatus.CREATED)
      .json(
        formatJSONResponse(
          HTTPStatus.CREATED,
          Success,
          "Le mot de passe a été modifié avec succés",
          true,
        ),
      );
  } catch (err) {
    err.status = HTTPStatus.BAD_REQUEST;
    return next(err);
  }
}
