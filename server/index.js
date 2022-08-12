const express = require("express");

const PORT = process.env.PORT || 3001;

const app = express();

const dbConnection = require('../database');
const controllers = require('../database/controllers/userData.js');

console.log(controllers)

app.use(express.json())

app.get("/users", (req, res) => {
  // res.json({ message: "Hello from server!" });
  console.log(req.query)
  res.send('hello')
  controllers.findUserData(req.query.email)
    .then( (response) => {
      console.log(response)
    })
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});