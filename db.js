const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const DB_URL = process.env.MONGO_DB_URL;

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}).then(() => {
  console.log("connected to MongoDB")
}).catch((error) => {
  console.log("error connecting to MongoDB:", error.message)
})

const dbCardSchema = new mongoose.Schema({
  name: {type: String, required: true, unique: true, minlength: 3},
  phone: {type: String, required: true, minlength: 8}
});

dbCardSchema.plugin(uniqueValidator);

dbCardSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model("Person", dbCardSchema);

