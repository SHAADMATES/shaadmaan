import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import prisma from '../db.js';

const router = express.Router();

router.use(protect, authorize('treasurer'));

// @route   GET /api/treasurer/stats
// @desc    Retrieve overall finance overview statistics
router.get('/stats', async (req, res) => {
  try {
    const transactions = await prisma.finance.findMany();
    
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
      }
    });

    res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving financial summary.' });
  }
});

// @route   GET /api/treasurer/transactions
// @desc    Get all transactions
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await prisma.finance.findMany({
      orderBy: { date: 'desc' },
      include: {
        program: {
          select: { title: true }
        }
      }
    });
    
    const mappedTransactions = transactions.map(t => ({
      ...t,
      programId: t.program
    }));
    
    res.json(mappedTransactions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve transactions.' });
  }
});

// @route   POST /api/treasurer/transactions
// @desc    Record a new transaction (income / expense)
router.post('/transactions', async (req, res) => {
  const { type, category, amount, description, date, programId } = req.body;

  if (!type || !category || !amount) {
    return res.status(400).json({ message: 'Type, category, and amount are required.' });
  }

  try {
    const transaction = await prisma.finance.create({
      data: {
        type,
        category,
        amount: Number(amount),
        description: description || '',
        date: date ? new Date(date) : new Date(),
        programId: programId || null
      }
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Failed to log financial record.', error: error.message });
  }
});

// @route   DELETE /api/treasurer/transactions/:id
// @desc    Delete a transaction
router.delete('/transactions/:id', async (req, res) => {
  try {
    await prisma.finance.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Transaction record deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete transaction.' });
  }
});

// @route   GET /api/treasurer/program-expenses
// @desc    Get expenses linked to programs
router.get('/program-expenses', async (req, res) => {
  try {
    const expenses = await prisma.finance.findMany({
      where: {
        type: 'expense',
        programId: { not: null }
      },
      include: {
        program: {
          select: { title: true, wing: true }
        }
      }
    });
    
    const mappedExpenses = expenses.map(e => ({
      ...e,
      programId: e.program
    }));
    
    res.json(mappedExpenses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load program expenses.' });
  }
});

// @route   GET /api/treasurer/programs
// @desc    Get all programs for transaction selection
router.get('/programs', async (req, res) => {
  try {
    const programs = await prisma.program.findMany();
    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load programs list.' });
  }
});

export default router;
