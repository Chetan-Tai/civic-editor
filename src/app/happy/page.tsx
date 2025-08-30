import { PlateEditor } from "@/components/editor/PlateEditor";

export default function HappyPage() {
  return (
    <section>
        {/* Simple title */}
        <h1>Happy Editor</h1>
        <p style={{ color: "#666", marginBottom: "12px" }}>
            Type here - we'll add a <code>/rewrite</code> to make text happier.
        </p>

        <PlateEditor mode = "happy" />
    </section>
  );
}