const express = require("express");
const router = express.Router();
const { PrismaClient } = require("../prisma/client");
const prisma = new PrismaClient();
const checkUserRole = require("../middleware/checkUserRole");
const { minRoles } = require("../config/minRoles");

router.get("/", checkUserRole(minRoles.sales.get), async (req, res) => {
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
      filter[key] = { in: values };
    }

    const sales = await prisma.sales.findMany({
      where: filter,
      orderBy,
      take,
      skip,
    });
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
});

router.get("/:id", checkUserRole(minRoles.sales.get), async (req, res) => {
  try {
    const id = parseInt(req?.params?.id);

    const sale = await prisma.sales.findUnique({
      where: {
        saleId: id,
      },
    });
    if (!sale) {
      return res.status(404).json({ error: "Resource not found" });
    }
    res.status(200).json(sale);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
});

router.post("/", checkUserRole(minRoles.sales.post), async (req, res) => {
  try {
    const newSale = req?.body;

    if (!newSale) {
      return res.status(400).json({ error: "Sales data is sent" });
    }

    const sale = await prisma.sales.create({ data: newSale });
    res.status(201).json(sale);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log(err);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
});

router.put("/:id", checkUserRole(minRoles.sales.put), async (req, res) => {
  try {
    const id = parseInt(req?.params?.id);

    const sale = await prisma.sales.update({
      where: {
        saleId: id,
      },
      data: req?.body,
    });

    if (!sale) {
      return res.status(404).json({ error: "Resource not found" });
    }

    res.status(200).json(sale);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
});

router.delete("/:id", checkUserRole(minRoles.sales.delete), async (req, res) => {
  try {
    const id = parseInt(req?.params?.id);

    //Check for resource before deletion

    const existingSale = await prisma.sales.findUnique({
      where: {
        saleId: id,
      },
    });

    if (!existingSale) {
      return res.status(404).json({ error: "Sale data not found" });
    }

    //Delete if exists

    const deletedSale = await prisma.sales.delete({
      where: {
        saleId: id,
      },
    });

    res.status(200).json(deletedSale);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
});

module.exports = router;
