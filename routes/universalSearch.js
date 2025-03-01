// backend/routes/universalSearch.js
require('dotenv').config();
const express = require('express');
const db = require('../config/database'); 
const verifyJwt = require('../middleware/auth'); // or your JWT middleware

const router = express.Router();

/**
 * GET /api/search?q=someValue
 * Scans every table & column in your DB for partial matches of 'someValue',
 * then FLATTENS the results so each row is its own object.
 */
router.get('/search', verifyJwt, async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: "Missing query parameter 'q'." });
  }

  try {
    // 1) Fetch all columns for the database from your .env
    const [columns] = await db.query(`
      SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE
      FROM information_schema.columns
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME, COLUMN_NAME
    `, [process.env.DB_NAME]);

    // Arrays of data types to handle
    const textTypes = ['char','varchar','text','tinytext','mediumtext','longtext','enum','set'];
    const numericTypes = ['int','bigint','smallint','mediumint','tinyint','decimal','float','double'];

    const likeTerm = `%${q}%`;
    const resultsGrouped = [];

    // 2) Loop over each column, building a query if it's text or numeric
    for (const col of columns) {
      const { TABLE_NAME, COLUMN_NAME, DATA_TYPE } = col;
      const dataTypeLower = DATA_TYPE.toLowerCase();

      let sql = null;
      if (textTypes.includes(dataTypeLower)) {
        // Text column => direct LIKE
        sql = `SELECT * FROM \`${TABLE_NAME}\` WHERE \`${COLUMN_NAME}\` LIKE ?`;
      } else if (numericTypes.includes(dataTypeLower)) {
        // Numeric column => CAST to CHAR for partial match
        sql = `SELECT * FROM \`${TABLE_NAME}\` WHERE CAST(\`${COLUMN_NAME}\` AS CHAR) LIKE ?`;
      }
      // Skip columns with other data types (blob, date, etc.) unless you want to include them

      if (!sql) continue;

      const [rows] = await db.query(sql, [likeTerm]);
      if (rows.length > 0) {
        resultsGrouped.push({
          tableName: TABLE_NAME,
          columnName: COLUMN_NAME,
          dataType: DATA_TYPE,
          matches: rows
        });
      }
    }

    // 3) Flatten the results so each row is a separate object
    //    Each match object: { tableName, columnName, dataType, row: { ... } }
    const flattened = [];
    for (const group of resultsGrouped) {
      for (const row of group.matches) {
        flattened.push({
          tableName: group.tableName,
          columnName: group.columnName,
          dataType: group.dataType,
          row: row
        });
      }
    }

    // 4) Return flattened results
    return res.json(flattened);

  } catch (err) {
    console.error("Universal search error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
