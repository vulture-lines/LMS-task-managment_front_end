import { Smile, TextSearch } from "lucide-react";
import React from "react";

function AnnouncementList() {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white flex flex-col gap-4 shadow-md px-6 py-4 rounded-md hover:shadow-2xl">
        <div className="flex gap-4 items-center">
          <img
            src="/"
            alt="user"
            className="bg-green-200 rounded-full size-10 lg:size-12"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/vite.svg";
            }}
          />
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold">Admin user</h1>
            <p className="text-xs font-bold flex text-gray-500 flex-col lg:flex-row lg:gap-1">
              {/* <span className="">Administrator</span> */}
              <span>
                {new Date().toLocaleString("en-in", {
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-medium text-base">Welcome to People</h3>
          <p className="text-sm lg:text-base">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit.
            Asperiores, debitis laboriosam animi vero est id nesciunt commodi
            laborum, blanditiis dolore in ipsum explicabo necessitatibus odit a
            incidunt consequatur velit. Porro.
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium px-3 py-2 hover:bg-green-600 hover:text-white rounded-full">
            <Smile className="h-5 lg:h-6" />{" "}
            <span className="hidden lg:block">React</span>
          </div>
          <button className="flex gap-2 px-3 py-2 hover:bg-green-600 hover:text-white rounded-full hover:shadow-2xl">
            <TextSearch className="h-5 lg:h-6" />
            <span className="text-base font-medium hidden lg:block">View</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementList;
