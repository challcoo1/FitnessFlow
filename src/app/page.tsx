'use client';

import { useState, useEffect, useCallback } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { onAuthStateChanged, signOut, User } from "firebase/auth"; 
import { auth } from "@/lib/firebaseConfig";
// Import Firestore utility functions and types
import { saveFitnessEntry, loadFitnessEntry, FitnessEntryData } from "@/lib/firestoreUtils";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [fitnessData, setFitnessData] = useState("");
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any | null>(null); // Keep this for UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false); // State for loading data from Firestore

  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // --- Authentication Effect --- 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) { 
        // Clear data if user logs out
        setFitnessData("");
        setRecommendations(null);
        setParsedData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- Data Loading Effect (depends on user and selectedDate) --- 
  const loadDataForDate = useCallback(async (userId: string, date: Date) => {
    setIsDataLoading(true);
    const formattedDate = format(date, "yyyy-MM-dd");
    try {
      const entryData = await loadFitnessEntry(userId, formattedDate);
      if (entryData) {
        setFitnessData(entryData.fitnessData);
        setRecommendations(entryData.recommendations);
        setParsedData(entryData.parsedData);
      } else {
        // No data for this date, reset fields
        setFitnessData("");
        setRecommendations(null);
        setParsedData(null);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      toast({
        variant: "destructive",
        title: "Error Loading Data",
        description: "Could not load fitness data for the selected date.",
      });
      // Reset fields on error
       setFitnessData("");
       setRecommendations(null);
       setParsedData(null);
    } finally {
      setIsDataLoading(false);
    }
  }, []); // useCallback dependencies are empty as it relies on passed args

  useEffect(() => {
    if (user && selectedDate) {
      loadDataForDate(user.uid, selectedDate);
    }
     // If no user or no date, do nothing (fields are cleared on logout or if no data)
  }, [user, selectedDate, loadDataForDate]); // Rerun when user, date, or the function itself changes

  // --- Data Saving Helper --- 
  const saveDataForDate = async (userId: string, date: Date, dataToSave: Partial<FitnessEntryData>) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    // Construct the full data object to save, including potentially existing fields
    const currentData: FitnessEntryData = {
        fitnessData: dataToSave.fitnessData !== undefined ? dataToSave.fitnessData : fitnessData,
        recommendations: dataToSave.recommendations !== undefined ? dataToSave.recommendations : recommendations,
        parsedData: dataToSave.parsedData !== undefined ? dataToSave.parsedData : parsedData
    };
    try {
        await saveFitnessEntry(userId, formattedDate, currentData);
        console.log("Data saved for", formattedDate)
    } catch (error) {
        console.error("Failed to save data:", error);
         toast({
            variant: "destructive",
            title: "Error Saving Data",
            description: "Could not save fitness data.",
        });
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    // Data loading is handled by the useEffect hook watching selectedDate
  };

  // --- Action Handlers (handleSubmit, handleParseData) --- 
  const handleSubmit = async () => {
    if (!user || !selectedDate) return; // Need user and date

    setIsLoading(true);
    setRecommendations(null); // Clear previous recommendations
    let newRecommendations: string | null = null;
    try {
      const result = await suggestWorkout({ workoutData: fitnessData });
      newRecommendations = result?.recommendations || "No recommendations.";
      setRecommendations(newRecommendations);
      toast({
        title: "Workout recommendations generated!",
        description: "Check out your personalized workout plan.",
      });
      
      // Save updated data (including new recommendations) to Firestore
      await saveDataForDate(user.uid, selectedDate, { 
        fitnessData: fitnessData, // Current fitness data
        recommendations: newRecommendations // The newly generated recommendations
        // parsedData is not directly changed here, so we don't need to pass it
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
    if (!user || !selectedDate) return; // Need user and date

    setIsParsing(true);
    setParsedData(null); // Clear previous parsed data
    let newParsedData: any | null = null;
    try {
      const result = await parseDataPoint({ text: fitnessData });
      newParsedData = result;
      setParsedData(newParsedData);
      toast({
        title: "Data parsed!",
        description: "Check out the parsed data.",
      });
      
      // Save updated data (including new parsed data) to Firestore
      await saveDataForDate(user.uid, selectedDate, { 
        fitnessData: fitnessData, // Current fitness data
        parsedData: newParsedData // The newly parsed data
        // recommendations are not directly changed here
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

  // --- Handle changes to fitnessData textarea --- 
  const handleFitnessDataChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newData = e.target.value;
      setFitnessData(newData);
      // Debounced save or save on blur might be better here, but for simplicity, save on change
      // Be cautious with saving on every keystroke in a real app (cost/performance)
      if (user && selectedDate) {
          await saveDataForDate(user.uid, selectedDate, { fitnessData: newData });
      }
  }

  const handleLogout = async () => {
    // ... (keep existing handleLogout function)
    try {
      await signOut(auth);
      toast({ title: "Logged out successfully." });
    } catch (error) {
      console.error("Logout Error:", error);
      toast({ variant: "destructive", title: "Logout Failed", description: "Could not log you out." });
    }
  };

  // Show loading indicator while checking auth state
  if (authLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Loading Auth...</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-6 bg-background">
      <Toaster />
      <div className="container max-w-4xl px-4">

        {!user ? (
          // --- Auth Forms --- 
          <Tabs defaultValue="login" className="w-full max-w-md mx-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-4">
              <LoginForm />
            </TabsContent>
            <TabsContent value="signup" className="mt-4">
              <SignupForm />
            </TabsContent>
          </Tabs>
        ) : (
          // --- Fitness Tracker UI (Authenticated User) --- 
          <div className="space-y-4">
             <div className="flex justify-between items-center mb-4">
               <p className="text-sm text-muted-foreground">Welcome, {user.email || 'User'}!</p>
               <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
             </div>

            <Card className="w-full">
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className="rounded-md border"
                  disabled={isDataLoading} // Disable calendar while loading data
                />
                {selectedDate ? (
                  <p>
                    Selected Date: {format(selectedDate, "PPP")}
                  </p>
                ) : (
                  <p>Please select a date.</p>
                )}
                 {isDataLoading && <p>Loading data for selected date...</p>}
              </CardContent>
            </Card>

            <Card className="w-full">
              <CardHeader>
                <CardTitle>Fitness Scribe</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col space-y-4">
                <Textarea
                  placeholder={isDataLoading ? "Loading..." : "Enter your fitness data here..."}
                  value={fitnessData}
                  onChange={handleFitnessDataChange} // Use the new handler
                  className="resize-none"
                  disabled={isDataLoading || !selectedDate} // Disable if loading or no date selected
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading || isDataLoading || !fitnessData}
                    className="bg-accent text-accent-foreground hover:bg-accent/80"
                  >
                    {isLoading ? "Generating..." : "Get Recommendations"}
                  </Button>
                  <Button
                    onClick={handleParseData}
                    disabled={isParsing || isDataLoading || !fitnessData}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  >
                    {isParsing ? "Parsing..." : "Parse Data"}
                  </Button>
                </div>

                {/* Parsed Data Display */} 
                {parsedData && (
                  <div className="mt-4">
                    <h2 className="text-lg font-semibold">Parsed Data:</h2>
                    {/* Simplified display, adapt as needed */}
                    <pre className="p-2 text-sm bg-muted rounded-md overflow-x-auto">
                      {JSON.stringify(parsedData, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Recommendations Display */} 
                {recommendations && (
                  <div className="mt-4">
                    <h2 className="text-lg font-semibold">Recommendations:</h2>
                    <p className="text-muted-foreground">{recommendations}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
