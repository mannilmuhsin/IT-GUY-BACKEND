import express, { Express, Request, Response } from 'express';
import { authenticateToken } from './middleware/authMiddleware';
import { register, login } from './controllers/authController';
import { addToCart, removeFromCart, incrementQuantity } from './controllers/cartController';
import { createProduct } from './controllers/productController';

const app: Express = express();
const port = 3000;

// Middleware
app.use(express.json());

// Routes
app.post('/register', register);
app.post('/login', login);
app.post('/products', createProduct);

// Protected routes
app.use(authenticateToken); // Apply the authentication middleware
app.post('/cart/add', addToCart);
app.delete('/cart/:productId', removeFromCart);
app.put('/cart/:productId/increment', incrementQuantity);


app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});