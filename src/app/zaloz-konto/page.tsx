import type { Metadata } from "next";
import { headers } from "next/headers";
import { MirrorTemplatePage } from "@/components/mirror-template-page";
import { WordPressRegistrationForm } from "@/components/wordpress-registration-form";
import { getRouteMetadata } from "@/lib/wordpress-export";

export async function generateMetadata(): Promise<Metadata> {
  return getRouteMetadata("/zaloz-konto/");
}

export default async function SignUpPage() {
  const headerStore = await headers();
  const host =
    headerStore.get("x-forwarded-host") ??
    headerStore.get("host") ??
    "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  const origin = `${protocol}://${host}`;

  return (
    <MirrorTemplatePage
      path="/zaloz-konto/"
      slots={[
        {
          selector: "form#biomasa-registration-form",
          slotId: "register-form",
          node: <WordPressRegistrationForm origin={origin} />,
        },
      ]}
    />
  );
}
