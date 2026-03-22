import { RegisterForm } from "@/components/auth/RegisterForm";
import { TrendingUp } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg">
            <TrendingUp className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Expense<span className="text-primary">Tracker</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Start tracking your finances today
          </p>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}
