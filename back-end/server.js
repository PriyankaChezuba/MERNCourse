const express = require("express");
const app = express();
const connectDB = require("./config/db");

connectDB();

const PORT = process.env.port || 5000;

app.use(express.json());

app.use("/api/users", require("./api/users"));
app.use("/api/auth", require("./api/auth"));
app.use("/api/profile", require("./api/profile"));
app.use("/api/post", require("./api/posts"));

app.listen(PORT, () => {
  console.log("Server started");
});
