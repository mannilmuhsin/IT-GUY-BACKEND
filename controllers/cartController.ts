// src/controllers/cartController.ts
import { Request, Response } from "express";
import pool from "../db";
interface AuthRequest extends Request {
  userId?: number; // userId property is optional
}

export const addToCart = async (req: AuthRequest, res: Response) => {
  const { productId, quantity } = req.body;
  const userId = req.userId;

  try {
    // Check if the product exists
    const productQuery = "SELECT id, price FROM products WHERE id = $1";
    const productResult = await pool.query(productQuery, [productId]);

    if (productResult.rowCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const price = productResult.rows[0].price;

    // Check if the user has an existing order
    const orderQuery =
      "SELECT id, total_amount FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1";
    const orderResult = await pool.query(orderQuery, [userId]);

    let orderId;
    let totalAmount = 0; // Initialize total amount to 0

    if (orderResult && orderResult.rowCount && orderResult.rowCount > 0) {
      // User has an existing order, use that order ID
      orderId = orderResult.rows[0].id;
      totalAmount = orderResult.rows[0].total_amount;
    } else {
      // Create a new order for the user
      const createOrderQuery =
        "INSERT INTO orders (user_id, total_amount) VALUES ($1, $2) RETURNING id";
      const createOrderResult = await pool.query(createOrderQuery, [userId, 0]);
      orderId = createOrderResult.rows[0].id;
    }

    // Calculate the total amount including the new product
    totalAmount += price * quantity;

    // Add the product to the cart
    const cartQuery =
      "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)";
    await pool.query(cartQuery, [orderId, productId, quantity, price]);

    // Update the total_amount in the orders table
    const updateOrderQuery =
      "UPDATE orders SET total_amount = $1 WHERE id = $2";
    await pool.query(updateOrderQuery, [totalAmount, orderId]);

    res.status(200).json({ message: "Product added to cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
  const { productId } = req.params;
  const userId = req.userId; // Assuming you've implemented user authentication and populated req.userId

  try {
    // Delete the product from the cart
    const deleteQuery = `
        DELETE FROM order_items
        WHERE order_id = (SELECT id FROM orders WHERE user_id = $1 AND created_at = (SELECT MAX(created_at) FROM orders WHERE user_id = $1))
        AND product_id = $2
      `;
    await pool.query(deleteQuery, [userId, productId]);

    res.status(200).json({ message: "Product removed from cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const incrementQuantity = async (req: AuthRequest, res: Response) => {
  const { productId } = req.params;
  const userId = req.userId; // Assuming you've implemented user authentication and populated req.userId

  try {
    // Increment the quantity in the cart
    const incrementQuery = `
            UPDATE order_items
            SET quantity = quantity + 1
            WHERE order_id = (
                SELECT id
                FROM orders
                WHERE user_id = $1
                AND created_at = (
                    SELECT MAX(created_at)
                    FROM orders
                    WHERE user_id = $1
                )
            )
            AND product_id = $2
            RETURNING price; -- Return the price of the product for calculating the total amount
        `;
    const { rows } = await pool.query(incrementQuery, [userId, productId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Product not found in cart" });
    }

    const price = rows[0].price; // Price of the product
    const updatedQuantity = rows[0].quantity; // Updated quantity after incrementing

    // Update the total amount in the orders table
    const updateTotalQuery = `
            UPDATE orders
            SET total_amount = (
                SELECT SUM(quantity * price)
                FROM order_items
                WHERE order_id = (
                    SELECT id
                    FROM orders
                    WHERE user_id = $1
                    AND created_at = (
                        SELECT MAX(created_at)
                        FROM orders
                        WHERE user_id = $1
                    )
                )
            )
            WHERE id = (
                SELECT id
                FROM orders
                WHERE user_id = $1
                AND created_at = (
                    SELECT MAX(created_at)
                    FROM orders
                    WHERE user_id = $1
                )
            )
        `;
    await pool.query(updateTotalQuery, [userId]);

    res.status(200).json({ message: "Product quantity incremented in cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
