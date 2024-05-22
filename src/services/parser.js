/* @flow */

import _ from "lodash";
import sequelize from "sequelize";

import { Attribute } from "sequelize";

const { Op } = sequelize;

const operators = {
  gte: Op.gte,
  in: Op.in,
  like: Op.like,
  between: Op.between,
};

function parseOperator(value) {
  if (operators[value]) return operators[value];
  throw Error(`Cannot use '${value}' as operator`);
}

function parseString(value) {
  if (value && !Array.isArray(value)) {
    return value.split(",");
  }

  return value;
}

function parseJson(value) {
  try {
    return JSON.parse(Array.isArray(value) ? value[0] : value);
  } catch (error) {
    return parseString(value);
  }
}

function parseInteger(value) {
  let intValue = parseInt(value, 10);

  if (_.isNaN(intValue)) {
    intValue = undefined;
  }

  return intValue;
}

function parseSort(value) {
  let sort;

  if (value) {
    const keys = parseString(value);

    sort = _.map(keys, (key) => {
      if (key.indexOf("-") === 0) {
        return [key.substr(1), "DESC"];
      }
      return [key, "ASC"];
    });
  }

  return sort;
}

export function parse(params, rawAttributes) {
  const keywords = ["fields", "limit", "offset", "sort"];
  const options = {
    where: {},
  };
  const fields = parseString(params.fields);
  const limit = parseInteger(params.limit);
  const offset = parseInteger(params.offset);
  const order = parseSort(params.sort);
  if (fields) options.attributes = fields;
  if (limit && limit > 0) options.limit = limit;
  if (offset && offset >= 0) options.offset = offset;
  if (order) options.order = order;

  const where = [];
  Object.keys(params)
    .filter((value) => !keywords.includes(value))
    .forEach((keys) => {
      const value = parseJson(params[keys]);
      if (typeof value === "object" && !Array.isArray(value)) {
        // Change string operator to sequelize operator
        Object.keys(value).forEach((operator) => {
          value[parseOperator(operator)] = value[operator];
          delete value[operator];
        });
      }

      const keysArray = keys.split(",");
      if (keysArray.length > 1) {
        const whereWithOr = [];
        keysArray.forEach((key) => {
          if (Object.prototype.hasOwnProperty.call(rawAttributes, key)) {
            whereWithOr.push({
              [key]: value,
            });
          }
        });
        where.push({
          // $FlowFixMe
          [Op.or]: whereWithOr,
        });
      } else if (Object.prototype.hasOwnProperty.call(rawAttributes, keys)) {
        where.push({
          [keys]: value,
        });
      }
    });

  options.where = {
    // $FlowFixMe
    [Op.and]: where,
  };

  return options;
}
