const express = require("express");
const cors = require("cors");
const path = require("path");
const corsConfig = require("./config/cors");
const { requestLogger, errorLogger } = require("./middleware/logger");
const verifyAccessToken = require("./middleware/verifyAccessToken");
const rateLimiter = require("./middleware/rateLimiter");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors(corsConfig));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(requestLogger, errorLogger);


// Auth routes
app.use("/login", rateLimiter(3, 10), require("./routes/auth/login"));
app.use("/logout", require("./routes/auth/logout"));
app.use("/refresh", require("./routes/auth/refresh"));
// app.use("/reset", require("./routes/auth/reset"));


// Public route
app.use("/api/productsOnSale", require("./routes/productsOnSale"));


// Data routes
app.use("/api/products", verifyAccessToken, require("./routes/products"));
app.use("/api/users", verifyAccessToken, require("./routes/users"));
app.use("/api/uploads", verifyAccessToken, require("./routes/uploads"));
app.use("/api/sales", verifyAccessToken, require("./routes/sales"));
app.use("/api/saleProducts", require("./routes/saleProducts"));



// Handle errors

app.use((err, req, res, next) => {
  console.log(err)
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    // Handle invalid JSON error
    return res.status(400).json({ error: "Invalid JSON format" });
  }
   // Handle other errors
   return res.status(500).json({ error: 'Internal server error' });

});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
