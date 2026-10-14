import { api } from "./client";

export async function createTransaction({
  fromAccount,
  toAccount,
  amount,
  idempotencyKey,
}) {
  return api.post("/transactions", {
    fromAccount,
    toAccount,
    amount,
    idempotencyKey,
  });
}

export async function getTransactions() {
  return api.get("/transactions");
}

export async function depositFunds({ accountId, amount }) {
  return api.post("/transactions/deposit", {
    accountId,
    amount,
  });
}
