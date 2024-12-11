"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BiSolidBot } from "react-icons/bi";
import { Drawer } from "flowbite-react";
import ChatComponent from "./chat-form";

type Tab = {
  title: string;
  value: string;
  content?: string | React.ReactNode;
};

export const Tabs = ({
  tabs: propTabs,
  containerClassName,
  activeTabClassName,
  tabClassName,
  contentClassName,
  openHeader,
}: {
  tabs: Tab[];
  containerClassName?: string;
  activeTabClassName?: string;
  tabClassName?: string;
  contentClassName?: string;
  openHeader?: boolean;
}) => {
  const [active, setActive] = useState<Tab>(propTabs[0]);
  const [tabs, setTabs] = useState<Tab[]>(propTabs);

  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);

  const moveSelectedTabToTop = (idx: number) => {
    const newTabs = [...propTabs];
    const selectedTab = newTabs.splice(idx, 1);
    newTabs.unshift(selectedTab[0]);
    setTabs(newTabs);
    setActive(newTabs[0]);
  };

  const [hovering, setHovering] = useState(false);

  const [dialog, setDialog] = useState<string[]>([
    "Hi, I'm Gemini AI! how can I help you today?",
  ]);

  function addChat(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDialog([...dialog, e.currentTarget["chat"].value]);
  }

  return (
    <>
      <div
        className={cn(
          "px-10 duration-500 mx-auto flex flex-row items-center justify-center [perspective:1000px] relative overflow-auto sm:overflow-visible no-visible-scrollbar max-w-full w-full",
          containerClassName
        )}
      >
        {propTabs.map((tab, idx) => (
          <button
            key={tab.title}
            onClick={() => {
              moveSelectedTabToTop(idx);
            }}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            className={cn("relative px-4 py-2 rounded-full", tabClassName)}
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {active.value === tab.value && (
              <motion.div
                layoutId="clickedbutton"
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                className={cn(
                  "absolute inset-0 rounded-xl ",
                  activeTabClassName
                )}
              />
            )}

            <span className="relative block text-black dark:text-white">
              {tab.title}
            </span>
          </button>
        ))}
        <div
          className={`absolute right-8 duration-300 ${
            !openHeader ? "top-7" : "top-2"
          }`}
        >
          <button className="inline-flex h-10 mr-4 animate-shimmer items-center justify-center rounded-xl border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
            Unlock Premium
          </button>
          <Button
            onClick={() => setIsOpen(true)}
            className=" rounded-xl"
            size={"icon"}
            variant="outline"
          >
            <div className="text-6xl">
              <BiSolidBot />
            </div>
          </Button>
        </div>
      </div>
      <Drawer
        className="bg-black w-96 overflow-hidden"
        open={isOpen}
        onClose={handleClose}
        position="right"
      >
        <Drawer.Header
          titleIcon={() => (
            <div className="text-2xl mr-2 flex items-center -mt-1">
              <BiSolidBot />
            </div>
          )}
          title={" " + "Chat with Gemini AI"}
        />
        <Drawer.Items className="h-[95%] relative">
          <div className="flex flex-col relative h-[88%] overflow-auto">
            {dialog.map((chat, idx) => (
              <div
                className={`p-1 rounded-md my-1 w-[90%] ${
                  idx % 2 === 0
                    ? "bg-gradientStart self-start text-black"
                    : "bg-tealBright self-end"
                }`}
              >
                <h1>{chat}</h1>
              </div>
            ))}
          </div>
          <ChatComponent handleChat={addChat} />
        </Drawer.Items>
      </Drawer>
      <FadeInDiv
        tabs={tabs}
        active={active}
        key={active.value}
        hovering={hovering}
        className={cn("", contentClassName)}
      />
    </>
  );
};

export const FadeInDiv = ({
  className,
  tabs,
  hovering,
}: {
  className?: string;
  key?: string;
  tabs: Tab[];
  active: Tab;
  hovering?: boolean;
}) => {
  const isActive = (tab: Tab) => {
    return tab.value === tabs[0].value;
  };
  return (
    <div className="relative w-full h-full">
      {tabs.map((tab, idx) => (
        <motion.div
          key={tab.value}
          layoutId={tab.value}
          style={{
            scale: 1 - idx * 0.1,
            top: hovering ? idx * -50 : 0,
            zIndex: -idx,
            opacity: idx < 3 ? 1 - idx * 0.1 : 0,
          }}
          animate={{
            y: isActive(tab) ? [0, 40, 0] : 0,
          }}
          className={cn("w-full h-full absolute top-0 left-0", className)}
        >
          {tab.content}
        </motion.div>
      ))}
    </div>
  );
};
