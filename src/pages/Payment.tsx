import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
}

interface Structure {
  slug: string;
  name: string;
}

const PaymentForm = ({
  clientSecret,
  experienceSlug,
  totalAmount,
  onPaymentSuccess,
  onPaymentError,
}: {
  clientSecret: string;
  experienceSlug: string;
  totalAmount?: number;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      const errorMessage = error.message || "Errore durante il pagamento";
      setError(errorMessage);
      onPaymentError(errorMessage);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      // Payment successful, show thank you message
      onPaymentSuccess();
    } else {
      const errorMessage = "Il pagamento non è stato completato correttamente";
      setError(errorMessage);
      onPaymentError(errorMessage);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handlePayment} className="space-y-6">
      <div className="flex justify-between items-center">
        <span className="text-subtitle font-semibold">Totale:</span>
        <span className="text-title font-semibold text-primary">
          €
          {totalAmount !== undefined && totalAmount !== null
            ? (totalAmount / 100).toFixed(2)
            : "0.00"}
        </span>
      </div>

      <div className="space-y-2">
        <label className="block text-body font-medium">
          Metodo di pagamento
        </label>
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
            CONFERMA PAGAMENTO...
          </>
        ) : (
          "CONFERMA PAGAMENTO"
        )}
      </Button>
    </form>
  );
};

const Payment = () => {
  const { experienceSlug } = useParams<PaymentParams>();
  const [date, setDate] = useState<Date>();
  const [participants, setParticipants] = useState<number>(1);
  const [needsTransport, setNeedsTransport] = useState<boolean>(false);
  const [selectedStructure, setSelectedStructure] = useState<string>("");
  const [structures, setStructures] = useState<Structure[]>([]);
  const [loadingStructures, setLoadingStructures] = useState<boolean>(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isCheckingAvailability, setIsCheckingAvailability] =
    useState<boolean>(false);
  const [paymentCompleted, setPaymentCompleted] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    if (experienceSlug) {
      setIsCheckingAvailability(true);
      setAvailableDates([]); // Reset available dates when month changes
      fetchAvailableDates(currentMonth);
    }
  }, [experienceSlug, currentMonth]);

  useEffect(() => {
    if (needsTransport && structures.length === 0) {
      fetchStructures();
    }
  }, [needsTransport]);

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
    if (!experienceSlug || !date) {
      setError("Compila tutti i campi obbligatori");
      return;
    }

    if (needsTransport && !selectedStructure) {
      setError("Seleziona una struttura per il trasporto");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm:ss");

      const requestBody = new URLSearchParams({
        experienceSlug,
        numberOfParticipants: participants.toString(),
        date: formattedDate,
        needsTransport: needsTransport.toString(),
      });

      if (needsTransport && selectedStructure) {
        requestBody.append("structureSlug", selectedStructure);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/payment/create-payment-intent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: requestBody,
        },
      );

      if (!response.ok) {
        throw new Error("Errore durante la creazione del pagamento");
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
      if (data.totalAmount) {
        setTotalAmount(parseInt(data.totalAmount));
      }
    } catch (err) {
      console.error(err);
      setError("Errore durante la creazione del pagamento");
    } finally {
      setLoading(false);
    }
  };

  // Show thank you message after successful payment
  if (paymentCompleted) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-6 px-6 md:px-10">
        <div className="max-w-md mx-auto bg-white rounded-lg p-8 text-center">
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

          <h1 className="text-title font-semibold mb-2">
            Grazie per il tuo acquisto!
          </h1>

          <p className="text-body text-muted-foreground mb-6">
            La tua prenotazione è stata confermata.
          </p>

          <p className="text-detail text-muted-foreground mb-8">
            Riceverai presto una email con tutti i dettagli della tua
            prenotazione.
          </p>
        </div>
      </div>
    );
  }

  // Show error message after failed payment
  if (paymentError) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-6 px-6 md:px-10">
        <div className="max-w-md mx-auto bg-white rounded-lg p-8 text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h1 className="text-title font-semibold mb-2 text-red-600">
            Pagamento non riuscito
          </h1>

          <p className="text-body text-muted-foreground mb-6">{paymentError}</p>

          <Button
            onClick={() => {
              setPaymentError(null);
              setClientSecret(null);
            }}
            className="w-full"
          >
            Riprova
          </Button>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-6 px-6 md:px-10">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-title font-semibold mb-6">
            Prenota la tua esperienza
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateIntent} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-subtitle font-semibold">
                Data dell'esperienza
              </label>
              <div className="border rounded-md p-2">
                <div className="calendar-container">
                  {isCheckingAvailability ? (
                    <div className="calendar-loading">
                      <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
                      <p className="text-detail text-muted-foreground text-center">
                        Stiamo controllando la disponibilità per questa
                        esperienza
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
            </div>

            <div className="space-y-2">
              <label
                htmlFor="participants"
                className="block text-body font-medium"
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

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  id="transport"
                  type="checkbox"
                  checked={needsTransport}
                  onChange={(e) => {
                    setNeedsTransport(e.target.checked);
                    if (!e.target.checked) {
                      setSelectedStructure("");
                    }
                  }}
                  className="h-4 w-4"
                />
                <label htmlFor="transport" className="text-body font-medium">
                  Ho bisogno di trasporto
                </label>
              </div>

              {needsTransport && (
                <div className="space-y-2">
                  <Label htmlFor="structure" className="text-body font-medium">
                    Struttura per il trasporto
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
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ELABORAZIONE...
                </>
              ) : (
                "PROCEDI AL PAGAMENTO"
              )}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-6 px-6 md:px-10">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm
            clientSecret={clientSecret}
            experienceSlug={experienceSlug!}
            totalAmount={totalAmount ?? undefined}
            onPaymentSuccess={() => setPaymentCompleted(true)}
            onPaymentError={(error) => setPaymentError(error)}
          />
        </Elements>
      </div>
    </div>
  );
};

export default Payment;
