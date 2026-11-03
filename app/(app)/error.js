"use client";

import { LuTriangleAlert } from "react-icons/lu";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";

export default function Error({ error, reset }) {
  return (
    <div role="alert" className="rounded-panel bg-flour px-6 py-16 text-center">
      <Icon as={LuTriangleAlert} className="mx-auto mb-4 size-10 text-oven-dark/70" />
      <h1 className="text-heading-sm font-whisper">Something went wrong.</h1>
      <p className="mx-auto mt-3 max-w-md text-body-sm">
        {error?.message || "Please try again in a moment."}
      </p>
      <Button onClick={() => reset()} className="mt-8">
        Try again
      </Button>
    </div>
  );
}
