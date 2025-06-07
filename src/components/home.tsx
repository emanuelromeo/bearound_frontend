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
      </div>
    </div>
  );
};

export default Home;
