// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const novels = [
  {
    title: "Reverend Insanity",
    titleChinese: "蛊真人",
    author: "Gu Zhen Ren",
    description:
      "A story about Fang Yuan, a demonic cultivator who is reborn 500 years into the past with all his memories. Ruthless, cunning, and willing to do anything to achieve immortality. Widely regarded as one of the greatest Chinese webnovels ever written.",
    coverImageUrl: "https://placehold.co/300x400/1a1a2e/ffffff?text=Reverend+Insanity",
    totalChapters: 2334,
    status: "Hiatus",
    genres: ["Xianxia", "Fantasy", "Action"],
    tags: ["Smart MC", "Villain MC", "Rebirth", "Ruthless MC"],
    originalSource: "Qidian",
    yearPublished: 2012,
  },
  {
    title: "Lord of the Mysteries",
    titleChinese: "诡秘之主",
    author: "Cuttlefish That Loves Diving",
    description:
      "Zhou Mingrui wakes up in an alternate Victorian era world as Klein Moretti. He finds a mysterious notebook that leads him into a world of mysticism, Beyonder powers, and ancient secrets. A masterpiece of world-building and mystery.",
    coverImageUrl: "https://placehold.co/300x400/1a1a2e/ffffff?text=Lord+of+Mysteries",
    totalChapters: 1394,
    status: "Completed",
    genres: ["Mystery", "Fantasy", "Horror"],
    tags: ["Smart MC", "Mystery Solving", "Western Fantasy", "Power System"],
    originalSource: "Qidian",
    yearPublished: 2018,
  },
  {
    title: "I Shall Seal the Heavens",
    titleChinese: "我欲封天",
    author: "Er Gen",
    description:
      "Meng Hao is a failed scholar who gets kidnapped into a sect of immortal cultivators. With his wits and determination, he rises through the cultivation world. Known for its humor, emotional depth, and unforgettable characters.",
    coverImageUrl: "https://placehold.co/300x400/1a1a2e/ffffff?text=ISSTH",
    totalChapters: 1614,
    status: "Completed",
    genres: ["Xianxia", "Fantasy", "Adventure"],
    tags: ["Cultivation", "Comedy", "Clever MC", "Character Growth"],
    originalSource: "Qidian",
    yearPublished: 2014,
  },
  {
    title: "Omniscient Reader's Viewpoint",
    titleChinese: "全知读者视角",
    author: "Sing Shong",
    description:
      "Kim Dokja is the only reader who completed a 3149-chapter webnovel called 'Three Ways to Survive the Apocalypse'. When that novel becomes reality, he alone knows how the world ends and how to survive it.",
    coverImageUrl: "https://placehold.co/300x400/1a1a2e/ffffff?text=ORV",
    totalChapters: 551,
    status: "Completed",
    genres: ["Fantasy", "Action", "Drama"],
    tags: ["Apocalypse", "Meta", "Smart MC", "Friendship"],
    originalSource: "Munpia",
    yearPublished: 2018,
  },
  {
    title: "Martial World",
    titleChinese: "武极天下",
    author: "Cocooned Cow",
    description:
      "Lin Ming, a youth with average talent, discovers a mysterious cube that changes his fate. He embarks on a journey through the martial world, uncovering ancient secrets and reaching heights no one thought possible.",
    coverImageUrl: "https://placehold.co/300x400/1a1a2e/ffffff?text=Martial+World",
    totalChapters: 2246,
    status: "Completed",
    genres: ["Xuanhuan", "Fantasy", "Action"],
    tags: ["Cultivation", "Tournament Arc", "Strong MC", "Romance"],
    originalSource: "Qidian",
    yearPublished: 2015,
  },
  {
    title: "Release That Witch",
    titleChinese: "放开那个女巫",
    author: "Er Mu",
    description:
      "A modern engineer is transported into a medieval fantasy world as a prince. Using his scientific knowledge, he works with witches to build a technological civilization from scratch while defending against demonic threats.",
    coverImageUrl: "https://placehold.co/300x400/1a1a2e/ffffff?text=Release+That+Witch",
    totalChapters: 1498,
    status: "Completed",
    genres: ["Fantasy", "Kingdom Building", "Sci-Fi"],
    tags: ["Kingdom Building", "Modern Knowledge", "Witches", "Technology"],
    originalSource: "Qidian",
    yearPublished: 2016,
  },
  {
    title: "Soul Land",
    titleChinese: "斗罗大陆",
    author: "Tang Jia San Shao",
    description:
      "Tang San, a master of hidden weapons, is reborn into a world of martial souls. With his hidden weapon skills and a powerful Blue Silver Grass martial soul, he enrolls in Shrek Academy and uncovers the secrets of his past.",
    coverImageUrl: "https://placehold.co/300x400/1a1a2e/ffffff?text=Soul+Land",
    totalChapters: 336,
    status: "Completed",
    genres: ["Xuanhuan", "Fantasy", "Romance"],
    tags: ["Academy", "Rebirth", "Martial Souls", "Team Battles"],
    originalSource: "Qidian",
    yearPublished: 2008,
  },
  {
    title: "The Beginning After the End",
    titleChinese: "끝이 아닌 시작",
    author: "TurtleMe",
    description:
      "King Grey has unrivaled strength, wealth, and prestige in a world governed by martial ability. However, solitude lingers closely behind those with great power. He is reborn as Arthur Leywin in a new world of magic.",
    coverImageUrl: "https://placehold.co/300x400/1a1a2e/ffffff?text=TBATE",
    totalChapters: 500,
    status: "Ongoing",
    genres: ["Fantasy", "Action", "Adventure"],
    tags: ["Reincarnation", "Magic", "Academy", "Dragons"],
    originalSource: "Tapas",
    yearPublished: 2018,
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  for (const novel of novels) {
    await prisma.novel.create({ data: novel });
    console.log(`  ✅ Added: ${novel.title}`);
  }

  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });