import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import Results from "./pages/results";
import routes from "tempo-routes";

// Lazy load payment pages for better performance
const Payment = lazy(() => import("./pages/Payment"));
const ThankYou = lazy(() => import("./pages/ThankYou"));

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
          <Route
            path="/payment/:experienceSlug/:structureSlug"
            element={<Payment />}
          />
          <Route path="/thank-you" element={<ThankYou />} />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;
