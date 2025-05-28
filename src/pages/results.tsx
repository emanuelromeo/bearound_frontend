import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import ExperienceGrid from "../components/ExperienceGrid";

interface Experience {
  slug: string;
  name: string;
  cover: string;
  price: number;
  type: string;
}

const API_BASE_URL = "https://bearound.onrender.com";

const Results = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get search params from URL
        const searchParams = new URLSearchParams(location.search);

        // Debug log to check search params
        console.log("Search params:", searchParams.toString());

        if (!searchParams.toString()) {
          setLoading(false);
          return;
        }

        // Make API request
        const response = await fetch(
          `${API_BASE_URL}/form/search-for-structure?${searchParams.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch experiences");
        }

        const data = await response.json();
        console.log("API response data:", data);
        setExperiences(data);
      } catch (err) {
        console.error("API error:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
      } finally {
        setLoading(false);
      }
    };

    if (location.search) {
      fetchExperiences();
    }
  }, [location.search]);

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Search Results</h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">
              Stiamo cercando le tue esperienze
            </p>
          </div>
        ) : error ? (
          <div className="p-6 bg-destructive/10 rounded-lg text-center">
            <p className="text-destructive font-medium">{error}</p>
            <button
              onClick={() => window.history.back()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Go Back
            </button>
          </div>
        ) : experiences.length === 0 ? (
          <div className="p-6 bg-muted rounded-lg text-center">
            <p className="text-muted-foreground">
              No experiences found matching your search criteria.
            </p>
            <button
              onClick={() => window.history.back()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Go Back
            </button>
          </div>
        ) : (
          <ExperienceGrid experiences={experiences} />
        )}
      </div>
    </div>
  );
};

export default Results;
