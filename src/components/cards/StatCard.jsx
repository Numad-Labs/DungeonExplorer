import React from "react";

const StatCard = ({
  title,
  value,
  onClick,

  disabled = false,
}) => {
  const isClickable = onClick && !disabled;

  return (
    <div
      className={`relative p-4 gap-2 flex flex-col justify-center items-center bg-[#24110F] border-4 border-[#46110D] flex-1 w-full`}
    >
      <p className="text-light-secondary">{title}</p>
      <p className="text-heading-4-alagard">{value}</p>
    </div>
  );
};

export default StatCard;
