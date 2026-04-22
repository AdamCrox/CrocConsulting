import "./globals.css";

export const metadata = {
  title: "CrocConsulting — MV/HV Electrical Equipment Procurement",
  description:
    "Outsourced procurement for medium and high-voltage electrical equipment. One call gets you three engineer-backed quotes. Commission-based, no cost to you.",
  authors: [{ name: "Adam Croxton" }],
  openGraph: {
    title: "CrocConsulting",
    description: "Expert MV/HV electrical equipment procurement. Commission-based.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#0071E3",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
