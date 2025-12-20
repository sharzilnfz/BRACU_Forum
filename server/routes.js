const client = require("./supabase");
const express = require("express");
const router = express.Router();
router.get("/", (req, res) => {
  res.end("Heloo");
});
module.exports = router;
