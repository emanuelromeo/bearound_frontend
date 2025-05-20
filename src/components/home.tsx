import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import SearchForm from "./SearchForm";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Trova la tua esperienza ideale
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Cerca tra le migliori esperienze disponibili nelle vicinanze
          </p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <SearchForm />
          </CardContent>
        </Card>

        <div className="flex flex-col items-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">
            Esperienze popolari
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {popularExperiences.map((experience) => (
              <Card
                key={experience.slug}
                className="overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48">
                  <img
                    src={experience.cover}
                    alt={experience.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-900">
                    {experience.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    A partire da {experience.price}€ a persona
                  </p>
                  <Button asChild className="w-full mt-3">
                    <Link
                      to={`https://www.bearound.eu/esperienze/${experience.slug}`}
                    >
                      Scopri di più
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button variant="outline" asChild>
            <Link to="/results">Vedi tutte le esperienze</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

// Mock data for popular experiences
const popularExperiences = [
  {
    slug: "escursione-montagna",
    name: "Escursione in montagna",
    cover:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80",
    price: 45,
  },
  {
    slug: "degustazione-vini",
    name: "Degustazione vini locali",
    cover:
      "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80",
    price: 35,
  },
  {
    slug: "giro-in-barca",
    name: "Giro in barca al tramonto",
    cover:
      "https://images.unsplash.com/photo-1468413253725-0d5181091126?w=800&q=80",
    price: 60,
  },
];

export default Home;
