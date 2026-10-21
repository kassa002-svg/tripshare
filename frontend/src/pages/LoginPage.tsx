import { useState, type FormEvent } from "react";

interface LoginResponse {
  message?: string;
  error?: string;
  user?: { id: string; username: string; email: string; role: "user" | "admin" };
}

export function LoginPage() {
  const [message, setMessage] = useState<string>("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    const data = (await res.json()) as LoginResponse;

    if (res.ok && data.user) {
      setMessage(`${data.message} (role: ${data.user.role})`);
    } else {
      setMessage(`Error: ${data.error}`);
    }
  }

  return (
    <main>
      <h1>Log in</h1>
      <form onSubmit={handleSubmit}>
        <p>
          <label>
            Email <input name="email" type="email" required />
          </label>
        </p>
        <p>
          <label>
            Password <input name="password" type="password" required />
          </label>
        </p>
        <button type="submit">Log in</button>
      </form>
      <p>{message}</p>
      <p>
        No account yet? <a href="/register">Register</a>
      </p>
    </main>
  );
}