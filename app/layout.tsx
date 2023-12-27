import '../styling/global.css'

export const metadata = {
  title: 'AutoTrip',
  description: 'KILL ALL HUMANS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
