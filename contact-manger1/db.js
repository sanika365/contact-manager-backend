const mongoose = require("mongoose");

const mongoURI = "mongodb://127.0.0.1:27017/?directConnection=true";

const connectToMongo = () => {
  mongoose
    .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("connected to DB!"))
    .catch((error) => console.log(error));
};

module.exports = connectToMongo;
