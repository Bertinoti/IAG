export function MessageBubble({
  role,
  content,
}: {
  role: "user" | "assistant";
  content: string;
}) {
  return (
    <p className="rounded bg-slate-100 p-3">
      <b>{role}:</b> {content}
    </p>
  );
}
