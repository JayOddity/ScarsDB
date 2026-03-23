export default function TalentTreeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Override the main layout's flex-1 main to remove padding and let the tree fill the page
  // Footer is still in the DOM but pushed below the viewport by the full-height tree
  return <div className="flex-1 flex flex-col overflow-hidden">{children}</div>;
}
