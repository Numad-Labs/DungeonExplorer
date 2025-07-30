import React from "react";

const UpgradeCard = ({ title, value }) => {
  return (
    <div className="relative p-8 flex max-w-[360px] max-h-[108px] ">
      <div className="absolute inset-0 bg-[url('/big-frame.png')] bg-no-repeat bg-contain pointer-events-none" />
      <div className="relative z-10 flex justify-center items-center w-full h-full">
        <div className="flex flex-col gap-2 items-center">
          <p className="text-body-2-pixelify">{title}</p>
          <p className="text-heading-4-alagard">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default UpgradeCard;
