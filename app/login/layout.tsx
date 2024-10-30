import Link from "next/link"
import AcmeLogo from "@/app/ui/acme-logo"

export default function LoginLayout({ children }: { children: React.ReactNode } ) {
    return (
        <div className="flex min-h-screen flex-col p-6 rounded-lg">
            <Link
                className="mb-2 flex h-20 items-end justify-start rounded-md bg-blue-600 p-4 md:h-40"
                href="/"
            >
                <div className="w-32 text-white md:w-40 rounded-lg">
                    <AcmeLogo />
                </div>
            </Link>
            {/* <div className="flex grow flex-col justify-center md:flex-row"> */}
            <div>
                {children}
            </div>
        </div>
    )
}
 