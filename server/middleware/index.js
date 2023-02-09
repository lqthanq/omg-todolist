const jwt = require("jsonwebtoken");
const moment = require("moment");
const DB = require("../database");

const auth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) throw new Error("Invalid token.");

    const [, token] = authorization.split(" ");
    if (!token) {
      throw new Error("Invalid token");
    }

    const decode = jwt.verify(token, process.env.SECRET_TOKEN);
    if (moment().isAfter(moment(decode.expiredAt))) {
      throw new Error("Invalid token.");
    }

    let { userId } = decode;
    const { rows } = await DB.query(
      `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [userId]
    );

    if (rows.length === 0) {
      throw new Error("User cannot found.");
    }

    const { rows: tokens } = await DB.query(
      `SELECT * FROM tokens WHERE user_id = $1 AND token = $2`,
      [userId, token]
    );

    if (tokens.length === 0) throw new Error("Token cannot found.");

    req.user = rows[0];
    next();
  } catch (err) {
    return res.send({
      data: null,
      error: err.toString(),
    });
  }
};

module.exports = {
  auth,
};
