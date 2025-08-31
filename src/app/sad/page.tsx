import { PlateEditor } from "@/components/editor/PlateEditor";

export default function SadPage() {
  return (
    <section>
        {/* Simple title */}
        <h1 className="text-xl">Sad Editor</h1>
        <p className="text-gray-600 mb-4">
            Type here and watch your text get sadder :(
        </p>

        <PlateEditor mode = "sad" />
    </section>
  );
}
