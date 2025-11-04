import { Button } from "@/components/ui/button";
import Link from "next/link";

export function form() {
    return(
        <form>
            <div>
                <Link href="/Application">
                    <Button className="text-lg bg-blue-900 hover:bg-red-800 font-semibold">Apply Now!</Button>
                </Link>
            </div>
        </form>
    )
}

export default form;
