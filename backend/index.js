const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
const adminRoutes = require("./routes/admin");
const clientRoutes = require("./routes/client");

app.use("/api/admin", adminRoutes);
app.use("/api/client", clientRoutes);

app.get("/", (req, res) => {
  res.send("GymNexus API is running (v2)");
});

const { seedDatabase } = require("./database");

app.listen(PORT, async () => {
  await seedDatabase();
  console.log(`Server running on port ${PORT}`);
});
