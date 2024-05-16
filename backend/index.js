const express = require("express");
//const cors = require("cors");
//require("dotenv").config();
const app = express();
app.use(express.json());
//app.use(cors());

const port = 5001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
