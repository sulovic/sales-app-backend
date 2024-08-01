const express = require("express");
const router = express.Router();
const { PrismaClient } = require("../../prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const { generateAccessToken, generateRefreshToken } = require("../../middleware/generateTokens");
const verifyGoogleToken = require("../../middleware/verifyGoogleToken");

router.get("/", async (req, res) => {
  try {
    const { type, email, password, credential, clientId } = req.body;
    if (!type) {
      return res.status(401).json({ message: "Missing Auth type" });
    }
    if (!email) {
      return res.status(401).json({ message: "Missing user email" });
    }
    const foundUser = await prisma.users.findUnique({
      where: {
        email: email,
      },
    });
    if (!foundUser) {
      return res.status(401).json({ message: "User not found" });
    }

    const userData = {
      firstName: foundUser?.firstName,
      lastName: foundUser?.lastName,
      email: foundUser?.email,
      roleId: foundUser?.roleId,
    };

    if (type === "password") {
      // User-Password authentication

      if (!email || !password) {
        return res.status(401).json({ message: "Missing UserName or Password" });
      }

      const isPasswordValid = await bcrypt.compare(password, foundUser.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const accessToken = await generateAccessToken(userData);
      const refreshToken = await generateRefreshToken(userData);

      res
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
          sameSite: "Strict",
          secure: true,
        })
        .status(200)
        .json({
          info: "User found, Password OK!",
          accessToken,
        });
    } else if (type === "oauth") {
      // OAuth authentication

      if (!email || !credential) {
        return res.status(401).json({ message: "Missing Email or Google Credentials" });
      }

      const decodedCredential = await verifyGoogleToken(credential);

      if (!decodedCredential?.email !== email) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const accessToken = generateAccessToken(userData);
      const refreshToken = await generateRefreshToken(userData);

      res
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
          sameSite: "Strict",
          secure: true,
        })
        .status(200)
        .json({
          info: "User found, Google Credentials OK!",
          accessToken,
        });
    } else {
      return res.status(401).json({ message: "Invalid Auth type" });
    }
  } catch (error) {
    if (error.name === "InvalidGoogleToken") {
      return res.status(401).json({ error: "Unauthorized - Invalid Google Token" });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
});

module.exports = router;
