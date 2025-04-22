"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { suggestWorkout } from "@/ai/flows/suggest-workout";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { parseDataPoint } from "@/ai/flows/parse-data-point";

export default function Home() {
  const [fitnessData, setFitnessData] = useState("");
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedData, setParsedData] = useState<any | null>(null);
  const [isParsing, setIsParsing] = useState(false);

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

  const handleParseData = async () => {
    setIsParsing(true);
    setParsedData(null);
    try {
      const result = await parseDataPoint({ text: fitnessData });
      setParsedData(result);
      toast({
        title: "Data parsed!",
        description: "Check out the parsed data.",
      });
    } catch (error: any) {
      console.error("Error parsing data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to parse data.",
      });
      setParsedData(null);
    } finally {
      setIsParsing(false);
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
            <div className="flex space-x-2">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-accent text-accent-foreground hover:bg-accent/80"
              >
                {isLoading ? "Generating..." : "Get Recommendations"}
              </Button>
              <Button
                onClick={handleParseData}
                disabled={isParsing}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                {isParsing ? "Parsing..." : "Parse Data"}
              </Button>
            </div>

            {parsedData && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold">Parsed Data:</h2>
                <pre className="text-muted-foreground">{JSON.stringify(parsedData, null, 2)}</pre>
              </div>
            )}

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
