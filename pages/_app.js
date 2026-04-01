import Head from "next/head";
import "../styles/globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { CartProvider } from "../contexts/CartContext";
import { LocationProvider } from "../contexts/LocationContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Sanjeevani - Local Medicine Marketplace</title>
        <meta name="description" content="Find medicines from local shops near you" />
      </Head>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");
      `}</style>
      <QueryClientProvider client={queryClient}>
        <AuthProvider queryClient={queryClient}>
          <LocationProvider>
            <CartProvider>
              <Component {...pageProps} />
              <Toaster richColors position="top-right" />
            </CartProvider>
          </LocationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
}

export default MyApp;
