import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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

interface Structure {
  slug: string;
  name: string;
}

const API_BASE_URL = "https://bearound.onrender.com";

const SearchForm: React.FC = () => {
  const navigate = useNavigate();
  const [selectedStructure, setSelectedStructure] = useState<string>("");
  const [structures, setStructures] = useState<Structure[]>([]);
  const [loadingStructures, setLoadingStructures] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<ExperienceType | null>(null);
  const [maxDistance, setMaxDistance] = useState<number>(30);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );

  useEffect(() => {
    const fetchStructures = async () => {
      try {
        setLoadingStructures(true);
        const response = await fetch(
          `${API_BASE_URL}/structures/select-all-names`,
        );
        if (response.ok) {
          const data = await response.json();
          setStructures(data);
        } else {
          console.error("Failed to fetch structures");
        }
      } catch (error) {
        console.error("Error fetching structures:", error);
      } finally {
        setLoadingStructures(false);
      }
    };

    fetchStructures();
  }, []);

  const handleSearch = () => {
    if (!selectedStructure || !selectedDate) {
      // Show validation error
      return;
    }

    // Create from and to dates for the selected day
    const fromDate = new Date(selectedDate);
    fromDate.setHours(0, 0, 0, 0);

    const toDate = new Date(selectedDate);
    toDate.setHours(23, 59, 59, 999);

    // Format dates to ISO string for API
    const fromDateISO = fromDate.toISOString();
    const toDateISO = toDate.toISOString();

    // Build query parameters
    const params = new URLSearchParams();
    params.append("structureId", selectedStructure);
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
    <CardContent className="p-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="structure" className="text-body font-medium">
            Struttura
          </Label>
          <Select
            value={selectedStructure}
            onValueChange={setSelectedStructure}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  loadingStructures
                    ? "Caricamento..."
                    : "Seleziona una struttura"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {structures.map((structure) => (
                <SelectItem key={structure.slug} value={structure.slug}>
                  {structure.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-body font-medium">Experience Type</Label>
          <div className="flex flex-wrap gap-2">
            {experienceTypes.map((type) => (
              <Badge
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                className="cursor-pointer hover:bg-secondary hover:text-secondary-foreground transition-colors"
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
            <Label htmlFor="maxDistance" className="text-body font-medium">
              Maximum Distance (minutes)
            </Label>
            <span className="text-detail text-muted-foreground">
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

        <div className="space-y-2">
          <Label className="text-body font-medium">Data</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "PPP")
                ) : (
                  <span>Seleziona una data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button
          className="w-full"
          onClick={handleSearch}
          disabled={!selectedStructure || !selectedDate || loadingStructures}
        >
          CERCA ESPERIENZE
        </Button>
      </div>
    </CardContent>
  );
};

export default SearchForm;
