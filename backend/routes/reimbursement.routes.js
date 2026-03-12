import express from "express"
import { submitExpense, getUserExpenses,updateExpenseStatus, getExpensesForHR } from "../controller/reimbursement.controller.js";
import {  authenticate } from "../middleware/auth.js"; 

const router = express.Router();

router.post('/submit-reimbursement', authenticate, submitExpense);
router.get('/my', authenticate, getUserExpenses); 
router.get('/pending', authenticate, getExpensesForHR); 
router.patch('/:id', authenticate, updateExpenseStatus); // Dynamic ID for HR updates

export default router;