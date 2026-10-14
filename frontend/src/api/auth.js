import { api } from "./client";

export async function registerUser({ name, email, password }) {
  const data = await api.post("/auth/register", { name, email, password });
  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }
  return data;
}

export async function loginUser({ email, password }) {
  const data = await api.post("/auth/login", { email, password });
  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }
  return data;
}

export async function logoutUser() {
  await api.post("/auth/logout");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
