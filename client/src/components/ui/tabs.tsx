"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BiSolidBot } from "react-icons/bi";
import { Drawer, Modal } from "flowbite-react";
import ChatComponent from "./chat-form";
import { JwtPayload } from "@/types/type";
import { FaCheck } from "react-icons/fa6";

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
  payload,
}: {
  tabs: Tab[];
  containerClassName?: string;
  activeTabClassName?: string;
  tabClassName?: string;
  contentClassName?: string;
  openHeader?: boolean;
  payload?: JwtPayload;
}) => {
  const [active, setActive] = useState<Tab>(propTabs[0]);
  const [tabs, setTabs] = useState<Tab[]>(propTabs);

  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);

  const [openModal, setOpenModal] = useState(false);

  const moveSelectedTabToTop = (idx: number) => {
    const newTabs = [...propTabs];
    const selectedTab = newTabs.splice(idx, 1);
    newTabs.unshift(selectedTab[0]);
    setTabs(newTabs);
    setActive(newTabs[0]);
  };

  const [hovering, setHovering] = useState(false);

  const [dialog, setDialog] = useState<string[]>([
    "Hi, I'm Gemini AI! How can I help you today?",
  ]);

  async function addChat(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Ambil input dari form
    const userMessage = e.currentTarget["chat"].value;
    e.currentTarget["chat"].value = "";

    // Tambahkan userMessage ke dialog sementara
    setDialog((prev) => [...prev, userMessage]);

    try {
      // Lakukan fetch ke API
      const response = await fetch("http://localhost:8080/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userMessage }),
      });

      const data = await response.json();

      if (response.ok && data.status) {
        // Tambahkan response dari API ke dialog
        setDialog((prev) => [...prev, data.data]);
      } else {
        // Tambahkan fallback message jika API gagal
        setDialog((prev) => [
          ...prev,
          "Sorry, I can't understand your question",
        ]);
      }
    } catch (error) {
      // Tangani error jika fetch gagal
      console.error("Error fetching chat response:", error);
      setDialog((prev) => [...prev, "Something went wrong. Please try again."]);
    }
  }

  return (
    <>
      <div
        className={cn(
          "px-10 duration-500 mx-auto flex flex-row items-center justify-center [perspective:1000px] relative overflow-auto sm:overflow-visible no-visible-scrollbar max-w-full w-full",
          containerClassName
        )}
      >
        <h1
          className={`absolute ${
            openHeader ? "left-10 delay-500" : "left-32"
          } duration-500 text-xl uppercase tracking-[.5rem] font-inter`}
        >
          Leksanawara.
        </h1>
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
          className={`absolute right-8 duration-300 flex items-center ${
            !openHeader ? "top-7" : "top-2"
          }`}
        >
          {payload?.premium ? (
            <button className="p-[3px] relative mr-4">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-red-500 rounded-lg" />
              <div className="px-8 py-2  bg-teal-300 rounded-[6px] font-semibold relative group transition duration-200 text-black hover:bg-transparent">
                Access Special Features
              </div>
            </button>
          ) : (
            <button
              onClick={() => setOpenModal(true)}
              className="inline-flex h-10 mr-4 animate-shimmer items-center justify-center rounded-xl border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
            >
              Unlock Premium
            </button>
          )}
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
        className="bg-black w-96 overflow-hidden duration-1000 ease-ease-in-out-back"
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
                key={idx}
                className={`py-1 px-2 rounded-md my-2 w-[90%] ${
                  idx % 2 === 0
                    ? "bg-tealBright self-start text-black"
                    : "bg-gradientStart self-end"
                }`}
              >
                <h1>{chat}</h1>
              </div>
            ))}
          </div>
          <ChatComponent handleChat={addChat} />
        </Drawer.Items>
      </Drawer>
      <Modal
        size="lg"
        className=""
        dismissible
        show={openModal}
        onClose={() => setOpenModal(false)}
      >
        <div className="p-0.5 bg-gradient-to-b from-yellow-300 to-orange-400 rounded-lg">
          <div className="bg-zinc-950 rounded-md px-5">
            <Modal.Body>
              <h2 className="px-2 py-1 rounded-full uppercase font-inter border border-orange-400 bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-500 absolute w-fit top-6 right-6 text-xs font-bold tracking-wider">
                Best Offer
              </h2>
              <div className="bg-gradient-to-b from-yellow-300 to-orange-400 p-0.5 w-fit rounded-full mt-10">
                <img
                  className="p-1.5 bg-black h-20 w-20 rounded-full"
                  src="/logo.webp"
                  alt=""
                />
              </div>
              <h1 className="font-inter bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-500 text-3xl relative py-5">
                Premium
              </h1>
              <div className="h-0.5 w-16 bg-gradient-to-r from-yellow-300 to-orange-400 "></div>
              <h3 className="font-bold font-inter text-5xl text-white mt-4">
                IDR 9.900
                <span className="text-sm font-medium text-zinc-300">
                  /month
                </span>
              </h3>
              <p className="font-inter mt-4 text-zinc-600 text-xs font-light">
                Track your appliance energy usage every day and stay in control.
              </p>
              <div className="flex text-white gap-2 mt-4 items-center">
                <div className="border-[1.5px] border-orange-400 rounded-full text-white text-sm w-fit p-1">
                  <FaCheck />
                </div>
                <h1 className="text-lg">Daily Energy Monitoring</h1>
              </div>
              <h4 className="w-full h-12 rounded-2xl bg-gradient-to-r from-yellow-300 to-orange-400 mt-8 mb-4 font-inter font-semibold flex justify-center items-center text-black">Uprade to Premium</h4>
            </Modal.Body>
          </div>
        </div>
      </Modal>
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
