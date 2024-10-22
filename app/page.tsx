"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input";

const ONE_MINUTE = 60000; // 60,000 milliseconds

export default function Home() {
  const { setTheme } = useTheme();
  setTheme("dark");
  const { toast } = useToast()
  const [lastPostTime, setLastPostTime] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  const form = useForm({
    defaultValues: {
      content: "",
      postURL: "",
    },
  })

  const updateRemainingTime = useCallback(() => {
    const now = Date.now();
    const timeSinceLastPost = now - lastPostTime;
    const newRemainingTime = Math.max(0, ONE_MINUTE - timeSinceLastPost);
    setRemainingTime(Math.ceil(newRemainingTime / 1000));
  }, [lastPostTime]);

  useEffect(() => {
    const storedLastPostTime = localStorage.getItem('lastPostTime');
    if (storedLastPostTime) {
      const parsedTime = parseInt(storedLastPostTime, 10);
      setLastPostTime(parsedTime);
      updateRemainingTime();
    }

    const timer = setInterval(updateRemainingTime, 1000);
    return () => clearInterval(timer);
  }, [updateRemainingTime]);

  const handleSubmit = useCallback(async (values: any, endpoint: string) => {
    setIsDisabled(true);

    const now = Date.now();
    if (now - lastPostTime < ONE_MINUTE) {
      toast({
        title: "Error",
        description: `Please wait ${remainingTime} seconds before posting again.`,
        variant: "destructive",
      });
      setIsDisabled(false);
      return;
    }

    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Success",
        description: "Your post has been submitted successfully",
      });

      form.reset({
        content: "",
        postURL: "",
      });
      
      setLastPostTime(now);
      localStorage.setItem('lastPostTime', now.toString());
      updateRemainingTime();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while processing your request",
        variant: "destructive",
      });
    }
    setIsDisabled(false);
  }, [form, lastPostTime, remainingTime, toast, updateRemainingTime]);

  const onSubmitPost = useCallback((values: any) => handleSubmit(values, "post"), [handleSubmit]);
  const onSubmitComment = useCallback((values: any) => handleSubmit(values, "comment"), [handleSubmit]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4 py-12">
      <div className="w-full max-w-md bg-gray-800 p-4 sm:p-8 rounded-lg shadow-lg">
        <div className="flex flex-col sm:flex-row items-center sm:space-x-4 mb-6">
          <Avatar className="h-12 w-12 mb-2 sm:mb-0">
            <AvatarImage src="/anonymousicon.webp" alt="Anonymous Icon" />
            <AvatarFallback>AN</AvatarFallback>
          </Avatar>
          <h1 className="text-2xl sm:text-3xl font-bold text-white text-center sm:text-left">Arena Anonymous</h1>
        </div>
        <Tabs defaultValue="create" className="w-full max-w-[400px] mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Post</TabsTrigger>
            <TabsTrigger value="comment">Comment on Post</TabsTrigger>
          </TabsList>
          <TabsContent value="create">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitPost)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post</FormLabel>
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
                <Button 
                  disabled={isDisabled || remainingTime > 0} 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {remainingTime > 0 ? `Wait ${remainingTime}s` : "Submit"}
                </Button>
                
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="comment">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitComment)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="postURL"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://arena.social/Arena_Anonymous/status/8d1ca657-f160-4da0-a46e-c0dd9b768c98" 
                          {...field} 
                          className="bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comment</FormLabel>
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
                <Button 
                  disabled={isDisabled || remainingTime > 0} 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {remainingTime > 0 ? `Wait ${remainingTime}s` : "Submit"}
                </Button>
                
              </form>
            </Form>
          </TabsContent>
        </Tabs>
        <p className="text-sm text-gray-400 text-center mt-4">
          This will be posted to the arena anonymously under @Arena_Anonymous
        </p>
      </div>
      <Toaster />
    </div>
  );
}
