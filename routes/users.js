const express = require("express");
const router = express.Router();
const { PrismaClient } = require("../prisma/client");
const prisma = new PrismaClient();

// implement check user role

router.get("/", async (req, res) => {
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

    const users = await prisma.users.findMany({
      where: filter,
      orderBy,
      take,
      skip,
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
        roleId: true,
      },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req?.params?.id);

    const user = await prisma.users.findUnique({
      where: {
        userId: id,
      },
    });
    if (!user) {
      return res.status(404).json({ error: "Resource not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
});

router.post("/", async (req, res) => {
  try {
    const newUser = req?.body;

    if (!newUser) {
      return res.status(400).json({ error: "No user data is sent" });
    }

    const user = await prisma.users.create({ data: newUser });
    res.status(201).json(user);
  } catch (err) {
    if (err.code === "P2002") {
      res.status(409).json({ error: "User already exists" });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req?.params?.id);

    const user = await prisma.users.update({
      where: {
        userId: id,
      },
      data: req?.body,
    });

    if (!user) {
      return res.status(404).json({ error: "Resource not found" });
    }

    res.status(204).json(user);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req?.params?.id);

    //Check for resource before deletion

    const existingUser = await prisma.users.findUnique({
      where: {
        userId: id,
      },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    //Delete if exists

    const deletedUser = await prisma.users.delete({
      where: {
        userId: id,
      },
    });

    res.status(204).json(deletedUser);
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
