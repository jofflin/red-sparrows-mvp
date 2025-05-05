import { FileText, Scale } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export default function Footer() {
  return (
    <footer className="mt-auto w-full border-t bg-white flex justify-center fixed bottom-0">
      <div className="mx-auth container flex h-16 items-center justify-center px-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/impressum" className="flex items-center space-x-2">
              <FileText className="h-4 w-4 " />
              <span>Impressum und Datenschutz</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/agb" className="flex items-center space-x-2">
              <Scale className="h-4 w-4" />
              <span>AGB</span>
            </Link>
          </Button>
        </div>
      </div>
    </footer>
  );
}
