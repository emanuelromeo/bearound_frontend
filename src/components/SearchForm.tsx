import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";

type ExperienceType =
  | "HIKING"
  | "WELLNESS"
  | "TASTING"
  | "HORSES"
  | "BOATS"
  | "SPORT"
  | "ANIMALS"
  | "SNOW"
  | "NIGHT";

const experienceTypes: ExperienceType[] = [
  "HIKING",
  "WELLNESS",
  "TASTING",
  "HORSES",
  "BOATS",
  "SPORT",
  "ANIMALS",
  "SNOW",
  "NIGHT",
];

const SearchForm: React.FC = () => {
  const navigate = useNavigate();
  const [structureId, setStructureId] = useState<string>("");
  const [selectedType, setSelectedType] = useState<ExperienceType | null>(null);
  const [maxDistance, setMaxDistance] = useState<number>(30);
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date());
  const [toDate, setToDate] = useState<Date | undefined>(new Date());

  const handleSearch = () => {
    if (!structureId || !fromDate || !toDate) {
      // Show validation error
      return;
    }

    // Format dates to ISO string for API
    const fromDateISO = fromDate.toISOString();
    const toDateISO = toDate.toISOString();

    // Build query parameters
    const params = new URLSearchParams();
    params.append("structureId", structureId);
    params.append("from", fromDateISO);
    params.append("to", toDateISO);

    if (selectedType) {
      params.append("type", selectedType);
    }

    if (maxDistance) {
      params.append("maxDistanceInMinutes", maxDistance.toString());
    }

    // Add default zoneId
    params.append("zoneId", "Europe/Rome");

    // Log the parameters being sent
    console.log("Search parameters:", params.toString());

    // Navigate to results page with query parameters
    navigate({
      pathname: "/results",
      search: params.toString(),
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white shadow-md">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="structureId">Structure ID</Label>
            <Input
              id="structureId"
              placeholder="Enter structure ID"
              value={structureId}
              onChange={(e) => setStructureId(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Experience Type</Label>
            <div className="flex flex-wrap gap-2">
              {experienceTypes.map((type) => (
                <Badge
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80 transition-colors"
                  onClick={() =>
                    setSelectedType(type === selectedType ? null : type)
                  }
                >
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="maxDistance">Maximum Distance (minutes)</Label>
              <span className="text-sm text-muted-foreground">
                {maxDistance} min
              </span>
            </div>
            <Slider
              id="maxDistance"
              min={5}
              max={120}
              step={5}
              value={[maxDistance]}
              onValueChange={(values) => setMaxDistance(values[0])}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? (
                      format(fromDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={setFromDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={setToDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleSearch}
            disabled={!structureId || !fromDate || !toDate}
          >
            Search Experiences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchForm;
