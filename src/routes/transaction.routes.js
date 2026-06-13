const {Router}=require("express");
const { route } = require("./auth.routes");
const authMiddleware=require("../middlewares/auth.middleware")
const transactionController=require("../controllers/transaction.controller")

const transactionRoutes=Router()

/*
-POST- /api/transactions/
-create a new transactions
*/
transactionRoutes.post("/", authMiddleware.authMiddleware, transactionController.createTransaction)

/**
 * POST-/api/transactions/system/initial-funds
 * -create initial funds transactions from system user
 */
transactionRoutes.post("/system/initial-funds/",authMiddleware.authSystemUserMiddleware,transactionController.createInitialFundsTransaction)

module.exports=transactionRoutes;