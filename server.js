const express = require("express");
var bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
var multer = require("multer");
const sharp = require("sharp");

const session = require("express-session");
const shortid = require("shortid");
const fs = require("fs");
const key = require("./config").db;
const connectMongo = require("connect-mongo");
const MongoStore = connectMongo(session);
const process_handler = require("./process_handler");
const process_all_handler = require("./process_all_handler");

//Managing sessions
let sessionOptions = {
  name: "SESSID",
  secret: "secret",
  saveUninitialized: false,
  resave: false,
  cookie: { maxAge: 3600000, sameSite: true },
  store: new MongoStore({ url: key }),
};
app.use(session(sessionOptions));
var jsonParser = bodyParser.json();
app.use(jsonParser);
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/", express.static(__dirname + "/uploads"));

app.use(
  cors({
    origin: "https://imgprocessor.netlify.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // enable set cookie
    exposedHeaders: ["Content-Disposition"],
  })
);

var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.send("hello bhai");
});

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
  "image/tiff": "tiff",
};

app.post("/upload", upload.array("avatar", 5), (req, res) => {
  let validation = false;
  req.files.map((img) => {
    Object.keys(MIME_TYPES).forEach((key) => {
      if (img.mimetype === key) {
        validation = true;
      }
    });
  });

  if (!validation) {
    console.log(validation);
    return res.status(500).send("broke in server validation");
  }

  let thumbnailJSON = [];
  if (req.session.files) {
    let extension = null;
    let originalname = null;
    req.files.map((img) => {
      Object.keys(MIME_TYPES).forEach((key, index) => {
        if (img.mimetype === key) {
          extension = MIME_TYPES[key];
        }
      });
      originalname = img.originalname.replace(`.${extension}`, "");
      console.log(originalname);

      switch (extension) {
        case "jpg":
          originalname = img.originalname.replace(`.jpg`, "");
          if (originalname === img.originalname) {
            originalname = img.originalname.replace(`.jpeg`, "");
          }
          break;
        case "jpeg":
          originalname = img.originalname.replace(`.jpeg`, "");
          if (originalname === img.originalname) {
            originalname = img.originalname.replace(`.jpg`, "");
          }
          break;
        case "png":
          originalname = img.originalname.replace(`.png`, "");
          break;
        case "webp":
          originalname = img.originalname.replace(`.webp`, "");
          break;
        case "tiff":
          originalname = img.originalname.replace(`.tiff`, "");
          break;
        default:
          originalname = img.originalname;
      }

      shortid.characters(
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@"
      );
      const filepath = `${__dirname}/uploads/${originalname}____${shortid.generate()}.${extension}`;
      console.log(filepath);
      fs.writeFileSync(filepath, img.buffer, "ascii", function (err) {
        if (err) {
          return res.status(500).send("Something broke in server upload");
        }
      });
      req.session.files.push(filepath);
      let thumbnail = String(filepath).split(".");

      let newFilepath = "";
      if (thumbnail.length >= 3) {
        //dosomething
        for (let i = 0; i < thumbnail.length; i++) {
          if (i < thumbnail.length - 1) {
            if (i == 0) {
              newFilepath = thumbnail[i];
            } else {
              newFilepath += "." + thumbnail[i];
            }
          }
        }
        newFilepath += `70x70.` + thumbnail[thumbnail.length - 1];
      } else {
        newFilepath = thumbnail[0] + "70x70." + thumbnail[1];
      }
      sharp(filepath)
        .resize(70, 70)
        .toFile(newFilepath, function (err) {
          if (err) {
            return res.status(500).send("Something broke in server upload");
          }
        });
      thumbnailJSON.push(newFilepath);
    });
  } else {
    req.session.files = [];
    let filepath = "";

    req.files.map((img) => {
      let ext = null;
      let originalname = null;

      Object.keys(MIME_TYPES).forEach((key, index) => {
        if (img.mimetype === key) {
          ext = MIME_TYPES[key];
        }
      });

      switch (ext) {
        case "jpg":
          originalname = img.originalname.replace(`.jpg`, "");
          if (originalname === img.originalname) {
            originalname = img.originalname.replace(`.jpeg`, "");
          }
          break;
        case "jpeg":
          originalname = img.originalname.replace(`.jpeg`, "");
          if (originalname === img.originalname) {
            originalname = img.originalname.replace(`.jpg`, "");
          }
          break;
        case "png":
          originalname = img.originalname.replace(`.png`, "");
          break;
        case "webp":
          originalname = img.originalname.replace(`.webp`, "");
          break;
        case "tiff":
          originalname = img.originalname.replace(`.tiff`, "");
          break;
        default:
          originalname = img.originalname;
      }
      console.log(originalname);

      filepath = `${__dirname}/uploads/${originalname}____${shortid.generate()}.${ext}`;

      fs.writeFileSync(filepath, img.buffer, "ascii", function (err) {
        if (err) {
          return res.status(500).send("Something broke in server upload");
        }
      });

      req.session.files.push(filepath);
      let thumbnail = String(filepath).split(".");
      let newFilepath;
      if (thumbnail.length >= 3) {
        //dosomething
        for (let i = 0; i < thumbnail.length; i++) {
          if (i < thumbnail.length - 1) {
            if (i == 0) {
              newFilepath = thumbnail[i];
            } else {
              newFilepath += "." + thumbnail[i];
            }
          }
        }
        newFilepath += `70x70.` + thumbnail[thumbnail.length - 1];
        console.log(newFilepath);
      } else {
        newFilepath = thumbnail[0] + "70x70." + thumbnail[1];
      }

      sharp(filepath)
        .resize(70, 70)
        .toFile(newFilepath, function (err) {
          if (err) {
            return res.status(500).send("Something broke in server upload");
          }
        });
      thumbnailJSON.push(newFilepath);
    });
  }

  if (thumbnailJSON.length >= 1) {
    return res.json(thumbnailJSON);
  } else {
    return res.status(500).send("Something broke in server upload");
  }
});

app.post("/process", process_handler);
app.post("/processall", process_all_handler);
const port = process.env.PORT || 80;

app.listen(port, () => console.log(`server started at port ${port}`));
