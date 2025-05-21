import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Experience {
  name: string;
  slug: string;
}

const ThankYou = () => {
  const [searchParams] = useSearchParams();
  const experienceSlug = searchParams.get("experience");
  const [experience, setExperience] = useState<Experience | null>(null);

  useEffect(() => {
    // In a real application, you might want to fetch the experience details
    // based on the slug to display more information
    if (experienceSlug) {
      setExperience({
        name: "La tua esperienza",
        slug: experienceSlug,
      });
    }
  }, [experienceSlug]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-2">Grazie per il tuo acquisto!</h1>

        <p className="text-gray-600 mb-6">
          {experience ? (
            <>
              La tua prenotazione per{" "}
              <span className="font-medium">{experience.name}</span> è stata
              confermata.
            </>
          ) : (
            "La tua prenotazione è stata confermata."
          )}
        </p>

        <p className="text-sm text-gray-500 mb-8">
          Riceverai presto una email con tutti i dettagli della tua
          prenotazione.
        </p>

        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link to="/">Torna alla home</Link>
          </Button>

          {experience && (
            <Button variant="outline" asChild className="w-full">
              <a
                href={`https://www.bearound.eu/esperienze/${experience.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visualizza esperienza
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
