const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const swagger = require("./swagger");

require("dotenv").config();

const app = express();

// parse incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api-docs", swagger.serve, swagger.setup);
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
