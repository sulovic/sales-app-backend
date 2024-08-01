const express = require("express");
const cors = require("cors");
const path = require("path");
const corsConfig = require("./config/cors");
const { requestLogger, errorLogger } = require("./middleware/logger");
const rateLimiter = require("./middleware/rateLimiter");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors(corsConfig));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(requestLogger, errorLogger);




app.use("/api/products", require("./routes/products"));
// app.use("api/sales", require("./routes/sales"));

// app.use("/login", rateLimiter(3, 10), require("./routes/auth/login"));
// app.use("/refresh", require("./routes/auth/refresh"));
// app.use("/logout", require("./routes/auth/logout"));

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
