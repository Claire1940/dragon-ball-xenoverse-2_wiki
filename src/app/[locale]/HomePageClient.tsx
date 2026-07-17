"use client";

import { useState, Suspense, lazy } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  ChevronDown,
  Clock,
  Crown,
  Droplet,
  Dumbbell,
  Flame,
  Gauge,
  Gem,
  GraduationCap,
  Hand,
  Leaf,
  Medal,
  Orbit,
  Package,
  Scale,
  Shield,
  Snowflake,
  Sparkles,
  Star,
  Swords,
  Trophy,
  Users,
  Wind,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { getPreferredMobileBannerSelection } from "@/components/ads/mobileAdConfigs";
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";
import type { ModuleLinkMap } from "@/lib/buildModuleLinkMap";

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`}
  />
);

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  moduleLinkMap: ModuleLinkMap;
  locale: string;
}

// Tools Grid 卡片 -> 模块锚点映射（顺序与 tools.cards 一一对应）
const SECTION_IDS = [
  "beginner-guide",
  "characters-tier-list",
  "best-builds-and-qq-bangs",
  "transformations-and-awoken-skills",
  "parallel-quests-and-expert-missions",
  "skills-and-super-souls",
  "dragon-balls-and-shenron-wishes",
  "dlc-and-updates",
];

// 模块头部（eyebrow + 图标 + 标题 + 简介）
function ModuleHeader({
  eyebrow,
  icon: Icon,
  title,
  intro,
}: {
  eyebrow: string;
  icon: LucideIcon;
  title: string;
  intro: string;
}) {
  return (
    <div className="mb-10 text-center scroll-reveal md:mb-14">
      <div
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--nav-theme)/0.3)]
                   bg-[hsl(var(--nav-theme)/0.1)] px-3 py-1.5 md:mb-5"
      >
        <Icon className="h-4 w-4 text-[hsl(var(--nav-theme-light))]" />
        <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--nav-theme-light))]">
          {eyebrow}
        </span>
      </div>
      <h2 className="mb-4 text-3xl font-bold md:text-5xl">{title}</h2>
      <p className="mx-auto max-w-3xl text-base text-muted-foreground md:text-lg">
        {intro}
      </p>
    </div>
  );
}

// 难度语义配色（Tailwind 调色板，无硬编码 hex）
function difficultyClasses(difficulty: string): string {
  const d = difficulty.toLowerCase();
  if (d.includes("extreme") || d.includes("very high"))
    return "bg-red-500/10 border-red-500/30 text-red-400";
  if (d.includes("high")) return "bg-orange-500/10 border-orange-500/30 text-orange-400";
  if (d.includes("mid")) return "bg-amber-500/10 border-amber-500/30 text-amber-400";
  return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
}

// 梯队语义配色
function tierClasses(tier: string): string {
  switch (tier) {
    case "S":
      return "bg-amber-500/15 border-amber-500/40 text-amber-400";
    case "A":
      return "bg-emerald-500/15 border-emerald-500/40 text-emerald-400";
    case "B":
      return "bg-sky-500/15 border-sky-500/40 text-sky-400";
    default:
      return "bg-slate-500/15 border-slate-500/40 text-slate-400";
  }
}

export default function HomePageClient({
  latestArticles,
  moduleLinkMap,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://dragon-ball-xenoverse-2.wiki";

  // FAQ / DLC 手风琴状态
  const [faqExpanded, setFaqExpanded] = useState<number | null>(null);
  const [dlcExpanded, setDlcExpanded] = useState<number | null>(null);
  const mobileBannerAd = getPreferredMobileBannerSelection();

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Dragon Ball Xenoverse 2 Wiki",
        description:
          "Dragon Ball Xenoverse 2 Wiki with builds, race guides, skills, transformations, Parallel Quests, DLC characters, QQ Bangs, raids, and update guides.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Dragon Ball Xenoverse 2 - Time Patroller Action RPG",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Dragon Ball Xenoverse 2 Wiki",
        alternateName: "Dragon Ball Xenoverse 2",
        url: siteUrl,
        description:
          "Dragon Ball Xenoverse 2 Wiki resource hub for builds, characters, skills, transformations, Parallel Quests, DLC and raid guides",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Dragon Ball Xenoverse 2 Wiki - Time Patroller Action RPG",
        },
        sameAs: [
          "https://store.steampowered.com/app/454650/DRAGON_BALL_XENOVERSE_2/",
          "https://en.bandainamcoent.eu/dragon-ball/dragon-ball-xenoverse-2",
          "https://www.reddit.com/r/dbxv/",
          "https://www.youtube.com/@BandaiNamcoAmerica",
        ],
      },
      {
        "@type": "VideoGame",
        name: "Dragon Ball Xenoverse 2",
        gamePlatform: ["PC", "Steam", "PlayStation 4", "Xbox One", "Nintendo Switch"],
        applicationCategory: "Game",
        genre: ["Fighting", "Action RPG", "Anime"],
        numberOfPlayers: {
          minValue: 1,
          maxValue: 6,
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://store.steampowered.com/app/454650/DRAGON_BALL_XENOVERSE_2/",
        },
      },
      {
        "@type": "VideoObject",
        name: "Launch Trailer - Dragon Ball Xenoverse 2",
        description:
          "Official Dragon Ball Xenoverse 2 launch trailer from Bandai Namco Entertainment.",
        uploadDate: "2016-10-25",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/JnUbg-9v_bE",
        url: "https://www.youtube.com/watch?v=JnUbg-9v_bE",
      },
    ],
  };

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-24 pb-14 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 text-center scroll-reveal">
            {/* Badge */}
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full border
                         border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)]
                         px-3 py-1.5 md:mb-6 md:px-4 md:py-2"
            >
              <Sparkles className="h-4 w-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs font-medium md:text-sm">{t.hero.badge}</span>
            </div>

            {/* Title */}
            <h1 className="mb-4 text-4xl font-bold leading-[1.05] sm:text-5xl md:mb-6 md:text-7xl">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <button
                onClick={() => scrollToSection("best-builds-and-qq-bangs")}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--nav-theme))]
                           px-6 py-3.5 font-semibold text-base text-white transition-colors
                           hover:bg-[hsl(var(--nav-theme)/0.9)] md:px-8 md:py-4 md:text-lg"
              >
                <BookOpen className="h-5 w-5" />
                {t.hero.getFreeCodesCTA}
              </button>
              <a
                href="https://store.steampowered.com/app/454650/DRAGON_BALL_XENOVERSE_2/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border
                           px-6 py-3.5 font-semibold text-base transition-colors hover:bg-white/10
                           md:px-8 md:py-4 md:text-lg"
              >
                {t.hero.playOnSteamCTA}
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* Video Section - 紧跟 Hero（容器上限 max-w-5xl，避免挤压广告） */}
      <section className="px-4 py-10 md:py-12">
        <div className="container mx-auto max-w-5xl scroll-reveal">
          <div className="relative overflow-hidden rounded-2xl border border-border">
            <VideoFeature
              videoId="JnUbg-9v_bE"
              title="Launch Trailer - Dragon Ball Xenoverse 2"
            />
          </div>
        </div>
      </section>

      {/* Tools Grid - 8 Navigation Cards（位于视频区之后、Latest Updates 之前） */}
      <section className="bg-white/[0.02] px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-8 text-center scroll-reveal md:mb-12">
            <h2 className="mb-3 text-3xl font-bold md:mb-4 md:text-5xl">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {t.tools.cards.map((card: any, index: number) => {
              const sectionId = SECTION_IDS[index];
              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(sectionId)}
                  className="group scroll-reveal cursor-pointer rounded-xl border border-border bg-card p-4 text-left
                             transition-all duration-300 hover:border-[hsl(var(--nav-theme)/0.5)]
                             hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)] md:p-6"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg
                               bg-[hsl(var(--nav-theme)/0.1)] transition-colors
                               group-hover:bg-[hsl(var(--nav-theme)/0.2)] md:mb-4 md:h-12 md:w-12"
                  >
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 text-[hsl(var(--nav-theme-light))] md:h-6 md:w-6"
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm font-semibold md:text-base">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 广告位 2: 首屏内容之后 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端方形 / 桌面端横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 1: Beginner Guide */}
      <section id="beginner-guide" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={t.modules.beginnerGuide.eyebrow}
            icon={GraduationCap}
            title={t.modules.beginnerGuide.title}
            intro={t.modules.beginnerGuide.intro}
          />

          {/* Steps */}
          <div className="mb-8 space-y-3 scroll-reveal md:mb-10 md:space-y-4">
            {t.modules.beginnerGuide.steps.map((step: any, index: number) => (
              <div
                key={index}
                className="flex gap-3 rounded-xl border border-border bg-white/5 p-4 transition-colors
                           hover:border-[hsl(var(--nav-theme)/0.5)] md:gap-4 md:p-6"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full
                                border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)]
                                md:h-12 md:w-12">
                  <span className="text-base font-bold text-[hsl(var(--nav-theme-light))] md:text-xl">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <h3 className="mb-1.5 text-lg font-bold md:mb-2 md:text-xl">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground md:text-base">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Tips */}
          <div className="scroll-reveal rounded-xl border border-[hsl(var(--nav-theme)/0.3)]
                          bg-[hsl(var(--nav-theme)/0.05)] p-4 md:p-6">
            <div className="mb-3 flex items-center gap-2 md:mb-4">
              <BookOpen className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="text-base font-bold md:text-lg">Quick Tips</h3>
            </div>
            <ul className="space-y-2">
              {t.modules.beginnerGuide.quickTips.map((tip: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                  <span className="text-sm text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Module 2: Characters Tier List */}
      <section
        id="characters-tier-list"
        className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={t.modules.charactersTierList.eyebrow}
            icon={Trophy}
            title={t.modules.charactersTierList.title}
            intro={t.modules.charactersTierList.intro}
          />

          <div className="space-y-4 scroll-reveal md:space-y-5">
            {t.modules.charactersTierList.tiers.map((tier: any, index: number) => {
              const tierIcons: Record<string, LucideIcon> = {
                S: Trophy,
                A: Medal,
                B: Award,
                C: Star,
              };
              const TierIcon = tierIcons[tier.tier] || Star;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-white/5 p-4 md:p-6"
                >
                  <div className="mb-3 flex items-center gap-3 md:mb-4">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-lg border text-lg font-extrabold md:h-12 md:w-12 ${tierClasses(
                        tier.tier,
                      )}`}
                    >
                      {tier.tier}
                    </span>
                    <div className="flex items-center gap-2">
                      <TierIcon className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
                      <h3 className="text-lg font-bold md:text-xl">
                        {tier.label}
                      </h3>
                    </div>
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground md:mb-4">
                    {tier.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tier.characters.map((c: string, ci: number) => (
                      <span
                        key={ci}
                        className="inline-flex items-center rounded-full border border-border bg-white/5
                                   px-3 py-1 text-xs font-medium md:text-sm"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Note */}
          <div className="mt-6 scroll-reveal rounded-xl border border-[hsl(var(--nav-theme)/0.3)]
                          bg-[hsl(var(--nav-theme)/0.05)] p-4 md:p-6 md:mt-8">
            <div className="flex items-start gap-3">
              <Star className="mt-0.5 h-5 w-5 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
              <p className="text-sm text-muted-foreground">
                {t.modules.charactersTierList.note}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 广告位 4: 页面中段阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 3: Best Builds and QQ Bangs */}
      <section
        id="best-builds-and-qq-bangs"
        className="scroll-mt-24 px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={t.modules.bestBuildsAndQQBangs.eyebrow}
            icon={Dumbbell}
            title={t.modules.bestBuildsAndQQBangs.title}
            intro={t.modules.bestBuildsAndQQBangs.intro}
          />

          {/* Builds */}
          <div className="grid grid-cols-1 gap-4 scroll-reveal md:grid-cols-2 lg:grid-cols-3">
            {(() => {
              const buildIcons: LucideIcon[] = [
                Zap,
                Hand,
                Scale,
                Shield,
                Wind,
                Gem,
              ];
              return t.modules.bestBuildsAndQQBangs.builds.map(
                (build: any, index: number) => {
                  const BuildIcon = buildIcons[index % buildIcons.length];
                  return (
                    <div
                      key={index}
                      className="rounded-xl border border-border bg-white/5 p-6 transition-colors
                                 hover:border-[hsl(var(--nav-theme)/0.5)]"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.1)]">
                          <BuildIcon className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
                        </div>
                        <span className="text-xs rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-2 py-1">
                          {build.role}
                        </span>
                      </div>
                      <h3 className="mb-1 font-bold text-[hsl(var(--nav-theme-light))]">
                        {build.name}
                      </h3>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {build.focus}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {build.description}
                      </p>
                    </div>
                  );
                },
              );
            })()}
          </div>

          {/* QQ Bangs */}
          <div className="mt-8 scroll-reveal md:mt-10">
            <div className="mb-4 flex items-center gap-2">
              <Gem className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="text-lg font-bold md:text-xl">QQ Bangs</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {t.modules.bestBuildsAndQQBangs.qqBangs.map((q: any, index: number) => (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-white/5 p-5 transition-colors
                             hover:border-[hsl(var(--nav-theme)/0.5)]"
                >
                  <h4 className="mb-1.5 font-semibold text-[hsl(var(--nav-theme-light))]">
                    {q.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">{q.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Module 4: Transformations and Awoken Skills */}
      <section
        id="transformations-and-awoken-skills"
        className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={t.modules.transformationsAndAwokenSkills.eyebrow}
            icon={Zap}
            title={t.modules.transformationsAndAwokenSkills.title}
            intro={t.modules.transformationsAndAwokenSkills.intro}
          />

          <div className="grid grid-cols-1 gap-4 scroll-reveal md:grid-cols-2">
            {(() => {
              const raceIconFor = (name: string): LucideIcon => {
                const n = name.toLowerCase();
                if (n.includes("god") || n.includes("blue") || n.includes("instinct") || n.includes("beast") || n.includes("potential"))
                  return Crown;
                if (n.includes("golden") || n.includes("frieza")) return Snowflake;
                if (n.includes("purification") || n.includes("majin")) return Droplet;
                if (n.includes("giant") || n.includes("namekian")) return Leaf;
                return Flame;
              };
              return t.modules.transformationsAndAwokenSkills.transformations.map(
                (tr: any, index: number) => {
                  const RaceIcon = raceIconFor(tr.name + " " + tr.race);
                  return (
                    <div
                      key={index}
                      className="rounded-xl border border-border bg-white/5 p-5 transition-colors
                                 hover:border-[hsl(var(--nav-theme)/0.5)] md:p-6"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.1)]">
                            <RaceIcon className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
                          </div>
                          <h3 className="font-bold">{tr.name}</h3>
                        </div>
                        <span className="whitespace-nowrap rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-2.5 py-1 text-xs font-semibold">
                          {tr.kiCost}
                        </span>
                      </div>
                      <div className="mb-2 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full border border-border bg-white/5 px-2 py-0.5">
                          {tr.race}
                        </span>
                      </div>
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Effect: </span>
                        {tr.effect}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Unlock: </span>
                        {tr.unlock}
                      </p>
                    </div>
                  );
                },
              );
            })()}
          </div>
        </div>
      </section>

      {/* Module 5: Parallel Quests and Expert Missions */}
      <section
        id="parallel-quests-and-expert-missions"
        className="scroll-mt-24 px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={t.modules.parallelQuestsAndExpertMissions.eyebrow}
            icon={Swords}
            title={t.modules.parallelQuestsAndExpertMissions.title}
            intro={t.modules.parallelQuestsAndExpertMissions.intro}
          />

          <div className="grid grid-cols-1 gap-4 scroll-reveal md:grid-cols-2">
            {t.modules.parallelQuestsAndExpertMissions.quests.map(
              (q: any, index: number) => {
                const isExpert = q.mode.includes("Expert");
                const ModeIcon = isExpert ? Users : Swords;
                return (
                  <div
                    key={index}
                    className="rounded-xl border border-border bg-white/5 p-5 transition-colors
                               hover:border-[hsl(var(--nav-theme)/0.5)] md:p-6"
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-2.5 py-1 text-xs font-medium">
                        <ModeIcon className="h-3.5 w-3.5 text-[hsl(var(--nav-theme-light))]" />
                        {q.mode}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${difficultyClasses(
                          q.difficulty,
                        )}`}
                      >
                        {q.difficulty}
                      </span>
                    </div>
                    <h3 className="mb-2 font-bold md:text-lg">{q.mission}</h3>
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Rewards: </span>
                      {q.rewards}
                    </p>
                    <p className="text-sm text-muted-foreground">{q.strategy}</p>
                  </div>
                );
              },
            )}
          </div>

          {/* Scoring tip */}
          <div className="mt-6 scroll-reveal rounded-xl border border-[hsl(var(--nav-theme)/0.3)]
                          bg-[hsl(var(--nav-theme)/0.05)] p-4 md:mt-8 md:p-6">
            <div className="flex items-start gap-3">
              <Trophy className="mt-0.5 h-5 w-5 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
              <p className="text-sm text-muted-foreground">
                {t.modules.parallelQuestsAndExpertMissions.scoringTip}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 广告位 5: 移动端横幅 */}
      {mobileBannerAd && (
        <AdBanner
          type={mobileBannerAd.type}
          adKey={mobileBannerAd.adKey}
          className="md:hidden"
        />
      )}

      {/* Module 6: Skills and Super Souls */}
      <section
        id="skills-and-super-souls"
        className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={t.modules.skillsAndSuperSouls.eyebrow}
            icon={Sparkles}
            title={t.modules.skillsAndSuperSouls.title}
            intro={t.modules.skillsAndSuperSouls.intro}
          />

          <div className="grid grid-cols-1 gap-4 scroll-reveal md:grid-cols-2 lg:grid-cols-3">
            {(() => {
              const typeIconFor = (type: string): LucideIcon => {
                const n = type.toLowerCase();
                if (n.includes("charge")) return Gauge;
                if (n.includes("ultimate")) return Sparkles;
                if (n.includes("evasive")) return Wind;
                if (n.includes("super soul")) return Star;
                return Zap;
              };
              return t.modules.skillsAndSuperSouls.skills.map(
                (s: any, index: number) => {
                  const TypeIcon = typeIconFor(s.type);
                  return (
                    <div
                      key={index}
                      className="rounded-xl border border-border bg-white/5 p-5 transition-colors
                                 hover:border-[hsl(var(--nav-theme)/0.5)]"
                    >
                      <div className="mb-3 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-2.5 py-1 text-xs font-medium">
                          <TypeIcon className="h-3.5 w-3.5 text-[hsl(var(--nav-theme-light))]" />
                          {s.type}
                        </span>
                      </div>
                      <h3 className="mb-2 font-bold text-[hsl(var(--nav-theme-light))]">
                        {s.name}
                      </h3>
                      <p className="mb-2 text-sm text-muted-foreground">{s.effect}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                        <span className="rounded border border-border bg-white/5 px-1.5 py-0.5">
                          {s.source}
                        </span>
                        <span className="rounded border border-border bg-white/5 px-1.5 py-0.5">
                          DLC: {s.dlc}
                        </span>
                      </div>
                    </div>
                  );
                },
              );
            })()}
          </div>

          {/* Combo tip */}
          <div className="mt-6 scroll-reveal rounded-xl border border-[hsl(var(--nav-theme)/0.3)]
                          bg-[hsl(var(--nav-theme)/0.05)] p-4 md:mt-8 md:p-6">
            <div className="flex items-start gap-3">
              <Zap className="mt-0.5 h-5 w-5 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
              <p className="text-sm text-muted-foreground">
                {t.modules.skillsAndSuperSouls.comboTip}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Module 7: Dragon Balls and Shenron Wishes */}
      <section
        id="dragon-balls-and-shenron-wishes"
        className="scroll-mt-24 px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={t.modules.dragonBallsAndShenronWishes.eyebrow}
            icon={Orbit}
            title={t.modules.dragonBallsAndShenronWishes.title}
            intro={t.modules.dragonBallsAndShenronWishes.intro}
          />

          {/* Farm steps */}
          <div className="mb-10 scroll-reveal md:mb-12">
            <div className="mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="text-lg font-bold md:text-xl">
                Fast Dragon Ball Farming Route
              </h3>
            </div>
            <div className="relative space-y-4 border-l-2 border-[hsl(var(--nav-theme)/0.3)] pl-6 md:space-y-5">
              {t.modules.dragonBallsAndShenronWishes.farmSteps.map(
                (step: any, index: number) => (
                  <div key={index} className="relative">
                    <div className="absolute -left-[1.65rem] flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-[hsl(var(--nav-theme))]" />
                    <div className="rounded-xl border border-border bg-white/5 p-4 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)] md:p-5">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--nav-theme)/0.2)] text-xs font-bold text-[hsl(var(--nav-theme-light))]">
                          {index + 1}
                        </span>
                        <h4 className="font-semibold">{step.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{step.details}</p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Wishes */}
          <div className="scroll-reveal">
            <div className="mb-4 flex items-center gap-2">
              <Orbit className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="text-lg font-bold md:text-xl">Best Shenron Wishes</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {t.modules.dragonBallsAndShenronWishes.wishes.map(
                (w: any, index: number) => (
                  <div
                    key={index}
                    className="rounded-xl border border-border bg-white/5 p-5 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)]"
                  >
                    <div className="mb-2 flex items-start gap-2">
                      <Star className="mt-0.5 h-4 w-4 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                      <h4 className="font-semibold text-[hsl(var(--nav-theme-light))]">
                        {w.wish}
                      </h4>
                    </div>
                    <p className="mb-1.5 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Reward: </span>
                      {w.reward}
                    </p>
                    <p className="text-sm text-muted-foreground">{w.bestFor}</p>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Module 8: DLC and Updates (Accordion) */}
      <section
        id="dlc-and-updates"
        className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={t.modules.dlcAndUpdates.eyebrow}
            icon={Package}
            title={t.modules.dlcAndUpdates.title}
            intro={t.modules.dlcAndUpdates.intro}
          />

          <div className="space-y-3 scroll-reveal">
            {t.modules.dlcAndUpdates.packs.map((pack: any, index: number) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-border bg-white/5"
              >
                <button
                  onClick={() => setDlcExpanded(dlcExpanded === index ? null : index)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-white/5 md:p-5"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-2.5 py-1 text-xs font-medium">
                      {pack.group}
                    </span>
                    <span className="font-semibold md:text-lg">{pack.name}</span>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 flex-shrink-0 transition-transform ${
                      dlcExpanded === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {dlcExpanded === index && (
                  <div className="space-y-3 px-4 pb-5 text-sm md:px-5">
                    {pack.characters && (
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Characters: </span>
                        {pack.characters}
                      </p>
                    )}
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">Contents: </span>
                      {pack.contents}
                    </p>
                    <div className="flex items-start gap-2 rounded-lg border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.05)] p-3">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                      <p className="text-muted-foreground">{pack.note}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Duplicate tip */}
          <div className="mt-6 flex items-start gap-3 scroll-reveal rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 md:mt-8 md:p-6">
            <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
            <p className="text-sm text-muted-foreground">
              {t.modules.dlcAndUpdates.duplicateTip}
            </p>
          </div>
        </div>
      </section>

      {/* Latest Updates Section（位于 8 模块之后） */}
      <LatestGuidesAccordion articles={latestArticles} locale={locale} max={12} />

      {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* 广告位 6: 页脚前 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Footer */}
      <footer className="border-t border-border bg-white/[0.02]">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Brand */}
            <div>
              <h3 className="mb-4 text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">{t.footer.description}</p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="mb-4 font-semibold">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.reddit.com/r/dbxv/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.discord}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/@BandaiNamcoAmerica"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.twitter}
                  </a>
                </li>
                <li>
                  <a
                    href="https://steamcommunity.com/app/454650"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.steamCommunity}
                  </a>
                </li>
                <li>
                  <a
                    href="https://store.steampowered.com/app/454650/DRAGON_BALL_XENOVERSE_2/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.steamStore}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="mb-4 font-semibold">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="mb-2 text-sm text-muted-foreground">{t.footer.copyright}</p>
              <p className="text-xs text-muted-foreground">{t.footer.disclaimer}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
