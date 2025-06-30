import express from "express";
import morgan from "morgan";
import cors from "cors";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from 'url';

import contactsRouter from "./routes/contactsRouter.js";
import authRouter from './routes/authRouter.js';

const app = express();

// Налаштування шляхів для ES модулів
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

// Налаштування статичних файлів
app.use(express.static(path.join(__dirname, 'public')));

app.use("/api/contacts", contactsRouter);
app.use('/api/auth', authRouter);

app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running. Use our API on port: ${port}`);
  });
}

export default app;