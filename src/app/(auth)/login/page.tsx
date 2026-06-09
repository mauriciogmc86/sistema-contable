"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { loginSchema, type LoginInput } from "@/application/validation";
import { Button } from "@/presentation/components/atoms/Button";
import { Checkbox } from "@/presentation/components/atoms/Checkbox";
import { Input } from "@/presentation/components/atoms/Input";
import { FormField } from "@/presentation/components/molecules/FormField";
import { AuthLayout } from "@/presentation/components/templates";
import { useAuthStore } from "@/presentation/store/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  const onSubmit = async (values: LoginInput) => {
    setFormError(null);
    try {
      await login(values.email, values.password);
      router.replace("/dashboard");
    } catch (err) {
      setFormError(
        err instanceof Error ? "Credenciales incorrectas. Verifica tu correo y contraseña." : "No se pudo iniciar sesión.",
      );
    }
  };

  return (
    <AuthLayout title="Bienvenido de nuevo" subtitle="Inicia sesión para acceder a tu panel">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        {formError && (
          <p role="alert" className="rounded-lg bg-danger-subtle px-3 py-2 text-sm font-medium text-danger">
            {formError}
          </p>
        )}

        <FormField label="Correo electrónico" required error={errors.email?.message}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="email"
              autoComplete="email"
              placeholder="tu@empresa.com"
              aria-describedby={describedBy}
              invalid={invalid}
              leftIcon={<Mail className="h-4 w-4" aria-hidden />}
              {...register("email")}
            />
          )}
        </FormField>

        <FormField label="Contraseña" required error={errors.password?.message}>
          {({ id, describedBy, invalid }) => (
            <div className="relative">
              <Input
                id={id}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                aria-describedby={describedBy}
                invalid={invalid}
                leftIcon={<Lock className="h-4 w-4" aria-hidden />}
                className="pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          )}
        </FormField>

        <div className="flex items-center justify-between">
          <Checkbox id="remember" label="Recordarme" {...register("remember")} />
          <a href="#" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <Button type="submit" size="lg" className="mt-1 w-full" isLoading={isSubmitting}>
          Iniciar sesión
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          ¿No tienes una cuenta?{" "}
          <a href="#" className="font-medium text-primary transition-colors hover:text-primary/80">
            Contacta a ventas
          </a>
        </p>
      </form>
    </AuthLayout>
  );
}
