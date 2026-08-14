import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center gap-6 pt-10">
      <Link href="/" className="text-center">
        <span className="font-serif text-2xl font-semibold text-paper">
          Web<span className="text-gold">Novelist</span>
        </span>
        <span className="mt-1 block font-mono text-[9.5px] uppercase tracking-[0.22em] text-faint">
          start your ledger
        </span>
      </Link>
      <SignUp />
    </div>
  );
}
