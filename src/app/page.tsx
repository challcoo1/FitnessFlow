"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { suggestWorkout } from "@/ai/flows/suggest-workout";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";

export default function Home() {
  const [fitnessData, setFitnessData] = useState("");
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    setRecommendations(null);
    try {
      const result = await suggestWorkout({ workoutData: fitnessData });
      setRecommendations(result?.recommendations || "No recommendations.");
      toast({
        title: "Workout recommendations generated!",
        description: "Check out your personalized workout plan.",
      });
    } catch (error: any) {
      console.error("Error generating recommendations:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.message || "Failed to generate workout recommendations.",
      });
      setRecommendations("Failed to generate workout recommendations.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-background">
      <Toaster />
      <div className="container max-w-2xl px-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Fitness Scribe</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Textarea
              placeholder="Enter your fitness data here..."
              value={fitnessData}
              onChange={(e) => setFitnessData(e.target.value)}
              className="resize-none"
            />
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-accent text-accent-foreground hover:bg-accent/80"
            >
              {isLoading ? "Generating..." : "Get Recommendations"}
            </Button>

            {recommendations && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold">Recommendations:</h2>
                <p className="text-muted-foreground">{recommendations}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
