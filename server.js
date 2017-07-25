var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

var request = require("request");
var cheerio = require("cheerio");

mongoose.Promise = Promise;

var app = express();
var PORT = process.env.PORT || 8080;

app.use(logger("dev"));

app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static("public"));

var databaseUri = 'mongodb://localhost/newsdb';

if (process.env.MONGODB_URI){
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect(databaseUri);
}

var db = mongoose.connection;
db.on("error", function(error) {
  console.log("My Mongoose Error: ", error);
});

db.once("openUri", function() {
  console.log("Mongoose connection successful.");
});

app.get('/scrape', function(req, res){
  request("http://www.latimes.com/local/", function(error, response, html) {
    var $ = cheerio.load(html);
    $('li.trb_outfit_group_list_item').each(function(i, element) {
      var result = {};
      result.title = $(this).find("a.trb_outfit_relatedListTitle_a").text();
      result.link = 'http://www.latimes.com' + $(this).find("a.trb_outfit_relatedListTitle_a").attr("href");
      var img = $(this).find("img.trb_outfit_group_list_item_img").attr("data-baseurl")
      result.image = img ? img + '/200/200x113' : 'assets/images/la-times.jpg';
      var brief = $(this).find("p.trb_outfit_group_list_item_brief").text();
      result.brief = brief ? brief : result.title;
      
      var entry = new Article(result);

      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          console.log(doc);
        }
      });
    });
  });
  res.send('completed');
});

app.get("/articles", function(req, res) {
  Article.find({}, function(error, doc) {
    if (error) {
      res.send(error);
    }
    else {
      res.json(doc);
    }
  });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT);
});