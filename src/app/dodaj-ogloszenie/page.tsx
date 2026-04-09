import type { Metadata } from "next";
import { MirrorTemplatePage } from "@/components/mirror-template-page";
import { WordPressClassifiedForm } from "@/components/wordpress-classified-form";
import { getClassifiedCategories, getRouteMetadata } from "@/lib/wordpress-export";

export async function generateMetadata(): Promise<Metadata> {
  return getRouteMetadata("/dodaj-ogloszenie/");
}

export default async function AddClassifiedPage() {
  const categories = await getClassifiedCategories();

  return (
    <MirrorTemplatePage
      path="/dodaj-ogloszenie/"
      slots={[
        {
          selector: "form#biomasa-ogloszenie-form",
          slotId: "add-classified-form",
          node: <WordPressClassifiedForm categories={categories} />,
        },
      ]}
    />
  );
}
