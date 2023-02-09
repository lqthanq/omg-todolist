const express = require("express");
const { auth } = require("../middleware");
const DB = require("../database");

const router = express.Router();

router.post("/", auth, async function (req, res) {
  try {
    if (req.user == null) throw new Error("Invalid Token");
    const { content } = req.body;
    if (!content) {
      throw new Error("Invalid field: content");
    }

    const { rows } = await DB.query(
      `SELECT * FROM tasks WHERE deleted_at IS NULL AND LOWER(content) = $1`,
      [content.toLowerCase()]
    );

    if (rows.length > 0) throw new Error("Tasks is already exists.");

    const { rows: cRows } = await DB.query(
      `INSERT INTO tasks(created_at, updated_at, content, is_completed, author_id) VALUES(NOW(), NOW(), $1, $2, $3) RETURNING *`,
      [content, false, req.user.id]
    );

    if (cRows.length === 0) throw new Error("Cannot create new task.");
    return res.send({
      data: cRows[0],
      error: null,
    });
  } catch (err) {
    return res.send({
      data: null,
      error: err.message,
    });
  }
});

router.put("/:id", auth, async function (req, res) {
  try {
    if (req.user == null) throw new Error("Invalid token.");
    const { id } = req.params;
    if (!id) throw new Error("Task ID is required.");

    const { content, isCompleted } = req.body;
    const ob = { content, isCompleted };
    for (let [key, value] of Object.entries(ob)) {
      if (value == null || value === "")
        throw new Error("Invalid field: " + key);
    }

    const { rows } = await DB.query(
      `SELECT id FROM tasks WHERE deleted_at IS NULL AND id = $1 AND author_id = $2`,
      [id, req.user.id]
    );

    if (rows.length === 0) throw new Error("Cannot found task.");

    const { rows: uRows } = await DB.query(
      `UPDATE tasks SET updated_at = NOW(), content = $1, is_completed = $2 WHERE id = $3 RETURNING *`,
      [content, isCompleted, id]
    );

    if (uRows.length === 0) throw new Error("Cannot update this task.");

    return res.send({
      data: uRows[0],
      error: null,
    });
  } catch (err) {
    res.send({
      data: null,
      error: err.message,
    });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user == null) throw new Error("Invalid token.");
    const { id } = req.params;
    if (!id) throw new Error("Task ID is required.");

    const { rows } = await DB.query(
      `SELECT id FROM tasks WHERE deleted_at IS NULL AND id = $1 AND author_id = $2`,
      [id, req.user.id]
    );

    if (rows.length === 0) throw new Error("Cannot found task.");

    const { rows: uRows } = await DB.query(
      `UPDATE tasks SET deleted_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );

    if (uRows.length === 0) throw new Error("Cannot delete this task.");

    return res.send({
      data: true,
      error: null,
    });
  } catch (err) {
    return res.send({
      data: null,
      error: err.message,
    });
  }
});

//
router.get("/", auth, async (req, res) => {
  try {
    if (req.user == null) throw new Error("Invalid Token.");
    const { id } = req.user;
    const { rows } = await DB.query(
      `SELECT * FROM tasks WHERE deleted_at IS NULL AND author_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    if (rows.length === 0) throw new Error("Cannot found tasks.");
    return res.send({
      data: rows,
      error: null,
    });
  } catch (err) {
    return res.send({
      data: null,
      error: err.message,
    });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    if (req.user == null) throw new Error("Invalid Token.");
    const { id } = req.params;

    if (!id) throw new Error("Task ID is required.");
    const { rows } = await DB.query(
      `SELECT * FROM tasks WHERE deleted_at IS NULL AND id = $1 AND author_id = $2`,
      [id, req.user.id]
    );

    if (rows.length === 0) throw new Error("Cannot find task.");
    return res.send({
      data: rows[0],
      error: null,
    });
  } catch (err) {
    return res.send({
      data: null,
      error: err.message,
    });
  }
});

module.exports = router;
