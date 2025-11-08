"use client";

import { BookCopyIcon, History, Map, RocketIcon } from "lucide-react";
import CardButton from "./card-button";
import Image from "next/image";

export default function HomeContent() {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <Image
        src={"/assets/Aplication-logo.png"}
        className={"h-32 w-32 mb-24 "}
        alt={"logo-application"}
        width={128}
        height={128}
      />
      <div className={"flex flex-col gap-4 justify-center xl:flex-row"}>
        <CardButton
          mTitle={"History"}
          mDescription={"Download your most recently applied optimization"}
          mIcon={History}
        />
        <CardButton
          mTitle={"Documentation"}
          mDescription={"Learn more about BetterPerformance."}
          mIcon={BookCopyIcon}
        />
        <CardButton
          mTitle={"Tweak"}
          mDescription={"Let's Tweak your pc"}
          mIcon={RocketIcon}
        />
      </div>
    </div>
  );
}
