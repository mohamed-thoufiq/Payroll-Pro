import Reimbursement from '../models/Reimbursement.js'
import User from '../models/Usermodel.js'
// POST /api/reimbursements/submit-reimbursement
export const submitExpense = async (req, res) => {
  try {
    // Frontend sends 'title', Backend model might use 'category' or 'title'
    // Let's destructure both to be safe or pick one standard.
    const { title, category, amount, description, expenseDate } = req.body;
    const user = await User.findOne({_id:req.user.userId}) 
    console.log(req.user);
    
    const expense = await Reimbursement.create({
      organizationId: user.organizationId,
      employeeId: user.employeeDetails?.basic?.employeeId,
      category:  category, // Fallback for consistency
      amount,
      description,
      expenseDate,
      status: "PENDING"
    });

    res.status(201).json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/reimbursements/my
export const getUserExpenses = async (req, res) => {
  try {
    const expenses = await Reimbursement.find({ employeeId: req.user.employeeId});
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/reimbursements/:id
export const updateExpenseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await Reimbursement.findByIdAndUpdate(
      id,
      { 
        status, 
        approvedBy: req.user.userId, 
        approvedAt: new Date() 
      },
      { new: true }
    );

    res.json({ success: true, updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/reimbursements/pending?status=PENDING
export const getExpensesForHR = async (req, res) => {
  const { status } = req.query;

  const expenses = await Reimbursement.find({
    organizationId: req.user.organizationId,
    status
  }).populate("employeeId", "name email");

  res.json(expenses);
};