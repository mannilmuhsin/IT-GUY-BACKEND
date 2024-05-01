"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db"));
// Function to execute a query with error handling
const executeQuery = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.default.query(query);
        console.log('Table created successfully.');
    }
    catch (err) {
        if (err.code === '42P07') {
            console.log('Sequence already exists.');
        }
        else if (err.code === '42P01') {
            console.log('Referenced table does not exist.');
        }
        else {
            console.error('Error occurred while creating table:', err.message);
        }
    }
});
// Product table
const createProductTable = `
  CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    inventory_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;
// Category table
// const createCategoryTable = `
//   CREATE TABLE IF NOT EXISTS categories (
//     id SERIAL PRIMARY KEY,
//     name VARCHAR(255) NOT NULL,
//     parent_id INT REFERENCES categories(id),
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//   )
// `;
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
const createTablesInOrder = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield executeQuery(createUserTable);
        // await executeQuery(createCategoryTable);
        yield executeQuery(createProductTable);
        yield executeQuery(createOrderTable);
        yield executeQuery(createOrderItemTable);
    }
    catch (err) {
        console.error('Error occurred while creating tables:', err.message);
    }
});
// Call function to create tables
createTablesInOrder();
