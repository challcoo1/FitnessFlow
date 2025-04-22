"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { suggestWorkout } from "@/ai/flows/suggest-workout";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { parseDataPoint } from "@/ai/flows/parse-data-point";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

type DailyData = {
  [date: string]: {
    fitnessData: string;
    recommendations: string | null;
    parsedData: any | null;
  };
};

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [fitnessData, setFitnessData] = useState("");
  const [dailyData, setDailyData] = useState<DailyData>({});
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedData, setParsedData] = useState<any | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem("dailyData");
    if (storedData) {
      setDailyData(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      setFitnessData(dailyData[formattedDate]?.fitnessData || "");
      setRecommendations(dailyData[formattedDate]?.recommendations || null);
      setParsedData(dailyData[formattedDate]?.parsedData || null);
    }
  }, [selectedDate, dailyData]);

  useEffect(() => {
    localStorage.setItem("dailyData", JSON.stringify(dailyData));
  }, [dailyData]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const updateDailyData = (
    date: string,
    newData: {
      fitnessData: string;
      recommendations: string | null;
      parsedData: any | null;
    }
  ) => {
    setDailyData((prevData) => ({
      ...prevData,
      [date]: newData,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setRecommendations(null);
    try {
      const result = await suggestWorkout({ workoutData: fitnessData });
      const newRecommendations = result?.recommendations || "No recommendations.";
      setRecommendations(newRecommendations);
      toast({
        title: "Workout recommendations generated!",
        description: "Check out your personalized workout plan.",
      });

      if (selectedDate) {
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        updateDailyData(formattedDate, {
          fitnessData,
          recommendations: newRecommendations,
          parsedData: parsedData || null,
        });
      }
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

      if (selectedDate) {
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        updateDailyData(formattedDate, {
          fitnessData,
          recommendations: recommendations || null,
          parsedData: result,
        });
      }
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
      <div className="container max-w-4xl px-4">
        <Card className="w-full mb-4">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border"
            />
            {selectedDate ? (
              <p>
                Selected Date: {format(selectedDate, "PPP")}
              </p>
            ) : (
              <p>Please select a date.</p>
            )}
          </CardContent>
        </Card>

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
                <Card>
                  <CardContent>
                    <div className="grid gap-2">
                      <div className="flex items-center space-x-2">
                        <Label>Type:</Label>
                        <span className="font-medium">{parsedData.type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label>Value:</Label>
                        <span className="font-medium">{parsedData.value}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
