const express = require("express");
const router = express.Router();
const { PrismaClient } = require("../prisma/client");
const prisma = new PrismaClient();
const checkUserRole = require("../middleware/checkUserRole");
const { minRoles } = require("../config/minRoles");

router.get("/", checkUserRole(minRoles.saleProducts.get), async (req, res) => {
  try {
    // Get query params

    const queryParams = req?.query;
    const { sortBy, sortOrder, limit, page, ...filters } = queryParams;
    const take = limit ? parseInt(limit) : undefined;
    const skip = page && limit ? (parseInt(page) - 1) * parseInt(limit) : undefined;
    const orderBy =
      sortBy && sortOrder
        ? {
            [sortBy]: sortOrder,
          }
        : undefined;

    const filter = {};

    for (const key in filters) {
      const value = filters[key];
      const values = value.split(",");
      filter[key] = { in: key === "saleId" ? [parseInt(values)] : values };
    }

    const saleProducts = await prisma.saleProducts.findMany({
      where: filter,
      orderBy,
      take,
      skip,
      include: {
        product: true,
      },
    });
    res.status(200).json(saleProducts);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
});

router.get("/:id", checkUserRole(minRoles.saleProducts.get), async (req, res) => {
  try {
    const id = parseInt(req?.params?.id);

    const saleProducts = await prisma.saleProducts.findUnique({
      where: {
        spId: id,
      },
      include: {
        product: true,
      },
    });
    if (!saleProducts) {
      return res.status(404).json({ error: "Resource not found" });
    }
    res.status(200).json(saleProducts);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
});

router.post("/", checkUserRole(minRoles.saleProducts.post), async (req, res) => {
  try {
    const newSaleProducts = req?.body;

    if (!newSaleProducts) {
      return res.status(400).json({ error: "No product data is sent" });
    }

    const saleProducts = await prisma.saleProducts.create({ data: newSaleProducts });
    res.status(201).json(saleProducts);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
});

router.put("/:id", checkUserRole(minRoles.saleProducts.put), async (req, res) => {
  try {
    const id = parseInt(req?.params?.id);

    const saleProducts = await prisma.saleProducts.update({
      where: {
        spId: id,
      },
      data: req?.body,
    });

    if (!saleProducts) {
      return res.status(404).json({ error: "Resource not found" });
    }

    res.status(200).json(saleProducts);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
});

router.delete("/:id", checkUserRole(minRoles.saleProducts.delete), async (req, res) => {
  try {
    const id = parseInt(req?.params?.id);

    //Check for resource before deletion

    const existingSaleProducts = await prisma.saleProducts.findUnique({
      where: {
        spId: id,
      },
    });

    if (!existingSaleProducts) {
      return res.status(404).json({ error: "Sales Products not found" });
    }

    //Delete if exists

    const deletedSaleProducts = await prisma.saleProducts.delete({
      where: {
        spId: id,
      },
    });

    res.status(200).json(deletedSaleProducts);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
});

module.exports = router;
