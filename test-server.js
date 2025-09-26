import express from "express";
import cors from "cors";

const app = express();
const port = 3003;

app.options("/*", cors()); 

app.listen(port, () => {
  console.log(`✅ Test server running on http://localhost:${port}`);
});