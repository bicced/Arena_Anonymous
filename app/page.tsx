"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"

const ONE_MINUTE = 60000; // 60,000 milliseconds

export default function Home() {
  const { setTheme } = useTheme();
  setTheme("dark");
  const { toast } = useToast()
  const [lastPostTime, setLastPostTime] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(0);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  const form = useForm({
    defaultValues: {
      post: "",
    },
  })

  useEffect(() => {
    // Load last post time from localStorage
    const storedLastPostTime = localStorage.getItem('lastPostTime');
    if (storedLastPostTime) {
      const parsedTime = parseInt(storedLastPostTime, 10);
      setLastPostTime(parsedTime);
      const remainingTime = Math.max(0, ONE_MINUTE - (Date.now() - parsedTime));
      setCountdown(Math.ceil(remainingTime / 1000));
    }

    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown > 0) {
          return prevCountdown - 1;
        }
        return 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  async function onSubmit(values: any) {
    setIsDisabled(true);

    const now = Date.now();
    if (now - lastPostTime < ONE_MINUTE) {
      toast({
        title: "Error",
        description: `Please wait ${countdown} seconds before posting again.`,
        variant: "destructive",
      });
      setIsDisabled(false);
      return;
    }

    try {
      const response = await fetch("/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Success",
        description: "Your post has been submitted successfully",
      });

      form.reset();
      setLastPostTime(now);
      localStorage.setItem('lastPostTime', now.toString());
      setCountdown(60);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while processing your request",
        variant: "destructive",
      });
    }
    setIsDisabled(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4 py-12">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="flex items-center space-x-4 mb-6">
          <Avatar className="h-12 w-12">
            <AvatarImage src="/anonymousicon.webp" alt="Anonymous Icon" />
            <AvatarFallback>AN</AvatarFallback>
          </Avatar>
          <h1 className="text-3xl font-bold text-white">Arena Anonymous</h1>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="post"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="What's happening?" 
                      {...field} 
                      className="bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-blue-500"
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isDisabled} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Submit</Button>
            <p className="text-sm text-gray-400 text-center mt-4">
              This will be posted to the arena anonymously under @Arena_Anonymous
            </p>
          </form>
        </Form>
      </div>
      <Toaster />
    </div>
  );
}
