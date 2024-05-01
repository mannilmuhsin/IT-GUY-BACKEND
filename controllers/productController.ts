import { Request, Response } from 'express';
import pool from '../db';

export const createProduct = async (req: Request, res: Response) => {
  const { name, description, price, inventoryCount } = req.body;

  try {
    const query = `
      INSERT INTO products (name, description, price, inventory_count)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;
    const values = [name, description, price, inventoryCount];
    const result = await pool.query(query, values);
    const productId = result.rows[0].id;

    res.status(201).json({ message: 'Product created successfully', productId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
};