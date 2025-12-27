import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const menuItems = [
  { text: "Menu item", left: "left-[858px]" },
  { text: "Menu item", left: "left-[996px]" },
  { text: "Menu item", left: "left-[1129px]" },
  { text: "Menu item", left: "left-[1267px]" },
];

export const Design = (): JSX.Element => {
  return (
    <div className="bg-holiday-green overflow-hidden w-full min-w-[1600px] min-h-[1200px] relative">
      <img
        className="absolute top-[785px] left-[897px] w-[706px] h-[408px]"
        alt="Rectangle"
        src="/figmaAssets/rectangle-52.svg"
      />

      {menuItems.map((item, index) => (
        <nav key={index} className={`absolute top-[61px] ${item.left}`}>
          <button className="font-montserrat font-normal text-white text-xl tracking-[0] leading-[17.9px] whitespace-nowrap hover:opacity-80 transition-opacity">
            {item.text}
          </button>
        </nav>
      ))}

      <header className="absolute top-[53px] left-[106px] w-[127px] h-[34px] flex gap-[6.4px]">
        <img
          className="mt-[0.1px] w-[30px] h-[31px] object-cover"
          alt="Logo"
          src="/figmaAssets/logo-1.png"
        />

        <div className="w-[89px] h-[34px] font-montserrat font-bold text-white text-[16.2px] tracking-[0] leading-[16.6px]">
          My Secret <br />
          Santa
        </div>
      </header>

      <img
        className="absolute top-0 left-[456px] w-[1144px] h-[1200px]"
        alt="Ellipse"
        src="/figmaAssets/ellipse-5.png"
      />

      <section className="absolute top-[303px] left-20 w-[565px] h-[446px]">
        <img
          className="absolute top-[55px] left-[43px] w-[426px] h-96"
          alt="Santa claus is"
          src="/figmaAssets/santa-claus-is-coming-to-town-.png"
        />

        <div className="absolute top-0 left-0 w-[98px] h-[139px]">
          <img
            className="absolute w-[98.71%] h-[69.87%] top-0 left-0 object-cover"
            alt="Image"
            src="/figmaAssets/image.png"
          />

          <img
            className="absolute top-14 left-[45px] w-[54px] h-[84px]"
            alt="S"
            src="/figmaAssets/s.svg"
          />
        </div>
      </section>

      <Card className="absolute top-[973px] left-[790px] w-[810px] h-[227px] border-0 shadow-none">
        <CardContent className="p-0 w-full h-full">
          <div className="w-full h-full flex">
            <div className="w-[487px] h-[227px] bg-[url(/figmaAssets/group-8.png)] bg-[100%_100%] flex flex-col justify-start p-6">
              <div className="text-white text-xs font-semibold tracking-wider mb-2">
                NEWS
              </div>
              <h3 className="text-white text-xl font-bold mb-2">
                Santa Claus is reaching
              </h3>
              <p className="text-white text-sm leading-relaxed">
                He is coming, oh ho. Santa claus is coming to town in
                <br />
                this holiday season. Are you ready to taste your own traditional
                <br />
                food?
              </p>
              <div className="flex gap-2 mt-4">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <div className="w-2 h-2 rounded-full bg-white/50"></div>
                <div className="w-2 h-2 rounded-full bg-white/50"></div>
              </div>
            </div>

            <div className="w-[323px] h-[227px] flex bg-[#d83f31] relative">
              <img
                className="mt-[26px] w-[140px] h-44 ml-[92px] object-cover"
                alt="Two hands with gift"
                src="/figmaAssets/two-hands-with-gift.png"
              />
            </div>
          </div>

          <img
            className="absolute top-[90px] left-[625px] w-[47px] h-[47px]"
            alt="Group"
            src="/figmaAssets/group-12.png"
          />
        </CardContent>
      </Card>

      <img
        className="absolute top-[717px] left-[486px] w-[106px] h-[149px] object-cover"
        alt="Christmas ball"
        src="/figmaAssets/christmas-ball-1.png"
      />

      <img
        className="absolute top-0 left-[369px] w-[1231px] h-[1200px] object-cover"
        alt="Image removebg"
        src="/figmaAssets/image-6-removebg-preview-1.png"
      />

      <img
        className="absolute top-[358px] left-[698px] w-[265px] h-[364px] object-cover"
        alt="Candy stick"
        src="/figmaAssets/candy-stick-1.png"
      />

      <Button className="w-[135px] h-auto top-11 left-[1405px] bg-[#d83f31] hover:bg-[#c13629] flex flex-wrap items-center justify-center gap-[4.04px_4.04px] px-[24.25px] py-[16.17px] absolute rounded-[24.25px]">
        <span className="relative flex-1 mt-[-0.40px] font-sans font-bold text-white text-[15.7px] text-center tracking-[0] leading-[normal]">
          PLAY NOW
        </span>
      </Button>

      <Button className="w-[166px] h-[68px] top-[881px] left-[121px] bg-[#d83f31] hover:bg-[#c13629] flex flex-wrap items-center justify-center gap-[4.04px_4.04px] px-[24.25px] py-[16.17px] absolute rounded-[24.25px]">
        <span className="relative flex-1 font-sans font-bold text-white text-[15.7px] text-center tracking-[0] leading-[normal]">
          PLAY NOW
        </span>
      </Button>

      <Button className="w-[166px] h-[68px] top-[881px] left-[299px] bg-[#d3af64] hover:bg-[#c19d54] flex flex-wrap items-center justify-center gap-[4.04px_4.04px] px-[24.25px] py-[16.17px] absolute rounded-[24.25px]">
        <span className="relative flex-1 font-sans font-bold text-white text-[15.7px] text-center tracking-[0] leading-[normal]">
          VIEW DEMO
        </span>
      </Button>
    </div>
  );
};
