import React, { useState, useRef, useEffect } from "react";

const skillData = [
  {
    id: "slash",
    name: "Slash",
    image: "/skills/Slash card.png",
    description: (
      <>
        <h4 className="text-heading-2-pixelify-bold mb-2 text-[#FFAE0B]">
          Basic skill: Slash
        </h4>
        <div className="space-y-2 mb-4">
          <p className="text-body-1-alagard text-gray-300">
            <span className="text-[#FFAE0B] font-bold">Type:</span> Physical
            Swordsmanship
          </p>
          <p className="text-body-1-alagard text-gray-300">
            <span className="text-[#FFAE0B] font-bold">Attack Range:</span>{" "}
            Short (Melee)
          </p>
          <p className="text-body-1-alagard text-gray-300">
            <span className="text-[#FFAE0B] font-bold">Progression:</span> 10
            Levels (Basic→Master→Emperor→ Divine → God)
          </p>
        </div>
        <p className="text-body-1-alagard text-gray-300 mb-4">
          A masterful swordsmanship technique passed down through generations of
          cathedral knights, this devastating slash channels the wielder's soul
          into their blade. What begins as a simple cut evolves into a strike
          capable of cleaving through the very fabric of darkness itself.
        </p>
        <div>
          <h5 className="text-heading-3-pixelify-bold mb-2 text-[#FFAE0B]">
            Upgrade:
          </h5>
          <ul className="text-body-1-alagard text-gray-300 space-y-1">
            <li>
              • Slash's AoE and Damage will increase due to the Slash card
            </li>
            <li>
              • Slash's Damage will increase due to the Attack Damage card
            </li>
            <li>
              • Slash's CD will be reduced due to the Cooldown Reduction card
            </li>
            <li>• Slash's AoE will increase due to the Attack Range card</li>
            <li>
              • Slash will upgrade into Dash slash select 10 times Slash card in
              per session
            </li>
          </ul>
        </div>
      </>
    ),
  },
  {
    id: "marksman",
    name: "Marksman",
    image: "/skills/marksman card.png",
    description: (
      <>
        <h4 className="text-heading-2-pixelify-bold mb-2 text-[#FFAE0B]">
          Basic Skill: Marksman
        </h4>
        <div className="space-y-2 mb-4">
          <p className="text-body-1-alagard text-gray-300">
            <span className="text-[#FFAE0B] font-bold">Skill Type:</span> Single
            target/Projectile
          </p>
          <p className="text-body-1-alagard text-gray-300">
            <span className="text-[#FFAE0B] font-bold">Attack Range:</span> Long
          </p>
          <p className="text-body-1-alagard text-gray-300">
            <span className="text-[#FFAE0B] font-bold">Progression:</span> 10
            Levels (Basic→Master→Emperor→ Divine → God)
          </p>
        </div>
        <p className="text-body-1-alagard text-gray-300 mb-4">
          A refined marksmanship technique developed by monster hunters who rely
          on precision and skill rather than mystical power. This gunmanship art
          focuses on exploiting weak points and vital areas of monstrous
          creatures through disciplined training and keen observation. Beginning
          with basic accuracy, the skill evolves through ten levels of
          mastery—from simple headshots to god-tier precision that can pierce
          through multiple targets, ignore thick hide and bone, and deliver
          devastating critical strikes. At its pinnacle, master marksmen achieve
          supernatural focus and timing, allowing them to place shots with
          impossible accuracy even against the fastest and most elusive beasts.
        </p>
        <div>
          <h5 className="text-heading-3-pixelify-bold mb-2 text-[#FFAE0B]">
            Upgrade:
          </h5>
          <ul className="text-body-1-alagard text-gray-300 space-y-1">
            <li>• Marksman's Damage will increase due to the Marksman card</li>
            <li>
              • Marksman's Projectile number will increase due to the Marksman
              skill tier
            </li>
            <li>
              • Marksman's Damage will increase due to the Attack Damage card
            </li>
            <li>
              • Marksman's CD will be reduced due to the Cooldown Reduction card
            </li>
            <li>
              • Marksman's Attack range will increase due to the Attack Range
              card
            </li>
            <li>
              • Marksman will upgrade into Barrage skill when the Marksmanship
              skill becomes God Tier
            </li>
          </ul>
        </div>
      </>
    ),
  },
  {
    id: "fireball",
    name: "Fire Ball",
    image: "/skills/Fire ball card.png",
    description: (
      <>
        <h4 className="text-heading-2-pixelify-bold mb-2 text-[#FFAE0B]">
          Magic skill: Fire Ball
        </h4>
        <div className="space-y-2 mb-4">
          <p className="text-body-1-alagard text-gray-300">
            <span className="text-[#FFAE0B] font-bold">Type:</span> Single
            target/ AoE/DOT/Magical
          </p>
          <p className="text-body-1-alagard text-gray-300">
            <span className="text-[#FFAE0B] font-bold">Effect:</span> Blast
            enemies, does DOT damage
          </p>
          <p className="text-body-1-alagard text-gray-300">
            <span className="text-[#FFAE0B] font-bold">Attack Range:</span>{" "}
            Medium (Ranged)
          </p>
          <p className="text-body-1-alagard text-gray-300">
            <span className="text-[#FFAE0B] font-bold">Progression:</span> 10
            Levels (Basic→Master→Emperor→ Divine → God)
          </p>
        </div>
        <p className="text-body-1-alagard text-gray-300 mb-4">
          A devastating magical art that conjures spheres of concentrated flame
          to obliterate enemies from afar. This ancient pyromantic technique
          begins with simple fire manipulation but evolves through ten levels of
          mastery into an apocalyptic force capable of turning entire
          battlefields into blazing infernos. The caster manifests a blazing orb
          of pure fire that streaks across the battlefield before erupting in a
          violent explosion, incinerating everything within its radius. At
          god-tier mastery, these fireballs burn with such intensity they can
          melt stone, vaporize water, and leave craters of molten glass where
          once enemies stood, with explosions so massive they can consume entire
          monster hordes in walls of searing flame.
        </p>
        <div>
          <h5 className="text-heading-3-pixelify-bold mb-2 text-[#FFAE0B]">
            Upgrade:
          </h5>
          <ul className="text-body-1-alagard text-gray-300 space-y-1">
            <li>
              • Fire Ball's Damage will increase due to the Fire Ball card
            </li>
            <li>
              • Fire Ball's Projectile number will increase when Fire Ball is in
              each tier
            </li>
            <li>
              • Fire Ball's Damage will increase due to the Attack Damage card
            </li>
            <li>
              • Fire Ball's CD will be reduced due to the Cooldown Reduction
              card
            </li>
            <li>
              • Fire Ball's Attack range and AoE will increase due to the Attack
              Range card
            </li>
            <li>
              • Fire Ball will upgrade into Fire Blizzard skill when the Fire
              Ball skill becomes God Tier
            </li>
          </ul>
        </div>
      </>
    ),
  },
  {
    id: "firearrow",
    name: "Fire Arrow",
    image: "/skills/Fire arrow card.png",
    description: (
      <>
        <h4 className="text-heading-2-pixelify-bold mb-2 text-[#FFAE0B]">
          Magic skill: Fire Arrow
        </h4>
        <div className="space-y-2 mb-4">
          <p className="text-body-1-alagard text-gray-300">
            <span className="text-[#FFAE0B] font-bold">Type:</span> Single
            target/DOT/ Magical
          </p>
          <p className="text-body-1-alagard text-gray-300">
            <span className="text-[#FFAE0B] font-bold">Effect:</span> Pierces
            through enemies, does DOT damage
          </p>
          <p className="text-body-1-alagard text-gray-300">
            <span className="text-[#FFAE0B] font-bold">Attack Range:</span> Long
            (Piercing Ranged)
          </p>
          <p className="text-body-1-alagard text-gray-300">
            <span className="text-[#FFAE0B] font-bold">Progression:</span> 10
            Levels (Basic→Master→Emperor→ Divine → God-tier)
          </p>
        </div>
        <p className="text-body-1-alagard text-gray-300 mb-4">
          A precise magical archery technique that creates arrows of pure flame
          to pierce and burn through enemy ranks. This ancient pyromantic art
          begins with simple fire-imbued projectiles but evolves through ten
          levels of mastery into devastating lances of concentrated flame that
          can penetrate multiple foes in a single shot. The caster manifests a
          blazing arrow that streaks through the air, piercing straight through
          enemies while leaving trails of searing fire in its wake, scorching
          everything it passes through. At god-tier mastery, these flame arrows
          burn with such ferocity they can punch through the thickest armor and
          bone, creating chains of burning destruction as they pass through
          entire groups of monsters, leaving smoldering wounds that continue to
          burn long after impact.
        </p>
        <div>
          <h5 className="text-heading-3-pixelify-bold mb-2 text-[#FFAE0B]">
            Upgrade:
          </h5>
          <ul className="text-body-1-alagard text-gray-300 space-y-1">
            <li>
              • Fire Arrow's Damage will increase due to the Fire Arrow card
            </li>
            <li>
              • Fire Arrow's Projectile number will increase when Fire Arrow is
              in each tier
            </li>
            <li>
              • Fire Arrow's Damage will increase due to the Attack Damage card
            </li>
            <li>
              • Fire Arrows CD will be reduced due to the Cooldown Reduction
              card
            </li>
            <li>
              • Fire Arrow's Attack range and AoE will increase due to the
              Attack Range card
            </li>
            <li>
              • Fire Arrow will upgrade into the Split Fire skill when the Fire
              Arrow skill becomes God Tier
            </li>
          </ul>
        </div>
      </>
    ),
  },
  {
    id: "iceshard",
    name: "Ice Shard",
    image: "/skills/Ice shard card.png",
    description: (
      <>
        <h4 className="text-heading-2-pixelify-bold mb-2 text-[#FFAE0B]">
          Magic skill: Ice Shard
        </h4>
        <div className="space-y-2 mb-4">
          <p className="text-body-1-alagard text-gray-300">
            <span className="text-[#FFAE0B] font-bold">Type:</span> Single
            target/ AoE/Crowd Control/Magical/ Slow
          </p>
          <p className="text-body-1-alagard text-gray-300">
            <span className="text-[#FFAE0B] font-bold">Effect:</span> Blast
            slows enemies in the area
          </p>
          <p className="text-body-1-alagard text-gray-300">
            <span className="text-[#FFAE0B] font-bold">Attack Range:</span> Long
            (Piercing Ranged)
          </p>
          <p className="text-body-1-alagard text-gray-300">
            <span className="text-[#FFAE0B] font-bold">Progression:</span> 10
            Levels (Basic→Master→Emperor→ Divine → God-tier)
          </p>
        </div>
        <p className="text-body-1-alagard text-gray-300 mb-4">
          A chilling magical technique that hurls razor-sharp shards of
          enchanted ice to slow and damage enemies across the battlefield. This
          ancient cryomantic art begins with simple ice manipulation but evolves
          through ten levels of mastery into devastating frozen projectiles that
          can halt entire monster hordes in their tracks. The caster manifests a
          gleaming ice shard that streaks toward its target before shattering
          mid-air, releasing a burst of freezing mist that chills the air and
          slows all enemies caught within its frigid radius. At god-tier
          mastery, these ice shards explode with such bone-deep cold they can
          freeze blood in veins, turn flesh brittle as glass, and create
          expanding zones of supernatural winter that leave monsters crawling at
          a snail's pace through fields of deadly frost.
        </p>
        <div>
          <h5 className="text-heading-3-pixelify-bold mb-2 text-[#FFAE0B]">
            Upgrade:
          </h5>
          <ul className="text-body-1-alagard text-gray-300 space-y-1">
            <li>
              • Ice Shard's Damage will increase due to the Ice Shard card
            </li>
            <li>
              • Ice Shard's Damage will increase due to the Attack Damage card
            </li>
            <li>
              • Ice Shard's CD will be reduced due to the Cooldown Reduction
              card
            </li>
            <li>
              • Ice Shard's Attack range and AoE will increase due to the Attack
              Range card
            </li>
            <li>
              • Ice Shard will upgrade into the Freezing Field skill when the
              Ice Shard skill becomes God Tier
            </li>
          </ul>
        </div>
      </>
    ),
  },
  {
    id: "lightningchain",
    name: "Lightning Chain",
    image: "/skills/Lightning chain card.png",
    description: (
      <>
        <h4 className="text-heading-2-pixelify-bold mb-2 text-[#FFAE0B]">
          Magic skill: Lightning Chain
        </h4>
        <div className="space-y-2 mb-4">
          <p className="text-body-1-alagard text-gray-300">
            <span className="text-[#FFAE0B] font-bold">Type:</span>{" "}
            Multi-target/Chain/Crowd Control/Magical/
          </p>
          <p className="text-body-1-alagard text-gray-300">
            <span className="text-[#FFAE0B] font-bold">Effect:</span> Blast
            slows enemies in the area
          </p>
          <p className="text-body-1-alagard text-gray-300">
            <span className="text-[#FFAE0B] font-bold">Attack Range:</span> Long
            (Piercing Ranged)
          </p>
          <p className="text-body-1-alagard text-gray-300">
            <span className="text-[#FFAE0B] font-bold">Progression:</span> 10
            Levels (Basic→Master→Emperor→ Divine → God-tier)
          </p>
        </div>
        <p className="text-body-1-alagard text-gray-300 mb-4">
          A devastating electrical magic that unleashes arcing bolts of
          lightning to jump between multiple enemies in succession. This ancient
          storm magic begins with simple electrical manipulation but evolves
          through ten levels of mastery into god-tier lightning that can leap
          across entire battlefields, stunning and frying dozens of monsters in
          a single cast. The caster releases a crackling bolt that strikes the
          first target before chaining to nearby enemies, each successive jump
          dealing reduced but still lethal damage while leaving victims
          paralyzed by electrical shock. At its pinnacle, these lightning chains
          can arc through seemingly endless numbers of foes, turning entire
          monster hordes into writhing, electrocuted masses as the bolt seeks
          out every living creature within range, growing weaker with each jump
          but never losing its ability to stun and disable even the most
          resilient beasts.
        </p>
        <div>
          <h5 className="text-heading-3-pixelify-bold mb-2 text-[#FFAE0B]">
            Upgrade:
          </h5>
          <ul className="text-body-1-alagard text-gray-300 space-y-1">
            <li>
              • Lightning Chain's Damage will increase due to the Lightning
              Chain card
            </li>
            <li>
              • Lightning Chain's target number will increase due to the
              Lightning Chain card, but the leap number will decrease
            </li>
            <li>
              • Lightning Chain's Damage will increase due to the Attack Damage
              card
            </li>
            <li>
              • Lightning Chain's CD will be reduced due to the Cooldown
              Reduction card
            </li>
            <li>
              • Lightning Chain's Attack range and AoE will increase due to the
              Attack Range card
            </li>
            <li>
              • Lightning Chain will upgrade into the Surge of Lightning skill
              when the Lightning Chain skill becomes God Tier
            </li>
          </ul>
        </div>
      </>
    ),
  },
  {
    id: "holylight",
    name: "Holy Light",
    image: "/skills/Holy light card.png",
    description: (
      <>
        <h4 className="text-heading-2-pixelify-bold mb-2 text-[#FFAE0B]">
          Magic skill: Holy Light
        </h4>
        <div className="space-y-2 mb-4">
          <p className="text-body-1-alagard text-gray-300">
            <span className="text-[#FFAE0B] font-bold">Type:</span> AoE/Crowd
            Control/Magical/
          </p>
          <p className="text-body-1-alagard text-gray-300">
            <span className="text-[#FFAE0B] font-bold">Effect:</span> Slim
            chance of Blinds the enemy, not able to do melee damage
          </p>
          <p className="text-body-1-alagard text-gray-300">
            <span className="text-[#FFAE0B] font-bold">Attack Range:</span> AoE
          </p>
          <p className="text-body-1-alagard text-gray-300">
            <span className="text-[#FFAE0B] font-bold">Progression:</span> 10
            Levels (Basic→Master→Emperor→ Divine → God-tier)
          </p>
        </div>
        <p className="text-body-1-alagard text-gray-300 mb-4">
          A sacred magical art that unleashes blinding flashes of pure holy
          light to temporarily disable enemies across the battlefield. This
          divine technique begins with simple light manipulation but evolves
          through ten levels of mastery into god-tier radiance that can blind
          entire armies of darkness with overwhelming luminescence. The caster
          channels celestial energy into a brilliant flash that erupts outward,
          searing the vision of all enemies within range and leaving them unable
          to strike accurately for several crucial moments. At its pinnacle,
          this holy light burns with such intensity that it can blind even
          creatures of shadow and undead abominations, creating cascading waves
          of radiance that spread from enemy to enemy, ensuring that entire
          monster hordes stumble helplessly in temporary blindness as the divine
          light overwhelms their senses and renders them defenseless against
          follow-up attacks.
        </p>
        <div>
          <h5 className="text-heading-3-pixelify-bold mb-2 text-[#FFAE0B]">
            Upgrade:
          </h5>
          <ul className="text-body-1-alagard text-gray-300 space-y-1">
            <li>
              • Holy Light's change to blind the enemy will increase due to the
              Holy Light in each tier
            </li>
            <li>
              • Holy Light's CD will be reduced due to the Holy Light card
            </li>
            <li>
              • Holy Light's CD will be reduced due to the Cooldown Reduction
              card
            </li>
            <li>
              • Holy Light's Attack range and AoE will increase due to the
              Attack Range card
            </li>
            <li>
              • Holy Light will upgrade into the Holy Being skill when the Holy
              Light skill becomes God Tier
            </li>
          </ul>
        </div>
      </>
    ),
  },
  {
    id: "agility",
    name: "Agility",
    image: "/skills/agility card.png",
    description: (
      <>
        <h4 className="text-heading-2-pixelify-bold mb-2 text-[#FFAE0B]">
          Agility
        </h4>
        <p className="text-body-1-alagard text-gray-300 mb-4">
          A fundamental physical enhancement that sharpens reflexes and lightens
          the body's burden, allowing for swift movement across treacherous
          terrain. This passive ability increases the character's natural grace
          and coordination, enabling faster traversal of battlefields and
          quicker positioning during combat encounters.
        </p>
      </>
    ),
  },
  {
    id: "armor",
    name: "Armor",
    image: "/skills/armor card.png",
    description: (
      <>
        <h4 className="text-heading-2-pixelify-bold mb-2 text-[#FFAE0B]">
          Armor
        </h4>
        <p className="text-body-1-alagard text-gray-300 mb-4">
          A defensive mastery that hardens the body's natural resilience and
          improves equipment effectiveness, reducing incoming damage from all
          sources. This passive protection creates layers of defense that can
          absorb and deflect a certain amount of punishment before harm reaches
          vital areas.
        </p>
      </>
    ),
  },
  {
    id: "attackdamage",
    name: "Attack Damage",
    image: "/skills/attack damage card.png",
    description: (
      <>
        <h4 className="text-heading-2-pixelify-bold mb-2 text-[#FFAE0B]">
          Attack Damage
        </h4>
        <p className="text-body-1-alagard text-gray-300 mb-4">
          A combat enhancement that channels raw power into every strike,
          increasing the destructive force behind all offensive abilities. This
          passive amplification affects every form of attack, from sword strikes
          to magical spells, ensuring each blow carries maximum devastating
          potential.
        </p>
      </>
    ),
  },
  {
    id: "attackrate",
    name: "Attack Rate",
    image: "/skills/attack rate card.png",
    description: (
      <>
        <h4 className="text-heading-2-pixelify-bold mb-2 text-[#FFAE0B]">
          Attack Rate
        </h4>
        <p className="text-body-1-alagard text-gray-300 mb-4">
          A precision technique that streamlines combat movements and reduces
          recovery time between strikes, allowing for rapid successive attacks.
          This passive skill eliminates wasted motion and hesitation, creating
          fluid combat chains with minimal downtime between offensive actions.
        </p>
      </>
    ),
  },
  {
    id: "expgain",
    name: "EXP Gain",
    image: "/skills/EXP gain card.png",
    description: (
      <>
        <h4 className="text-heading-2-pixelify-bold mb-2 text-[#FFAE0B]">
          EXP Gain
        </h4>
        <p className="text-body-1-alagard text-gray-300 mb-4">
          A learning enhancement that sharpens the mind's ability to absorb
          knowledge from combat experience, accelerating personal growth and
          skill development. This passive ability allows the character to
          extract maximum wisdom from every encounter and challenge.
        </p>
      </>
    ),
  },
  {
    id: "goldgain",
    name: "Gold Gain",
    image: "/skills/Gold gain card.png",
    description: (
      <>
        <h4 className="text-heading-2-pixelify-bold mb-2 text-[#FFAE0B]">
          Gold Gain
        </h4>
        <p className="text-body-1-alagard text-gray-300 mb-4">
          A fortune-finding instinct that improves the ability to locate and
          secure valuable treasures from defeated enemies, increasing monetary
          rewards from all sources. This passive skill represents keen eyes for
          valuable items and shrewd collection practices.
        </p>
      </>
    ),
  },
  {
    id: "pickuprange",
    name: "Pickup Range",
    image: "/skills/Pickup range card.png",
    description: (
      <>
        <h4 className="text-heading-2-pixelify-bold mb-2 text-[#FFAE0B]">
          Pickup Range
        </h4>
        <p className="text-body-1-alagard text-gray-300 mb-4">
          An awareness enhancement that extends the character's natural
          perception and reach for collecting battlefield spoils, automatically
          gathering dropped items from greater distances. This passive ability
          ensures no valuable loot is left behind during intense combat.
        </p>
      </>
    ),
  },
  {
    id: "strength",
    name: "Strength",
    image: "/skills/strength card.png",
    description: (
      <>
        <h4 className="text-heading-2-pixelify-bold mb-2 text-[#FFAE0B]">
          Strength
        </h4>
        <p className="text-body-1-alagard text-gray-300 mb-4">
          A physical enhancement that fortifies the body's core vitality and
          endurance, significantly increasing maximum health capacity and
          overall physical resilience. This passive ability represents the
          fundamental power that keeps warriors standing through the most brutal
          encounters.
        </p>
      </>
    ),
  },
];

const Guide = () => {
  const [activeTab, setActiveTab] = useState("faq");
  const [selectedSkill, setSelectedSkill] = useState(skillData[0]);
  const descriptionRef = useRef(null);

  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.scrollTop = 0;
    }
  }, [selectedSkill]);

  const scrollbarStyles = {
    scrollbarWidth: "thin",
    scrollbarColor: "#FFAE0B #2D3748",
  };

  const scrollbarClass = `
    scrollbar-thin 
    scrollbar-track-gray-800 
    scrollbar-thumb-[#FFAE0B] 
    scrollbar-thumb-rounded-full 
    hover:scrollbar-thumb-[#FFAE0B]/80
    [&::-webkit-scrollbar]:w-2
    [&::-webkit-scrollbar-track]:bg-gray-800
    [&::-webkit-scrollbar-thumb]:bg-[#FFAE0B]
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb]:hover:bg-[#FFAE0B]/80
  `;

  const tabContent = {
    faq: {
      content: (
        <div className="space-y-8 bg-dark-secondary">
          <div>
            <h3 className="text-heading-1-pixelify-bold mb-4">How to play?</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-heading-2-pixelify-bold mb-2 text-[#FFAE0B]">
                  Movement:
                </h4>
                <p className="text-body-1-alagard text-gray-300">
                  Use WASD keys or hold the right mouse button to follow the
                  cursor.
                </p>
                <img className="pt-2" src="/guideGif.gif" alt="Movement" />
              </div>

              <div>
                <h4 className="text-heading-2-pixelify-bold mb-2 text-[#FFAE0B]">
                  Collecting Resources:
                </h4>
                <p className="text-body-1-alagard text-gray-300">
                  Collect EXP and gold drops from enemy mobs by walking near or
                  over the items.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-heading-1-pixelify-bold mb-4">Portal System</h3>
            <p className="text-body-1-alagard text-gray-300">
              The main map has 4 portals located at each corner of the map.
              Portals randomly activate after the player survives 3 minutes. If
              the player manages to enter an activated portal before it closes,
              they are transported to one of 4 bonus maps: - Beach of Undeath-
              Dark Forest - Nest of Underlord - Maze
            </p>
          </div>

          <div>
            <h3 className="text-heading-1-pixelify-bold mb-4">
              Character Upgrades
            </h3>
            <p className="text-body-1-alagard text-gray-300">
              To upgrade your character, collect EXP throughout the map to level
              up. When leveled up, 3 random skill upgrade cards appear and the
              player must choose one of the 3. If a player manages to choose the
              same skill 10 times, that skill upgrades to an Ultimate skill and
              unlocks a hidden ability.
            </p>
          </div>

          <div>
            <h3 className="text-heading-1-pixelify-bold mb-4">Base Stats:</h3>
            <p className="text-body-1-alagard text-gray-300">
              Upgrades Every player can upgrade their base stats from the main
              menu Dashboard section, using gold coins collected from previous
              game sessions.
            </p>
          </div>

          <div>
            <h3 className="text-heading-1-pixelify-bold mb-4 text-[#FFAE0B]">
              Maps
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-heading-2-pixelify-bold mb-2">
                  Dark Forest:
                </h4>
                <p className="text-body-1-alagard text-gray-300">
                  Dark Forest is the territory of Dark Elves, who are allies
                  with humans. However, ancient creatures controlled by demons
                  want to destroy the Dark Elves' totem, which has the ability
                  to keep demons away from their territory. The player helps
                  protect their totem and receives an EXP multiplier as a
                  reward. This map features wave-based attacks with a total of 5
                  waves.
                </p>
              </div>

              <div>
                <h4 className="text-heading-2-pixelify-bold mb-2">
                  Nest of Underlord:
                </h4>
                <p className="text-body-1-alagard text-gray-300">
                  This place is a boss area featuring the most powerful enemy in
                  the game, along with ghouls that you must fight. The map has a
                  5-minute time limit. If the player manages to kill the boss,
                  they are granted an Ultimate skill. If not, the player will be
                  sent back to the main map as long as they survive.
                </p>
              </div>

              <div>
                <h4 className="text-heading-2-pixelify-bold mb-2">
                  Beach of Undeaths:
                </h4>
                <p className="text-body-1-alagard text-gray-300">
                  A nice beach cursed with pirate members and goblins. This map
                  provides a gold multiplier and has randomly spawning gold
                  treasure. There is also a mini-boss pirate captain who is much
                  more powerful than regular mobs on the map. The map has a
                  3-minute time limit, so kill as many mobs as possible to
                  collect resources for later upgrades and consumable items.
                </p>
              </div>

              <div>
                <h4 className="text-heading-2-pixelify-bold mb-2">
                  Chaos Realm:
                </h4>
                <p className="text-body-1-alagard text-gray-300">
                  The Chaos Realm is a hellish, volcanic underground place where
                  the player must escape within 5 minutes. This map features
                  extreme difficulty with exclusive rewards. The longer it
                  takes, the more the player loses score. If the score reaches
                  0, the player faces instant death. When the map is completed,
                  the player is rewarded with multiplied rewards based on
                  leftover time.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    skill: {
      content: (
        <div className="flex bg-dark-secondary gap-8 h-full">
          {/* Skill Cards Grid */}
          <div
            className="grid grid-cols-3 gap-4 overflow-y-auto max-h-[600px] w-1/2 pr-2"
            style={{ flexShrink: 0 }}
          >
            {skillData.map((skill) => (
              <div
                key={skill.id}
                className={`cursor-pointer border-2 rounded-md flex justify-center transition-all duration-200 ${
                  selectedSkill && selectedSkill.id === skill.id
                    ? "border-[#FFAE0B]"
                    : "border-gray-700 hover:border-[#FFAE0B]/60"
                }`}
                style={{ aspectRatio: "3/4", width: "100%", height: "100%" }}
                onClick={() =>
                  setSelectedSkill(
                    selectedSkill && selectedSkill.id === skill.id
                      ? null
                      : skill
                  )
                }
              >
                <img
                  src={skill.image}
                  alt={skill.name}
                  className="w-full h-full object-contain"
                  style={{ aspectRatio: "3/4" }}
                />
              </div>
            ))}
          </div>
          {/* Description Panel */}
          {selectedSkill && (
            <div
              ref={descriptionRef}
              className="flex-1 bg-dark-secondary rounded-lg p-6 max-h-[600px] border-2 border-[#FFAE0B] overflow-y-auto scrollbar-invisible"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <style>{`.scrollbar-invisible::-webkit-scrollbar { display: none; }`}</style>
              {selectedSkill.description}
            </div>
          )}
        </div>
      ),
    },
    defense: {
      content: (
        <div className="space-y-6 bg-dark-secondary">
          <h3 className="text-heading-1-pixelify-bold mb-4">
            Defense Mechanics
          </h3>
          <p className="text-body-1-alagard text-gray-300">
            Understanding defense mechanics is crucial for surviving the
            dangerous dungeons and boss encounters.
          </p>
        </div>
      ),
    },
    stats: {
      content: (
        <div className="space-y-6 bg-dark-secondary">
          <h3 className="text-heading-1-pixelify-bold mb-4">
            Character Statistics
          </h3>
          <p className="text-body-1-alagard text-gray-300">
            Your character's stats determine their effectiveness in combat and
            exploration.
          </p>
        </div>
      ),
    },
  };

  const tabs = [
    { id: "faq", label: "FAQ" },
    { id: "skill", label: "Skill" },
  ];

  return (
    <div className="flex items-center justify-center h-screen w-full bg-dark-secondary">
      <div className="text-white flex flex-col w-[1176px] h-[944px] bg-dark-secondary pt-12 pr-6 pb-12 pl-6 gap-6">
        <h1 className="text-display-1-alagard-bold text-left text-[#FFAE0B]">
          Guide
        </h1>
        <div className="flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-md transition-colors text-button-48-pixelify ${
                activeTab === tab.id
                  ? "bg-red-600 text-white"
                  : "bg-transparent border border-red-600 text-white hover:bg-red-600/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div
          className={`w-full flex-1 overflow-y-auto max-h-[600px] ${scrollbarClass}`}
          style={scrollbarStyles}
        >
          {tabContent[activeTab].content}
        </div>
      </div>
    </div>
  );
};

export default Guide;
