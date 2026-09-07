import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp } from "@/lib/auth-client";

export function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: signUpError } = await signUp.email({ email, password, name });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message ?? "Unable to sign up");
      return;
    }
    navigate("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-lg bg-white p-8 shadow">
        <h1 className="text-xl font-semibold">Create your partner account</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Input placeholder="Full Name" required value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Sign up"}
        </Button>
        <p className="text-center text-sm text-slate-500">
          Already have an account? <Link to="/sign-in" className="underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
