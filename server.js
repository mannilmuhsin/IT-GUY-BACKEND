"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("./middleware/authMiddleware");
const authController_1 = require("./controllers/authController");
const cartController_1 = require("./controllers/cartController");
const productController_1 = require("./controllers/productController");
const app = (0, express_1.default)();
const port = 3000;
// Middleware
app.use(express_1.default.json());
// Routes
app.post('/register', authController_1.register);
app.post('/login', authController_1.login);
app.post('/products', productController_1.createProduct);
// Protected routes
app.use(authMiddleware_1.authenticateToken); // Apply the authentication middleware
app.post('/cart/add', cartController_1.addToCart);
app.delete('/cart/:productId', cartController_1.removeFromCart);
app.put('/cart/:productId/increment', cartController_1.incrementQuantity);
app.get('/', (req, res) => {
    res.send('Hello, World!');
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
