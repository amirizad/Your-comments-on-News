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
db.on("error", (error) => {
  console.log("My Mongoose Error: ", error);
});

db.once("openUri", () => {
  console.log("Mongoose connection successful.");
});

app.get("/articles", (req, res) => {
  Article.find({}, (error, doc) => {
    if (error) {
      res.send(error);
    }
    else {
      res.json(doc);
    }
  });
});

app.get('/scrape', (req, res) => {
  request("http://www.latimes.com/local/", (error, response, html) => {
    var $ = cheerio.load(html);
    var counter = 0;
    $('li.trb_outfit_group_list_item').each(function(i, element){
      counter += 1;
      if ( counter > 8 ) {
        var result = {};
        result.title = $(this).find("a.trb_outfit_relatedListTitle_a").text();
        var dateTime = $(this).find("span.trb_outfit_categorySectionHeading_date").attr('data-dt');
        result.dt = dateTime ? dateTime : '---';
        result.link = 'http://www.latimes.com' + $(this).find("a.trb_outfit_relatedListTitle_a").attr("href");
        var img = $(this).find("img.trb_outfit_group_list_item_img").attr("data-baseurl")
        result.image = img ? img + '/200/200x113' : 'assets/images/la-times.jpg';
        var brief = $(this).find("p.trb_outfit_group_list_item_brief").text();
        result.brief = brief ? brief : result.title;
        var entry = new Article(result);
        entry.save((err, doc) => {
          if (err) {
            console.log(err);
          }
          else {
            console.log(doc);
          }
        });
      };
    })
  })
  res.send('completed');
});

app.post("/articles/save/:id", (req, res) => {
  var id = req.params.id;
  Article.update({_id: id},{
    $set: {saved: true}
  },(err, doc) => {
      if (err) {
        console.log(err);
      }
      else {
        Article.find({}, (error, doc) => {
          if (error) {
            res.send(error);
          }
          else {
            res.json(doc);
          }
        });
      }
    }
  );
});

app.post("/articles/delete/:id", (req, res) => {
  var id = req.params.id;
  Article.update({_id: id},{
    $set: {saved: false}
  },(err, doc) => {
      if (err) {
        console.log(err);
      }
      else {
        Article.find({}, (error, doc) => {
          if (error) {
            res.send(error);
          }
          else {
            res.json(doc);
          }
        });
      }
    }
  );
});

app.get('/articles/notes/:id', (req, res) => {
  var id = req.params.id;
  Article.findOne({"_id":id})
  .populate("note")
  .exec( (err,doc) => {
    if(err){
      console.log(err);
    } else {
      console.log(doc);
      res.json(doc);
    };
  });
});


app.post('/articles/notes/:id?', (req, res) => {
  var id = req.params.id;
  var newNote = new Note(req.body);
  newNote.save((error, doc) => {
    if (error) {
      res.send(error);
    }
    else {
      Article.findOneAndUpdate({ "_id": id }, {$push:{"note": doc._id}})
      .exec((err, doc) => {
        if (err) {
          console.log(err);
        }
        else {
          res.send(doc._id);
        }
      });
    }
  });
});

app.listen(PORT, () => {
  console.log("App running on port " + PORT);
});