const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();

// parse incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// api routers
app.use(require("./route/deposit"));

// start the app after database connection is established
mongoose
  .connect(process.env.db)
  .then(() => {
    app.listen(
      process.env.port,
      console.log(`app started on port: ${process.env.port}`)
    );
  })
  .catch((error) => {
    console.log(error);
  });
