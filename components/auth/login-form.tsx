import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { loginSchema } from "@/lib/schemas/auth";

type FormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // TODO: Implement API call
      console.log(data);
      toast({
        title: "Login Successful",
        description: "Welcome back to UseSafe.",
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-4">
          <Button type="submit" className="w-full">
            Sign In
          </Button>
          
          <div className="text-center space-y-2">
            <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
            <div className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-primary hover:underline">
                Register here
              </Link>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}