import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

interface PaymentParams {
  experienceSlug?: string;
  structureSlug?: string;
}

const Payment = () => {
  const { experienceSlug, structureSlug } = useParams<PaymentParams>();
  const navigate = useNavigate();

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [participants, setParticipants] = useState<number>(1);
  const [needsTransport, setNeedsTransport] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      setError("Seleziona una data per l'esperienza");
      return;
    }

    if (!experienceSlug || !structureSlug) {
      setError("Informazioni sull'esperienza mancanti");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm:ssXXX");

      const response = await fetch(
        "http://localhost:8080/api/payment/create-payment-intent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            experienceSlug,
            structureSlug,
            numberOfParticipants: participants.toString(),
            date: formattedDate,
            needsTransport: needsTransport.toString(),
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Errore durante la creazione del pagamento");
      }

      const { clientSecret } = await response.json();

      // Initialize Stripe
      const stripe = await loadStripe(
        "pk_live_51PTS8HLAayUIdszrvPRxa7HleENc28pHgkqM1QXQxNqgW7ABCTnvyNal7Gb5DuO2TysewfkFM1Lj7INFLoaUQzAW00aN9ubVQU",
      );

      if (stripe) {
        // Use confirmPayment instead of redirectToCheckout for PaymentIntents
        const { error } = await stripe.confirmPayment({
          clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/thank-you?experience=${experienceSlug}`,
          },
        });

        if (error) {
          setError(error.message || "Si è verificato un errore");
        }
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Si è verificato un errore durante il pagamento",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Prenota la tua esperienza</h1>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Data dell'esperienza
            </label>
            <div className="border rounded-md p-2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date()}
                className="mx-auto"
              />
            </div>
            {date && (
              <p className="text-sm text-muted-foreground">
                Data selezionata: {format(date, "dd/MM/yyyy")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="participants" className="block text-sm font-medium">
              Numero di partecipanti
            </label>
            <Input
              id="participants"
              type="number"
              min="1"
              value={participants}
              onChange={(e) => setParticipants(parseInt(e.target.value) || 1)}
              className="w-full"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="transport"
              type="checkbox"
              checked={needsTransport}
              onChange={(e) => setNeedsTransport(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="transport" className="text-sm font-medium">
              Ho bisogno di trasporto
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !date}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Elaborazione in corso...
              </>
            ) : (
              "Procedi al pagamento"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Payment;
