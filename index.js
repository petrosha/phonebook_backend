require("dotenv").config();

const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

const dbModel = require("./db.js");

morgan.token("my_post", (req) => {
  if (req.method === "POST") return JSON.stringify(req.body);
  return "";
});

app.use(cors());
app.use(express.static("build"));

app.use(morgan(":method :url :status :res[content-length] - :response-time ms :my_post"));

// app.get('/', (request, response) => {
//     response.send('<h1>Hello World!</h1>')
// })

app.get("/api/persons", (request, response) => {
  dbModel.find({}).then(dbList => { response.json(dbList) })
})

app.get("/info", (request, response) => {
  dbModel.find({}).then(dbList => {
    response.send(
      `<p>Phonebook has info 
            for ${dbList.length} people!</p>
            <p>${Date()}</p>`);
  });
})

app.get("/api/persons/:id", (request, response, next) => {
  dbModel.findById(request.params.id)
    .then(dbCard => {
      if (dbCard) response.json(dbCard);
      else response.status(404).end();
    })
    .catch(error => next(error))
})

app.delete("/api/persons/:id", (request, response, next) => {
  dbModel.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put("/api/persons/:id", express.json(), (request, response, next) => {


  const body = request.body;
  console.log(request.params.id);
  console.log(request.body);

  const person = {
    name: body.name,
    phone: body.phone
  }

  dbModel.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedCard => {
      response.json(updatedCard)
    })
    .catch(error => next(error))
})

app.post("/api/persons", express.json(), (request, response, next) => {
  const body = request.body;
  // console.log(request);
  if (!body.name || !body.phone) {
    return response.status(400).json({
      error: "Name or phone missing"
    })
  }

  const person = new dbModel({
    name: body.name,
    phone: body.phone
  })

  person.save().then(savedCard => {
    console.log("Saved:" + savedCard);
    response.json(savedCard);
  })
    .catch(error => next(error))
})

// handler of requests with unknown endpoint
app.use((request, response) => {
  response.status(404).send({ error: "unknown endpoint" })
});

app.use((error, request, response, next) => {
  console.error(error.message);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" })
  }
  else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message })
  }
  next(error)
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
