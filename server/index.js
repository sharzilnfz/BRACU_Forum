require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 4000;
//MIDDLEWARES
const userRouter = require("./routes");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use("/", userRouter);

//SERVER STARTER
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
