"use client";

import { PaymentForm, CreditCard } from "react-square-web-payments-sdk";

interface SquarePaymentFormProps {
  onTokenReceived: (token: string) => void;
  isSubmitting: boolean;
}

export function SquarePaymentForm({ onTokenReceived, isSubmitting }: SquarePaymentFormProps) {
  const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID || "sandbox-sq0idb-placeholder";
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || "placeholder";

  return (
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        style={{
          ".input-container": {
            borderColor: "rgba(255,255,255,0.15)",
            borderRadius: "6px",
            backgroundColor: "#1c1c1c",
          },
          ".input-container.is-focus": {
            borderColor: "#c9a86c",
            boxShadow: "0 0 0 2px rgba(201,168,108,0.15)",
          },
          ".input-container.is-error": {
            borderColor: "rgba(248,113,113,0.7)",
          },
          ".message-text": {
            color: "rgba(245,240,232,0.65)",
            fontSize: "12px",
          },
          ".message-icon": {
            color: "rgba(245,240,232,0.65)",
          },
          "input": {
            backgroundColor: "#1c1c1c",
            color: "#f5f0e8",
            fontSize: "14px",
          },
          "input::placeholder": {
            color: "rgba(245,240,232,0.3)",
          },
        } as any}
        buttonProps={{
          isLoading: isSubmitting,
          css: {
            marginTop: "16px",
            width: "100%",
            backgroundColor: "#c9a86c",
            color: "#0a0a0a",
            fontWeight: "600",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontSize: "0.75rem",
            borderRadius: "6px",
            padding: "14px 32px",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.2s",
            "&:hover": {
              backgroundColor: "#d4b87d",
            },
            "&:disabled": {
              backgroundColor: "rgba(201,168,108,0.35)",
              cursor: "not-allowed",
            },
          },
        }}
      >
        Pay Now
      </CreditCard>
    </PaymentForm>
  );
}
