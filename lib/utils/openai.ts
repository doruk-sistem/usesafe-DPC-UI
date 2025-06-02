import OpenAI from "openai";

if (!process.env.AZURE_OPENAI_ENDPOINT || !process.env.AZURE_OPENAI_KEY) {
  throw new Error("Azure OpenAI configuration is not defined in environment variables");
}

const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini";
const baseURL = `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${deploymentName}`;

export const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_KEY,
  baseURL: baseURL,
  defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION },
  defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_KEY },
}); 