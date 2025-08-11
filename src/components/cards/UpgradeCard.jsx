import React from "react";

const UpgradeCard = ({
  title,
  value,
  progress,
  description,
  onUpgrade,
  isMaxed,
  upgradeId,
  upgradeCost,
  isLoading = false,
}) => {
  return (
    <div className="relative p-8 flex w-full h-[160px] bg-dark-secondary outline-4 outline-[#46110D]">
      {/* Corner SVGs */}
      <img
        src="/Item-corner.svg"
        alt=""
        className="absolute top-0 left-0 w-6 h-6 pointer-events-none scale-y-[-1] scale-x-[-1]"
      />
      <img
        src="/Item-corner.svg"
        alt=""
        className="absolute top-0 right-0 w-6 h-6 pointer-events-none scale-y-[-1]"
      />
      <img
        src="/Item-corner.svg"
        alt=""
        className="absolute bottom-0 right-0 w-6 h-6 pointer-events-none"
      />
      <img
        src="/Item-corner.svg"
        alt=""
        className="absolute bottom-0 left-0 w-6 h-6 pointer-events-none scale-x-[-1]"
      />
      <div className="relative z-10 flex flex-col justify-center items-center w-full h-full gap-3">
        <div className="flex flex-col gap-1 items-center">
          <p className="text-body-2-pixelify text-center text-[#ffae0b]">
            {title}
          </p>
          <p className="text-heading-4-alagard">{value}</p>
          {progress && <p className="text-xs text-gray-400">{progress}</p>}
        </div>
        {onUpgrade && (
          <button
            onClick={() => onUpgrade(upgradeId)}
            disabled={isMaxed || isLoading}
            className={`mt-2 px-4 py-2 text-sm font-bold rounded flex items-center gap-2 ${
              isMaxed || isLoading
                ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                : "bg-yellow-600 hover:bg-yellow-700 text-white"
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-white"></div>
                UPGRADING...
              </>
            ) : isMaxed ? (
              "MAXED"
            ) : (
              `UPGRADE (${upgradeCost || 0} gold)`
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default UpgradeCard;
