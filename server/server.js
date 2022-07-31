// local database
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("db.json");
const db = low(adapter);

db.defaults({ results: [] }).write();

const secret = process.env.SECRET;
if (secret === undefined) console.warn("The secret has not been defined!");

// express server
const express = require("express");
const app = express();
app.use(express.json());

app.use("/", express.static(__dirname + "/public"));

app.set("port", process.env.PORT || 3000);

app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

// get bandwidth test results for graphing here
app.get("/read", function(request, response) {
  const data = db.get("results").value();
  const preparedDl = data.map(s => {
    return { x: s.date, y: Number(s.dl).toFixed(3) };
  });
  const preparedUl = data.map(s => {                                                                                                                                         return { x: s.date, y: Number(s.ul).toFixed(3) };                                                                                                                     
  });
  const trimmedDl = preparedDl.slice(Math.max(preparedDl.length - 48, 0));
  const trimmedUl = preparedUl.slice(Math.max(preparedUl.length - 48, 0));
  
  response.send({dl: trimmedDl, ul: trimmedUl}); // send a slice of results
});

// send bandwidth test results here
app.post("/save", function(request, response) {
  // not secure against timing-based attacks!
  if (request.body.pw !== secret) {
    return response.status(400).send("Bad pw");
  }
  db.get("results")
    .push({
      dl: request.body.dl,
      ul: request.body.ul,
      unit: request.body.units,
      date: request.body.date * 1000
    }) // correct to JS time
    .write();
  response.send("OK");
});

// listen for requests :)
const listener = app.listen(app.get("port"), function() {
  console.log("Your app is listening on port " + listener.address().port);
});
