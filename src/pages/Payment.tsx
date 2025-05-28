import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const API_BASE_URL = "https://bearound.onrender.com";

const stripePromise = loadStripe(
  "pk_live_51PTS8HLAayUIdszrvPRxa7HleENc28pHgkqM1QXQxNqgW7ABCTnvyNal7Gb5DuO2TysewfkFM1Lj7INFLoaUQzAW00aN9ubVQU",
); // la tua chiave pubblica

interface PaymentParams {
  experienceSlug: string;
  structureSlug: string;
}

const PaymentForm = ({
  clientSecret,
  experienceSlug,
}: {
  clientSecret: string;
  experienceSlug: string;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/thank-you?experience=${experienceSlug}`,
      },
    });

    if (error) {
      setError(error.message || "Errore durante il pagamento");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handlePayment} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Metodo di pagamento</label>
        <div className="border p-3 rounded-md">
          <PaymentElement />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Conferma pagamento...
          </>
        ) : (
          "Conferma pagamento"
        )}
      </Button>
    </form>
  );
};

const Payment = () => {
  const { experienceSlug, structureSlug } = useParams<PaymentParams>();
  const [date, setDate] = useState<Date>();
  const [participants, setParticipants] = useState<number>(1);
  const [needsTransport, setNeedsTransport] = useState<boolean>(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isCheckingAvailability, setIsCheckingAvailability] =
    useState<boolean>(false);

  useEffect(() => {
    if (experienceSlug) {
      setIsCheckingAvailability(true);
      setAvailableDates([]); // Reset available dates when month changes
      fetchAvailableDates(currentMonth);
    }
  }, [experienceSlug, currentMonth]);

  const fetchAvailableDates = async (month: Date) => {
    if (!experienceSlug) return;

    try {
      setIsCheckingAvailability(true);
      const from = startOfMonth(month);
      const to = endOfMonth(month);
      const availableDatesInMonth: Date[] = [];

      // Check each day individually
      let currentDate = new Date(from);

      while (currentDate <= to) {
        // Create start and end of the current day (00:00 to 23:59)
        const dayStart = new Date(currentDate);
        dayStart.setHours(0, 0, 0, 0);

        const dayEnd = new Date(currentDate);
        dayEnd.setHours(23, 59, 59, 999);

        // Format without timezone offset
        const fromFormatted = format(dayStart, "yyyy-MM-dd'T'HH:mm:ss");
        const toFormatted = format(dayEnd, "yyyy-MM-dd'T'HH:mm:ss");

        const response = await fetch(
          `${API_BASE_URL}/experiences/is-available?id=${experienceSlug}&from=${fromFormatted}&to=${toFormatted}&zoneId=Europe/Rome`,
        );

        if (response.ok) {
          const isAvailable = await response.json();
          if (isAvailable) {
            // If this specific day is available, add it to the list
            availableDatesInMonth.push(new Date(currentDate));
          }
        }

        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Update the available dates state with only the current month's dates
      setAvailableDates(availableDatesInMonth);
    } catch (err) {
      console.error("Error fetching available dates:", err);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleMonthChange = (month: Date) => {
    console.log("Month changed to:", month);
    setCurrentMonth(month);
  };

  const handleCreateIntent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!experienceSlug || !structureSlug || !date) {
      setError("Compila tutti i campi");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm:ss");

      const response = await fetch(
        `${API_BASE_URL}/api/payment/create-payment-intent`,
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

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (err) {
      console.error(err);
      setError("Errore durante la creazione del pagamento");
    } finally {
      setLoading(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-10">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Prenota la tua esperienza</h1>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateIntent} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Data dell'esperienza
              </label>
              <div className="border rounded-md p-2">
                {isCheckingAvailability ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground text-center">
                      Stiamo controllando la disponibilità per questa esperienza
                    </p>
                  </div>
                ) : (
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    month={currentMonth}
                    disabled={(d) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);

                      // Disable dates in the past and dates not in availableDates
                      return (
                        d < today ||
                        !availableDates.some(
                          (availableDate) =>
                            availableDate.getDate() === d.getDate() &&
                            availableDate.getMonth() === d.getMonth() &&
                            availableDate.getFullYear() === d.getFullYear(),
                        )
                      );
                    }}
                    onMonthChange={handleMonthChange}
                    className="mx-auto"
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="participants"
                className="block text-sm font-medium"
              >
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
                className="h-4 w-4"
              />
              <label htmlFor="transport" className="text-sm font-medium">
                Ho bisogno di trasporto
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Elaborazione...
                </>
              ) : (
                "Procedi al pagamento"
              )}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm
            clientSecret={clientSecret}
            experienceSlug={experienceSlug!}
          />
        </Elements>
      </div>
    </div>
  );
};

export default Payment;
