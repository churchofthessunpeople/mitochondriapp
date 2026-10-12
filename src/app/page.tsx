import { SwanHome } from "@/components/swan-home";
import { getPublicContent } from "@/lib/public-content";

export default function HomePage() {
  return <SwanHome content={getPublicContent()} />;
}
