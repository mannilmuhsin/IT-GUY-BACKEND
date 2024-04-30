import pool from '../db';
import { QueryResult } from 'pg';

// Function to execute a query with error handling
const executeQuery = async (query: string) => {
  try {
    const result: QueryResult = await pool.query(query);
    console.log('Table created successfully.');
  } catch (err: any) {
    if ((err as { code: string }).code === '42P07') {
      console.log('Sequence already exists.');
    } else if ((err as { code: string }).code === '42P01') {
      console.log('Referenced table does not exist.');
    } else {
      console.error('Error occurred while creating table:', (err as Error).message);
    }
  }
};

// Product table
const createProductTable = `
  CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    category_id INT REFERENCES categories(id),
    inventory_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

// Category table
const createCategoryTable = `
  CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INT REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

// User table
const createUserTable = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

// Order table
const createOrderTable = `
  CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    total_amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

// Order Item table
const createOrderItemTable = `
  CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id),
    product_id INT REFERENCES products(id),
    quantity INT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

// Create tables in the correct order
const createTablesInOrder = async () => {
  try {
    await executeQuery(createUserTable);
    await executeQuery(createCategoryTable);
    await executeQuery(createProductTable);
    await executeQuery(createOrderTable);
    await executeQuery(createOrderItemTable);
  } catch (err: any) {
    console.error('Error occurred while creating tables:', (err as Error).message);
  }
};

// Call function to create tables
createTablesInOrder();
