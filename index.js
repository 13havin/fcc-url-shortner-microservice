require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const nanoid = require('nanoid');


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(express.urlencoded({ extended: true }));

app.set('trust proxy', true);

uri = process.env.MONGO_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, (error) => {
  console.log(error);
});

const urlSchema = mongoose.Schema({
  urlId: String,
  originalUrl: String
});

let UrlModel = mongoose.model('url_model', urlSchema);

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl", processUrl)
  .get('/api/shorturl/:path', redirectUrl);

function processUrl(req, res) {
  const url = req.body.url;
  if (urlChecker(url)) {
    shortenUrl(res, url);
  } else {
    return res.json({ error: "invalid url" });
  }
}

async function redirectUrl(req, res) {
  let urlId = req.params.path;
  UrlModel.findOne({ urlId: urlId }, (err, url) => {
    if (err) {
      return res.json({ error: "Wrong format" });
    } else if (url) {
      res.redirect(url.originalUrl);
    } else {
      return res.json({ "error": "No short URL found for the given input" });
    }

  });
}

async function shortenUrl(res, ogUrl) {
  let url = await UrlModel.findOne({ originalUrl: ogUrl });
  if (url) {
    return url;
  } else {
    let urlId = nanoid(5);
    let urlObj = new UrlModel({
      urlId: urlId,
      originalUrl: ogUrl
    });

    urlObj.save().then(data => {
      if (data) {
        urlObject = { original_url: data.originalUrl, short_url: data.urlId };
        return res.json(urlObject);
      }
    }, err => {
      console.log('error', err);
    }).catch(err => {
      console.log('catch err', err);
    });
  }
}

const urlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)*([?]+[a-z0-9]{1,}[=][a-z0-9]{1,})*([&]+[a-z0-9]{1,}[=][a-z0-9]{1,})?$/gi;

function urlChecker(url) {
  return url && url.match(urlRegex) ? true : false;
}

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
