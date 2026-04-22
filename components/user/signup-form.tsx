'use client'

import Link from "next/link"

import { cn, getPasswordStrength } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"
import { SignupFormData, SignupPayload, signupSchema } from "@/lib/schemas/auth-validations"
import { Check, Eye, EyeOff } from "lucide-react"

export function SignupForm({className, ...props}: React.ComponentProps<"form">) {

  const { registerMutation } = useAuth()
  const {
    register, handleSubmit, watch,
    formState: { errors }, reset
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  

  const passwordValue = watch("password");
  const confirmPasswordValue = watch("confirmPassword");
  const isLoading = registerMutation.isPending;
  const serverError = registerMutation.error;

  // Memoize password strength to avoid recalculation
  const pwStrength = useMemo(
    () => getPasswordStrength(passwordValue),
    [passwordValue]
  );

  // Show error toast when mutation fails
  useEffect(() => {
    if (serverError) {
      const message = serverError.message || "Registration failed";
      toast.error(message);
    }
  }, [serverError]);

  // Show success toast on registration
  useEffect(() => {
    if (registerMutation.isSuccess) {
      toast.success("Account created successfully!");
      reset();
    }
  }, [registerMutation.isSuccess, reset]);

  const onSubmit = async (data: SignupPayload) => {
    registerMutation.mutate({
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      password: data.password,
    });
  };

  return (
    <form 
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Fill in the form below to create your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            required
            disabled={isLoading}
            className="bg-background h-10"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-0">{errors.name.message}</p>
          )}
        </Field>
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
          <FieldDescription>
            All of your projects will be owned by this email.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
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
          <FieldDescription>
            Must be at least 8 characters long.
          </FieldDescription>
          {passwordValue && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 bg-gray-200 h-2 rounded overflow-hidden">
                  <div
                    className={`h-full ${pwStrength.color}`}
                    style={{ width: `${(pwStrength.score / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold">{pwStrength.label}</span>
              </div>
            </div>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          <div className="relative flex items-center">
            <Input
              id="confirmPassword"
              type="password"
              required
              disabled={isLoading}
              // Added pr-10 to ensure text doesn't overlap the icon
              className="bg-background h-10 pr-10" 
              {...register("confirmPassword")}
            />
            
            {/* Logic: Show check if confirmPassword matches password and is not empty */}
            {confirmPasswordValue && confirmPasswordValue === passwordValue && (
              <div className="absolute right-3 flex items-center pointer-events-none text-emerald-500 animate-in zoom-in duration-300">
                <Check className="h-4 w-4 stroke-[3px]" />
              </div>
            )}
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600 mt-0">{errors.confirmPassword.message}</p>
          )}
          <FieldDescription>Please confirm your password.</FieldDescription>
        </Field>
        <Field>
          <Button 
            type="submit" 
            className="h-10 shadow-[0_20px_40px_-24px_color-mix(in_oklab,var(--primary)_75%,transparent)]"
            size={"lg"} 
            disabled={isLoading}
          >
            {isLoading ? "Creating account…" : "Create Account"}
          </Button>
        </Field>
        <Field>
          <FieldDescription className="px-6 text-center">
            Already have an account? <Link href="/auth/login">Log in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
