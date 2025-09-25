import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ImageKit from "imagekit";

dotenv.config();

const app = express();
const port = process.env.PORT || 3003;

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = ["https://dusanprogram.eu"];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  console.log("Request from origin:", req.headers.origin);
  next();
});

// Initialize ImageKit instance
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// Route to retrieve file metadata or URL
app.get("/files/:filename", async (req, res) => {
  const filename = req.params.filename;

  try {
    const fileList = await imagekit.listFiles({
      searchQuery: `name = "${filename}"`,
    });

    if (fileList.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }

    // You can choose to redirect, send metadata, or just the URL
    const file = fileList[0];
    return res.json({
      name: file.name,
      url: file.url,
      size: file.size,
      type: file.mime,
    });
  } catch (error) {
    console.error("Error fetching file:", error.message);
    res.status(500).json({ error: "Error fetching file" });
  }
});

app.get("/files", async (req, res) => {
  try {
    const files = await imagekit.listFiles({
      fileType: "image", // Optional: only fetch image files
      limit: 100, // Max 1000 per request
      skip: 0, // For pagination
    });

    const imageList = files.map((file) => ({
      name: file.name,
      url: file.url,
      size: file.size,
      type: file.mime,
    }));

    res.json(imageList);
  } catch (error) {
    console.error("Error fetching images:", error.message);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
