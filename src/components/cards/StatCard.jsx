import React from "react";

const StatCard = ({ title, value }) => {
  return (
    <div className="relative p-8 flex w-[360px] h-[108px] ">
      <div className="absolute inset-0 bg-[url('/small-frame.png')] bg-no-repeat bg-contain pointer-events-none" />
      <div className="relative z-10 flex">
        <h3>{title}</h3>
        <p>{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
