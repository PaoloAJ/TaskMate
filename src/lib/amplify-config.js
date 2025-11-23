import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";

// Configure Amplify with your backend resources
export function configureAmplify() {
  Amplify.configure(outputs, {
    ssr: true, // Enable SSR for Next.js
  });
}
