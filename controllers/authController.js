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
exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db"));
// Secret key for JWT
const SECRET_KEY = "your-secret-key";
// User registration
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name } = req.body;
    try {
        // Check if the user already exists
        const checkQuery = "SELECT id FROM users WHERE email = $1";
        const checkResult = yield db_1.default.query(checkQuery, [email]);
        if (!checkResult || checkResult.rowCount === null) {
            return res.status(500).json({ error: "Database error" });
        }
        if (checkResult.rowCount > 0) {
            return res.status(409).json({ error: "User already exists" });
        }
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
        // Insert the new user into the database
        const insertQuery = "INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id";
        const insertResult = yield db_1.default.query(insertQuery, [
            email,
            hashedPassword,
            name,
        ]);
        const userId = insertResult.rows[0].id;
        res.status(201).json({ message: "User registered successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.register = register;
// User login
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Check if the user exists
        const checkQuery = "SELECT id, password FROM users WHERE email = $1";
        const checkResult = yield db_1.default.query(checkQuery, [email]);
        if (checkResult.rowCount === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const user = checkResult.rows[0];
        // Compare the provided password with the hashed password
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        // Generate a JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, SECRET_KEY, {
            expiresIn: "1h",
        });
        res.status(200).json({ token });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.login = login;
