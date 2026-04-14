import { Client, Environment } from "square";

function getSquareEnvironment(): Environment {
  return process.env.SQUARE_ENVIRONMENT === "production"
    ? Environment.Production
    : Environment.Sandbox;
}

export function getSquareClient(): Client {
  return new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN!,
    environment: getSquareEnvironment(),
  });
}

export const squareLocationId = process.env.SQUARE_LOCATION_ID!;
