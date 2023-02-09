var express = require("express");
var router = express.Router();
const DB = require("../database");
const bcrypt = require("bcrypt");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const { auth } = require("../middleware");

/** Register */
router.post("/", async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const ob = {
      email,
      password,
      username,
    };

    for (let [key, value] of Object.entries(ob)) {
      if (!value) {
        return res.send({
          data: null,
          error: `Invalid field: ${key}`,
        });
      }
    }

    const { rows } = await DB.query(
      `SELECT * FROM users WHERE deleted_at IS NULL AND LOWER(email) = $1`,
      [email.toLowerCase()]
    );

    if (rows.length > 0) {
      return res.send({
        data: null,
        error: "User is already exists.",
      });
    }

    const psHash = await bcrypt.hash(password, 10);
    const { rows: userRows } = await DB.query(
      `INSERT INTO users(created_at, updated_at, email, password, username) VALUES(NOW(), NOW(), $1, $2, $3) RETURNING *`,
      [email, psHash, username]
    );

    const newUser = userRows[0];
    return res.send({
      data: newUser,
      error: null,
    });
  } catch (error) {
    res.send({
      data: null,
      error: error.toString(),
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const ob = { email, password };
    for (let [key, value] of Object.entries(ob)) {
      if (!value) {
        throw new Error("Invalid field: " + key);
      }
    }
    const { rows } = await DB.query(
      `SELECT * FROM users WHERE deleted_at IS NULL AND email = '${email}'`
    );

    if (rows.length === 0)
      return res.send({
        data: null,
        error: "User cannot found.",
      });

    const user = rows[0];
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      res.send({
        data: null,
        error: "Wrong password.",
      });
    }

    await DB.query(
      `DELETE FROM tokens WHERE user_id = '${user.id}' AND expire_at < NOW() RETURNING *`
    );

    const tokenInfo = {
      userId: user.id,
      expiredAd: moment().add(7, "days"),
    };

    const token = jwt.sign(tokenInfo, process.env.SECRET_TOKEN, {
      expiresIn: "7 days",
    });

    await DB.query(
      `INSERT INTO tokens(created_at, user_id, token, expire_at) VALUES (NOW(), $1, $2, $3) RETURNING *`,
      [user.id, token, tokenInfo.expiredAd]
    );

    const { password: pw, ...userRest } = user;
    return res.send({
      data: {
        user: userRest,
        token,
      },
      error: null,
    });
  } catch (error) {
    res.send({
      data: null,
      error: error.message,
    });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.send({
        data: null,
        error: "User ID is required.",
      });
    }

    const { email, username } = req.body;
    const ob = { email, username };
    for (let [key, value] of Object.entries(ob)) {
      if (!value) {
        return res.send({
          data: null,
          error: `Invalid field: ${key}.`,
        });
      }
    }

    const { rows: eRows } = await DB.query(
      `SELECT * FROM users WHERE deleted_at IS NULL AND id != $1 AND email = $2`,
      [id, email]
    );

    if (eRows?.length > 0)
      return res.send({
        data: null,
        error: "Email is already in use.",
      });

    const { rows } = await DB.query(
      `SELECT * FROM users WHERE deleted_at IS NULL AND id = ${id}`
    );

    if (rows.length === 0)
      return res.send({
        data: null,
        error: "User cannot found.",
      });

    const { rows: uRows } = await DB.query(
      `UPDATE users SET updated_at = NOW(), email = $2, username = $3 WHERE id = $1 RETURNING *`,
      [id, email, username]
    );

    const userUpdated = uRows[0];

    res.send({
      data: userUpdated,
      error: null,
    });
  } catch (err) {
    res.send({
      data: null,
      error: error.toString(),
    });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.send({
        data: null,
        error: "User ID is required.",
      });
    }

    const { rows } = await DB.query(
      `SELECT * FROM users WHERE deleted_at IS NULL AND id = $1`,
      [id]
    );

    if (rows.length === 0)
      return res.send({
        data: null,
        error: "User connot found.",
      });

    const { rows: uRows } = await DB.query(
      `UPDATE users SET deleted_at = NOW() WHERE id = ${id} RETURNING *`
    );

    if (uRows.length === 0)
      return res.send({
        data: null,
        error: "Cannot delete this user.",
      });

    return res.send({
      data: true,
      error: null,
    });
  } catch (error) {
    return res.send({
      data: null,
      error: error.toString(),
    });
  }
});

/* GET users listing. */
router.get("/", auth, async (req, res) => {
  try {
    const { rows } = await DB.query(
      `SELECT * FROM users WHERE deleted_at IS NULL`
    );

    if (rows.length === 0) throw new Error("User cannot found.");

    return res.send({
      data: rows,
      error: null,
    });
  } catch (err) {
    res.send({
      data: null,
      error: err.message,
    });
  }
});
router.get("/:id", auth, async function (req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      res.send({
        data: null,
        error: "User ID is required.",
      });
    }

    const { rows } = await DB.query(
      `SELECT * FROM users WHERE deleted_at IS NULL AND id = ${id}`
    );

    if (rows.length === 0)
      return res.send({
        data: null,
        error: "User cannot found.",
      });

    return res.send({
      data: rows[0],
      error: null,
    });
  } catch (error) {
    res.send({
      data: null,
      error: error.toString(),
    });
  }
});

module.exports = router;
