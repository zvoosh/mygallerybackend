import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ImageKit from "imagekit";

dotenv.config();

const app = express();
const port = process.env.PORT || 3003;

// ✅ Handle preflight requests
app.options("*", cors());

// ✅ CORS middleware
app.use(
  cors({
    origin: "https://mygallery.dusanprogram.eu",
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
  })
);

// ✅ Parse JSON
app.use(express.json());

// ✅ ImageKit setup
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// ✅ Routes
app.get("/files", async (req, res) => {
  try {
    const files = await imagekit.listFiles({ limit: 100 });
    res.json(files.map(f => ({
      name: f.name,
      url: f.url,
      size: f.size,
      type: f.mime,
    })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

app.get("/files/:filename", async (req, res) => {
  try {
    const fileList = await imagekit.listFiles({
      searchQuery: `name = "${req.params.filename}"`,
    });

    if (!fileList.length) return res.status(404).json({ error: "File not found" });

    const file = fileList[0];
    res.json({
      name: file.name,
      url: file.url,
      size: file.size,
      type: file.mime,
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching file" });
  }
});

app.listen(port, () => {
  console.log(`✅ Backend running on http://localhost:${port}`);
});