const express = require("express");
const router = express.Router();
const { PrismaClient } = require("../prisma/client");
const prisma = new PrismaClient();
// implement check user role

router.get("/", async (req, res) => {
  try {
    const products = await prisma.products.findMany();
    res.status(200).json(products);
  } catch (error) {
    console.log(error);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
});

module.exports = router;
