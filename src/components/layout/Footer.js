export default function Footer() {
  return (
    <footer className="h-12 border-t bg-white px-6 flex items-center justify-center text-sm text-gray-500">
      Powered by Entsuki © {new Date().getFullYear()}
    </footer>
  )
}