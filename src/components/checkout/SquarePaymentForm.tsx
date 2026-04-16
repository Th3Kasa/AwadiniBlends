"use client";

import { PaymentForm, CreditCard } from "react-square-web-payments-sdk";

interface SquarePaymentFormProps {
  onTokenReceived: (token: string) => void;
  isSubmitting: boolean;
}

export function SquarePaymentForm({
  onTokenReceived,
  isSubmitting,
}: SquarePaymentFormProps) {
  const appId =
    process.env.NEXT_PUBLIC_SQUARE_APP_ID ||
    "sandbox-sq0idb-placeholder";
  const locationId =
    process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || "placeholder";

  return (
    <div>
      <h3 className="text-xs tracking-[0.3em] uppercase text-cream/90 mb-5">
        Payment Details
      </h3>
      <PaymentForm
        applicationId={appId}
        locationId={locationId}
        cardTokenizeResponseReceived={(tokenResult) => {
          if (tokenResult.status === "OK" && tokenResult.token) {
            onTokenReceived(tokenResult.token);
          }
        }}
      >
        <CreditCard
          style={{
            ".input-container": {
              borderColor: "rgba(255,255,255,0.08)",
              borderRadius: "2px",
            },
            ".input-container.is-focus": {
              borderColor: "#c9a86c",
            },
            ".input-container.is-error": {
              borderColor: "#ef4444",
            },
            ".message-text": {
              color: "rgba(245,240,232,0.5)",
            },
            ".message-icon": {
              color: "rgba(245,240,232,0.5)",
            },
            input: {
              backgroundColor: "#2a2a2a",
              color: "#f5f0e8",
            },
            "input::placeholder": {
              color: "rgba(245,240,232,0.3)",
            },
          }}
          buttonProps={{
            isLoading: isSubmitting,
            css: {
              backgroundColor: "#c9a86c",
              color: "#0a0a0a",
              fontWeight: "500",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontSize: "0.75rem",
              borderRadius: "2px",
              padding: "14px 32px",
              "&:hover": {
                backgroundColor: "#d4b87d",
              },
              "&:disabled": {
                backgroundColor: "rgba(201,168,108,0.4)",
              },
            },
          }}
        >
          Pay Now
        </CreditCard>
      </PaymentForm>
    </div>
  );
}
