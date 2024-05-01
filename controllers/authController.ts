// src/controllers/authController.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db";

// Secret key for JWT
const SECRET_KEY = "your-secret-key";

// User registration
export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  try {
    // Check if the user already exists
    const checkQuery = "SELECT id FROM users WHERE email = $1";
    const checkResult = await pool.query(checkQuery, [email]);

    if (!checkResult || checkResult.rowCount === null) {
      return res.status(500).json({ error: "Database error" });
    }

    if (checkResult.rowCount > 0) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the new user into the database
    const insertQuery =
      "INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id";
    const insertResult = await pool.query(insertQuery, [
      email,
      hashedPassword,
      name,
    ]);
    const userId = insertResult.rows[0].id;

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// User login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const checkQuery = "SELECT id, password FROM users WHERE email = $1";
    const checkResult = await pool.query(checkQuery, [email]);

    if (checkResult.rowCount === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = checkResult.rows[0];

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
