import { useEffect, useState } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import useSWR from "swr";
import { Tabs } from "../ui/tabs";
import RoomsTabs from "../templates/Rooms";
import Analytics from "./Analytics";
import { jwtDecode } from "jwt-decode";
import { JwtPayload } from "../../types/type";
import { Dropdown } from "flowbite-react";
import { HiLogout } from "react-icons/hi";
import { RiUploadCloud2Fill } from "react-icons/ri";
import { Recommendations } from "./Recommendations";

export default function Dashboard() {
  const navigate = useNavigate();

  // GET request to fetch table data🐳
  const [table, setTable] = useState<string>("");
  const fetcher = (url: string, init: RequestInit | undefined) =>
    fetch(url, init).then((res) => res.json());
  const { data } = useSWR("http://localhost:8080/v1/table", (url) =>
    fetcher(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
  );

  useEffect(() => {
    if (data?.status) setTable(data.data);
  }, [data]);
  // GET request to fetch table data🐳

  const [openHeader, setOpenHeader] = useState<boolean>(true);

  const tabs = [
    {
      title: "Rooms",
      value: "rooms",
      content: <RoomsTabs />,
    },
    {
      title: "Analytics",
      value: "analytics",
      content: <Analytics />,
    },
    {
      title: "Recommendations",
      value: "recommendations",
      content: <Recommendations />,
    },
  ];

  // const [JWTSecret, setJWTSecret] = useState<string>(getJWTSecret());
  const [payload, setPayload] = useState<JwtPayload>({
    email: "",
    username: "",
    premium: false,
  });

  function decodeJwt(token: string): JwtPayload | null {
    try {
      const decoded = jwtDecode(token);
      return decoded as JwtPayload;
    } catch (error) {
      console.error("Invalid JWT token:", error);
      return null;
    }
  }

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    if (token) {
      const payload = decodeJwt(token);
      if (payload) {
        setPayload(payload);
      }
    }
  }, []);

  const handleLogout = (): void => {
    document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    window.location.href = "/login";
  };

  return (
    <div className="bg-lightGray absolute inset-0 p-4 font-poppins flex flex-col gap-4">
      <div
        className={`inset-x-4 bg-lightGray absolute ease-ease-in-out-smooth duration-1000 ${
          openHeader
            ? "w-[97.5%] h-24"
            : "z-10 h-24 w-24 rounded-bottom-right-2xl "
        }`}
      >
        <div
          className={`bg-gradient-to-b from-tealBright to-teal-300 text-black rounded-xl py-3 px-5 flex items-center justify-between ease-ease-in-out-smooth duration-1000 h-20  ${
            openHeader ? "w-full delay-300" : "w-20"
          }`}
        >
          <div className="flex items-center gap-5 w-fit">
            <img
              onClick={() => setOpenHeader(!openHeader)}
              src="/logo.webp"
              className="h-10 w-10 rounded-full cursor-pointer"
              alt="logo"
            />
            <div
              className={`${
                !openHeader ? "opacity-0" : "delay-1000"
              } ease-ease-in-out-smooth duration-500 flex gap-4`}
            >
              <div className="flex items-center gap-2 text-2xl">
                <h2 className="font-light  text-zinc-800">Welcome in,</h2>
                <h1 className="font-semibold text-2xl">
                  <Dropdown
                    inline
                    className="font-semibold text-5xl bg-gradient-to-br from-teal-300 via-lightGray to-teal-100"
                    label={payload?.username}
                  >
                    <Dropdown.Header>
                      <span className="block text-sm">{payload?.username}</span>
                      <span className="block truncate text-sm font-light">
                        {payload?.email}
                      </span>
                    </Dropdown.Header>
                    <Dropdown.Item
                      onClick={() => navigate("/upload")}
                      icon={RiUploadCloud2Fill}
                    >
                      Change CSV
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} icon={HiLogout}>
                      Sign out
                    </Dropdown.Item>
                  </Dropdown>
                </h1>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`flex flex-col justify-center ${
                !openHeader ? "opacity-0" : "delay-1000"
              } ease-ease-in-out-smooth duration-500`}
            >
              {!payload?.premium ? (
                <>
                  <h1 className="font-semibold text-2xl -mb-2 text-end">
                    Free Account
                  </h1>
                  <h2 className="font-light text-zinc-800 text-end">
                    Limited Features
                  </h2>
                </>
              ) : (
                <h1
                  className={`uppercase font-bold px-3 py-1 rounded-xl bg-gradient-to-br from-yellow-300 via-yellow-100 mr-2 to-yellow-300 text-lg ${
                    !openHeader ? "delay-1000 tracking-[-1rem]" : " tracking-wide"
                  }`}
                >
                  Premium
                </h1>
              )}
            </div>
            <div
              onClick={() => setOpenHeader(false)}
              className={`text-4xl text-teal-800 cursor-pointer ease-ease-in-out-smooth duration-300 hover:text-white ${
                !openHeader ? "opacity-0" : " delay-1000"
              }`}
            >
              <IoIosCloseCircleOutline />
            </div>
          </div>
          {/* <h1 className="font-inter italic absolute left-1/2 -translate-x-[50%] bg-clip-text text-transparent bg-gradient-to-r from-zinc-600 to-zinc-800 text-lg">
          Leksanawara
        </h1> */}
        </div>
      </div>
      <div
        className={`rounded-xl bg-gradient-to-t from-tealBright to-teal-300 bottom-4 left-4 right-4 flex flex-col justify-center items-center ease-ease-in-out-smooth duration-700 absolute overflow-hidden ${
          openHeader ? "top-28" : "top-4 delay-700"
        }`}
      >
        {table ? (
          <div className="h-full w-full relative b flex flex-col items-start justify-start">
            <Tabs
              payload={payload}
              tabs={tabs}
              containerClassName={`${!openHeader ? "h-28" : "h-16"}`}
              openHeader={openHeader}
            />
          </div>
        ) : (
          <GoToUpload />
        )}
      </div>
    </div>
  );
}

function GoToUpload() {
  return (
    <>
      <img className="h-2/3 mb-5" src="/characters/1.png" alt="" />
      <h1 className="text-3xl font-semibold -mb-1">
        It looks like you haven’t uploaded your CSV file yet.
      </h1>
      <h2 className="text-xl font-light">
        To get started, please upload your appliance data so we can begin
        optimizing your energy usage.
      </h2>
      <Link className="text-xl mt-4 hover:underline font-bold" to={"/upload"}>
        Upload CSV Now
      </Link>
    </>
  );
}
