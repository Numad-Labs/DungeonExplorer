import React from "react";

const UpgradeCard = ({ title, value, progress, description, onUpgrade, isMaxed, upgradeId }) => {
  return (
    <div className="relative p-6 flex max-w-[360px] min-h-[140px] ">
      <div className="absolute inset-0 bg-[url('/big-frame.png')] bg-no-repeat bg-contain pointer-events-none" />
      <div className="relative z-10 flex flex-col justify-between items-center w-full h-full">
        <div className="flex flex-col gap-1 items-center">
          <p className="text-body-2-pixelify text-center">{title}</p>
          <p className="text-heading-4-alagard">{value}</p>
          {progress && (
            <p className="text-xs text-gray-400">{progress}</p>
          )}
        </div>
        {onUpgrade && (
          <button
            onClick={() => onUpgrade(upgradeId)}
            disabled={isMaxed}
            className={`mt-2 px-3 py-1 text-xs rounded ${
              isMaxed
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
            }`}
          >
            {isMaxed ? 'MAXED' : 'UPGRADE'}
          </button>
        )}
      </div>
    </div>
  );
};

export default UpgradeCard;
