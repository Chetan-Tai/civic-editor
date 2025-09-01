import { PlateEditor } from "@/components/editor/PlateEditor";

export default function HappyPage() {
  return (
    <section>
        <h1 className="text-xl">Happy Editor</h1>
        <p className="text-gray-600 mb-4">
            Type here and watch your text get happier :)
        </p>

        <PlateEditor mode = "happy" />
    </section>
  );
}
