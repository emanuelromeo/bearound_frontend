import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

interface Experience {
  slug: string;
  name: string;
  cover: string;
  price: number;
  type: string;
}

interface ExperienceGridProps {
  experiences: Experience[];
  isLoading?: boolean;
}

const ExperienceGrid = ({
  experiences = [],
  isLoading = false,
}: ExperienceGridProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-lg text-center text-muted-foreground">
          Stiamo cercando le tue esperienze
        </p>
      </div>
    );
  }

  if (experiences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-background">
        <p className="text-lg text-center text-muted-foreground">
          Nessuna esperienza trovata
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 bg-background">
      {experiences.map((experience) => (
        <ExperienceCard key={experience.slug} experience={experience} />
      ))}
    </div>
  );
};

interface ExperienceCardProps {
  experience: Experience;
}

const ExperienceCard = ({ experience }: ExperienceCardProps) => {
  const { slug, name, cover, price } = experience;
  const externalUrl = `https://www.bearound.eu/esperienze/${slug}`;

  return (
    <a
      href={externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
    >
      <Card className="h-full overflow-hidden">
        <div className="aspect-[4/3] relative overflow-hidden rounded-t-lg">
          {cover ? (
            <img
              src={
                cover.startsWith("http")
                  ? cover
                  : `https://www.bearound.eu${cover}`
              }
              alt={name}
              className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  "https://images.unsplash.com/photo-1571983823232-07c35b70baae?w=800&q=80";
              }}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Skeleton className="w-full h-full" />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium text-lg mb-1 line-clamp-2">{name}</h3>
          <p className="text-sm text-muted-foreground">
            A partire da {price}€ a persona
          </p>
        </CardContent>
      </Card>
    </a>
  );
};

export default ExperienceGrid;
