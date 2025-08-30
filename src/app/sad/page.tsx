import { PlateEditor } from "@/components/editor/PlateEditor";

export default function SadPage() {
  return (
    <section>
        {/* Simple title */}
        <h1>Sad Editor</h1>
        <p style={{ color: "#666", marginBottom: "12px" }}>
            Type here - we'll add a <code>/rewrite</code> to make text sadder.
        </p>

        <PlateEditor mode = "sad" />
    </section>
  );
}
