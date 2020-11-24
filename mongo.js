const mongoose= require("mongoose");

const DB_NAME = "phonebook";
const DB_USER = "dbworker";
const DB_PASS = process.argv[2];

const DB_URL = `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.bxdne.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`

function connectDB() {
  mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true });

  const dbCardSchema = new mongoose.Schema({
    name: String,
    phone: String
  });

  return mongoose.model("Person", dbCardSchema);
}

function getCardsFromDB() {
  connectDB().find({}).then(
    res => {
      if (res.length === 0) console.log("phonebook is empty!");
      else {
        console.log("phonebook:");
        res.forEach(card => console.log(card.name + " " + card.phone));
      }
      mongoose.connection.close();
    }
  )
}

function saveCardToDB(newName, newPhone) {
  let dbCards = connectDB();

  new dbCards({
    name: newName,
    phone: newPhone
  }).save().then(() => {
    mongoose.connection.close();
    console.log("Ok!");
  });
}

switch (process.argv.length) {
case 3:
  getCardsFromDB();
  break;
case 5:
  saveCardToDB(process.argv[3], process.argv[4]);
  break;
default:
  console.log(
    `Usage: 
          Save card: node mongo.js your_db_pass name_to_add phone_to_add 
          List cards: node mongo.js your_db_pass`);
  process.exit();
}
