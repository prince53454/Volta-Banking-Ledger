import { api } from "./client";

export async function getAccounts() {
  return api.get("/accounts");
}

export async function createAccount() {
  return api.post("/accounts");
}

export async function getAccountBalance(accountId) {
  return api.get(`/accounts/balance/${accountId}`);
}
