import express from "express";
import morgan from "morgan";
import cors from "cors";
import "dotenv/config"

import contactsRouter from "./routes/contactsRouter.js";
import authRouter from './routes/authRouter.js'; // Import the auth router

const app = express();

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

app.use("/api/contacts", contactsRouter);
app.use('/api/auth', authRouter); // Use the auth router

app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

const port = process.env.PORT || 3000;

// Start server only if not in test environment
// In a test environment, the test runner will import and manage the app.
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running. Use our API on port: ${port}`);
  });
}

export default app; // Export app for testing
