export const metadata = {
  title: 'ScarsHQ Studio',
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#101112',
        overflow: 'auto',
      }}
    >
      {children}
    </div>
  );
}
