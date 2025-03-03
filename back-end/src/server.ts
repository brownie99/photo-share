import express from "express";
import multer from "multer";
import cors from "cors";
import jwt from "jsonwebtoken";
import { readdir, readFile, stat } from "fs/promises";
import { statSync } from "fs";

const PASSWORD = "love";
const secret = "photosharebackendsecretkey123";
const photos: Map<number, string> = new Map();
const photoDir = "H:\\PhotoShare\\photo-share\\back-end\\uploads\\";

const port = 3000;
const app = express();
app.use(cors());

function authenticateToken(req, res, next) {
  console.log(req.headers);
  const authHeader = req.headers["authorization"];
  console.log(authHeader);
  const token = authHeader && authHeader.split(" ")[1];
  console.log(`token: ${token}`);

  if (token === null) return res.sendStatus(401);

  jwt.verify(token, secret, (err: any) => {
    console.log(err);

    if (err) return res.sendStatus(401);

    next();
  });
}

async function updatePhotos() {
  console.log("updating photos");
  (await readdir(photoDir))
    .sort(function (a, b) {
      return (
        statSync(photoDir + a).mtime.getTime() -
        statSync(photoDir + b).mtime.getTime()
      );
    })
    .forEach((file) => {
      photos.set(photos.size, file);
    });
  console.log("photos updated");
}

async function start() {
  console.log("starting");
  await updatePhotos();
  console.log("started");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, photoDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

app.use(express.json());

app.post("/login", (req, res) => {
  console.log("POST /login");
  if (req.body === undefined || req.body.pass === undefined) {
    return res.status(401).json({ error: "Incorrect password" });
  }
  if (req.body.pass !== PASSWORD) {
    return res.status(401).json({ error: "Incorrect password" });
  }

  jwt.sign({ id: Date.now() }, secret, { expiresIn: "30s" }, (err, token) => {
    res.json({ token });
  });
});

const upload = multer({ storage });

app.post("/upload", authenticateToken, upload.array("file"), (req, res) => {
  console.log(req);
  console.log(req.files);
  console.log("POST /upload");
  if (!req.files) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  updatePhotos();

  res.json({
    message: "Files uploaded successfully",
  });
});

app.post("/photos", authenticateToken, async (req, res) => {
  console.log("GET /photos");
  console.log(req);
  if (!req.body.photo) {
    console.log("sending all photos");
    console.log({ photos });
    res.json(Object.fromEntries(photos));
    return;
  }
  try {
    await stat(photoDir + req.body.photo);
  } catch {
    res.sendStatus(404);
  }

  res.sendFile(photoDir + req.body.photo);
});

app.listen(port, () => console.log(`Server listening on port ${port}`));

await start();
