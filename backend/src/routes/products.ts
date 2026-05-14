import { Router, type Request, type Response } from 'express';
import {Product} from '../models/product.model.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { type AuthRequest, type SortOrder } from '../types/index.js';

const router = Router();


// GET /api/products?sortBy=price&order=asc
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const sortBy  = (req.query.sortBy  as string) || 'productName';
  const order   = (req.query.order   as SortOrder) || 'asc';
  const sortVal = order === 'desc' ? -1 : 1;

  try {
    const products = await Product.find().sort({ [sortBy]: sortVal });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// POST /api/products
router.post('/', protect, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// PUT /api/products/:id
router.put('/:id', protect, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', protect, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;