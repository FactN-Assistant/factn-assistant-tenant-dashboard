'use client'

import Link from "next/link"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/useAuth"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { LoginFormData, loginSchema } from "@/lib/schemas/auth-validations"
import { Eye, EyeOff } from "lucide-react"

export function LoginForm({className, ...props}: React.ComponentProps<"form">) {

  const { loginMutation } = useAuth();
  const {
    register, handleSubmit,
    formState: { errors }, reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const isLoading = loginMutation.isPending;
  const serverError = loginMutation.error;

  // Show error toast when mutation fails
  useEffect(() => {
    if (serverError) {
      const message = serverError.message || "Login failed";
      toast.error(message);
    }
  }, [serverError]);

  // Show success toast on login
  useEffect(() => {
    if (loginMutation.isSuccess) {
      toast.success("Login successful!");
      reset();
    }
  }, [loginMutation.isSuccess, reset]);

  const onSubmit = async (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <form 
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            required
            disabled={isLoading}
            className="bg-background h-10"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-0">{errors.email.message}</p>
          )}
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link href="#" className="ml-auto text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"> 
              Forgot your password?
            </Link>
          </div>
          <div className="relative"> 
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              disabled={isLoading}
              className="bg-background h-10 pr-10"
              {...register("password")}
            />
            <Button
              type="button"
              variant={"ghost"}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-1 top-1 text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out"
              disabled={isLoading}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600 mt-0">{errors.password.message}</p>
          )}
        </Field>
        <Field>
          <Button 
            type="submit" 
            className="h-10 shadow-[0_20px_40px_-24px_color-mix(in_oklab,var(--primary)_75%,transparent)]" 
            size={"lg"} 
            disabled={isLoading}
          >
            {isLoading ? "Signing in…" : "Login"}
          </Button>
        </Field>
        <Field>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="underline underline-offset-4">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
