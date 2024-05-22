import HTTPStatus from "http-status";
// models
import db from "../../models";

// helpers
import {
  Error,
  formatJSONResponse,
  hasRole,
  Success,
} from "../../utils/helpres";
import APIError from "../../services/error";

/**
 * Destroy Image
 * */
export async function destroy(req, res, next) {
  try {
    const { user } = req;
    if (!hasRole(user, ["EMPLOYE", "ADMIN"])) {
      throw new APIError(HTTPStatus.NO_CONTENT, "error", "Non autorisé");
    }
    const { id } = req.params;
    const existHabitat = await db.image.count({
      where: { id },
    });
    if (existHabitat === 0) {
      throw new APIError(HTTPStatus.BAD_REQUEST, Error, "Image n'existe pas");
    }
    let result;
    await db.sequelize.transaction(async (transaction) => {
      result = await db.image.destroy({
        where: { id },
        transaction,
      });
      if (!result) {
        throw new APIError(HTTPStatus.BAD_REQUEST, Error, "Image non supprimé");
      }
    });
    return res
      .status(HTTPStatus.OK)
      .json(
        formatJSONResponse(
          HTTPStatus.CREATED,
          Success,
          "Image supprimé avec succés",
        ),
      );
  } catch (err) {
    err.status = HTTPStatus.INTERNAL_SERVER_ERROR;
    return next(err);
  }
}
