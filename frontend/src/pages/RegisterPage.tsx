import { useState, type FormEvent } from "react";

interface RegisterResponse {
  message?: string;
  error?: string;
  user?: { id: string; username: string; email: string };
}

export function RegisterPage() {
  const [message, setMessage] = useState<string>("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); 

    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    const data = (await res.json()) as RegisterResponse;

    if (res.ok && data.user) {
      setMessage(`${data.message} Your user id is ${data.user.id}.`);
    } else {
      setMessage(`Error: ${data.error}`);
    }
  }

  return (
    <main>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <p>
          <label>
            Username <input name="username" required />
          </label>
        </p>
        <p>
          <label>
            Email <input name="email" type="email" required />
          </label>
        </p>
        <p>
          <label>
            Password <input name="password" type="password" minLength={8} required />
          </label>
        </p>
        <button type="submit">Create account</button>
      </form>
      <p>{message}</p>
      <p>
        Already have an account? <a href="/login">Log in</a>
      </p>
    </main>
  );
}