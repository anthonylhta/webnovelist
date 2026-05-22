import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const characters: Record<number, { name: string; role: string }[]> = {
  9: [
    { name: "Unknown Protagonist", role: "Protagonist" },
  ],
  3: [
    { name: "Meng Hao", role: "Protagonist" },
    { name: "Xu Qing", role: "Main Character" },
    { name: "Pill Demon", role: "Supporting" },
    { name: "Lord Fifth", role: "Supporting" },
  ],
  5: [
    { name: "Lin Ming", role: "Protagonist" },
    { name: "Mu Qianyu", role: "Main Character" },
    { name: "Qin Xingxuan", role: "Main Character" },
  ],
  4: [
    { name: "Kim Dokja", role: "Protagonist" },
    { name: "Yoo Joonghyuk", role: "Main Character" },
    { name: "Han Sooyoung", role: "Main Character" },
    { name: "Lee Gilyoung", role: "Supporting" },
    { name: "Shin Yoosung", role: "Supporting" },
  ],
  6: [
    { name: "Roland Wimbledon", role: "Protagonist" },
    { name: "Anna", role: "Main Character" },
    { name: "Nightingale", role: "Main Character" },
    { name: "Wendy", role: "Supporting" },
  ],
  7: [
    { name: "Tang San", role: "Protagonist" },
    { name: "Xiao Wu", role: "Main Character" },
    { name: "Dai Mubai", role: "Main Character" },
    { name: "Oscar", role: "Supporting" },
    { name: "Tang Hao", role: "Supporting" },
  ],
  8: [
    { name: "Arthur Leywin", role: "Protagonist" },
    { name: "Tessia Eralith", role: "Main Character" },
    { name: "Sylvie", role: "Main Character" },
    { name: "Regis", role: "Supporting" },
    { name: "Caera Denoir", role: "Main Character" },
  ],
  13: [
    { name: "Linley Baruch", role: "Protagonist" },
    { name: "Bebe", role: "Main Character" },
    { name: "Delia", role: "Main Character" },
    { name: "Doehring Cowart", role: "Supporting" },
  ],
  12: [
    { name: "Su Ming", role: "Protagonist" },
    { name: "Mo Luo", role: "Supporting" },
  ],
  14: [
    { name: "Ji Ning", role: "Protagonist" },
    { name: "Yu Wei", role: "Main Character" },
    { name: "Brightmoon", role: "Supporting" },
  ],
  11: [
    { name: "Wang Lin", role: "Protagonist" },
    { name: "Li Muwan", role: "Main Character" },
    { name: "Situ Nan", role: "Supporting" },
  ],
  10: [
    { name: "Bai Xiaochun", role: "Protagonist" },
    { name: "Song Junwan", role: "Main Character" },
    { name: "Du Lingfei", role: "Main Character" },
    { name: "Bruiser", role: "Supporting" },
  ],
  20: [
    { name: "Yun Che", role: "Protagonist" },
    { name: "Xia Qingyue", role: "Main Character" },
    { name: "Chu Yuechan", role: "Main Character" },
    { name: "Jasmine", role: "Main Character" },
  ],
  17: [
    { name: "Xiao Yan", role: "Protagonist" },
    { name: "Xun Er", role: "Main Character" },
    { name: "Yao Lao", role: "Main Character" },
    { name: "Medusa", role: "Main Character" },
  ],
  15: [
    { name: "Qin Yu", role: "Protagonist" },
    { name: "Li'er", role: "Main Character" },
    { name: "Hei Yu", role: "Supporting" },
  ],
  16: [
    { name: "Luo Feng", role: "Protagonist" },
    { name: "Xu Xin", role: "Main Character" },
    { name: "Hong", role: "Supporting" },
    { name: "Thunder God", role: "Supporting" },
  ],
  22: [
    { name: "Nie Li", role: "Protagonist" },
    { name: "Ye Ziyun", role: "Main Character" },
    { name: "Xiao Ning'er", role: "Main Character" },
    { name: "Lu Piao", role: "Supporting" },
  ],
  23: [
    { name: "Chu Mu", role: "Protagonist" },
    { name: "Mo Xie", role: "Main Character" },
    { name: "Princess Jin Rou", role: "Main Character" },
  ],
  18: [
    { name: "Mu Chen", role: "Protagonist" },
    { name: "Luo Li", role: "Main Character" },
    { name: "Nine Nether", role: "Main Character" },
  ],
  21: [
    { name: "Yi Yun", role: "Protagonist" },
    { name: "Lin Xintong", role: "Main Character" },
    { name: "Luo Huo'er", role: "Main Character" },
  ],
  19: [
    { name: "Lin Dong", role: "Protagonist" },
    { name: "Ying Huanhuan", role: "Main Character" },
    { name: "Ling Qingzhu", role: "Main Character" },
    { name: "Little Marten", role: "Supporting" },
  ],
  26: [
    { name: "Chen Ge", role: "Protagonist" },
    { name: "Zhang Ya", role: "Main Character" },
    { name: "Xu Yin", role: "Supporting" },
    { name: "Men Nan", role: "Supporting" },
  ],
  25: [
    { name: "Lucien Evans", role: "Protagonist" },
    { name: "Natasha", role: "Main Character" },
    { name: "Fernando", role: "Supporting" },
  ],
  27: [
    { name: "Han Xiao", role: "Protagonist" },
    { name: "Hila", role: "Main Character" },
    { name: "Aurora", role: "Main Character" },
    { name: "Ames", role: "Supporting" },
  ],
  28: [
    { name: "Leylin Farlier", role: "Protagonist" },
    { name: "AI Chip", role: "Supporting" },
  ],
  30: [
    { name: "Yan Zhaoge", role: "Protagonist" },
    { name: "Feng Yunsheng", role: "Main Character" },
    { name: "Ah Hu", role: "Supporting" },
  ],
  34: [
    { name: "Jiang Chen", role: "Protagonist" },
    { name: "Huang'er", role: "Main Character" },
    { name: "Long Xiaoxuan", role: "Supporting" },
  ],
  38: [
    { name: "Huang Xiaolong", role: "Protagonist" },
    { name: "Shi Xiaofei", role: "Main Character" },
  ],
  29: [
    { name: "Zhang Xuan", role: "Protagonist" },
    { name: "Luo Ruoxi", role: "Main Character" },
    { name: "Sun Qiang", role: "Supporting" },
  ],
  36: [
    { name: "Yang Kai", role: "Protagonist" },
    { name: "Su Yan", role: "Main Character" },
    { name: "Xia Ning Chang", role: "Main Character" },
    { name: "Shan Qing Luo", role: "Main Character" },
  ],
  33: [
    { name: "Sunny", role: "Protagonist" },
    { name: "Nephis", role: "Main Character" },
    { name: "Cassie", role: "Main Character" },
    { name: "Saint", role: "Supporting" },
    { name: "Nightmare", role: "Supporting" },
  ],
  32: [
    { name: "Derek / Lith Verhen", role: "Protagonist" },
    { name: "Solus", role: "Main Character" },
    { name: "Kamila", role: "Main Character" },
    { name: "Tista", role: "Supporting" },
  ],
  37: [
    { name: "Jian Chen", role: "Protagonist" },
    { name: "Shangguan Yu'er", role: "Main Character" },
    { name: "You Yue", role: "Main Character" },
  ],
  40: [
    { name: "Lin Feng", role: "Protagonist" },
    { name: "Meng Qing", role: "Main Character" },
  ],
  42: [
    { name: "Shi Hao", role: "Protagonist" },
    { name: "Yun Xi", role: "Main Character" },
  ],
  41: [
    { name: "Qin Lie", role: "Protagonist" },
    { name: "Ling Yushi", role: "Main Character" },
    { name: "Song Tingyu", role: "Main Character" },
  ],
  43: [
    { name: "Zuo Mo", role: "Protagonist" },
    { name: "Pu Yao", role: "Main Character" },
    { name: "Wei Sheng", role: "Supporting" },
    { name: "Lil' Miss", role: "Supporting" },
  ],
  39: [
    { name: "Qin Wentian", role: "Protagonist" },
    { name: "Mo Qingcheng", role: "Main Character" },
    { name: "Qing'er", role: "Main Character" },
  ],
  51: [
    { name: "Unknown Protagonist", role: "Protagonist" },
  ],
  1: [
    { name: "Fang Yuan", role: "Protagonist" },
    { name: "Spectral Soul", role: "Antagonist" },
    { name: "Star Constellation", role: "Antagonist" },
    { name: "Giant Sun", role: "Antagonist" },
    { name: "Hei Lou Lan", role: "Supporting" },
  ],
  46: [
    { name: "Song Shuhang", role: "Protagonist" },
    { name: "Senior White", role: "Main Character" },
    { name: "Soft Feather", role: "Main Character" },
    { name: "Li Yinzhu", role: "Supporting" },
  ],
  44: [
    { name: "Li Yao", role: "Protagonist" },
    { name: "Ding Lingdang", role: "Main Character" },
    { name: "Professor Mo Xuan", role: "Supporting" },
  ],
  45: [
    { name: "Chu Chuyan", role: "Main Character" },
    { name: "Zu An", role: "Protagonist" },
    { name: "Pei Mianman", role: "Main Character" },
    { name: "Zheng Dan", role: "Supporting" },
  ],
  50: [
    { name: "Cha Yeon-woo", role: "Protagonist" },
    { name: "Edora", role: "Main Character" },
    { name: "Brahm", role: "Supporting" },
  ],
  47: [
    { name: "Chen Chang Sheng", role: "Protagonist" },
    { name: "Zhuge Liang", role: "Main Character" },
  ],
  48: [
    { name: "Richard", role: "Protagonist" },
    { name: "Flowsand", role: "Main Character" },
    { name: "Alice", role: "Supporting" },
  ],
  35: [
    { name: "Li Qiye", role: "Protagonist" },
    { name: "Li Shuangyan", role: "Main Character" },
    { name: "Chen Baojun", role: "Supporting" },
  ],
  31: [
    { name: "Li Changshou", role: "Protagonist" },
    { name: "Ling'e", role: "Main Character" },
    { name: "Archmage Xuandu", role: "Supporting" },
  ],
  52: [
    { name: "Unknown Protagonist", role: "Protagonist" },
  ],
  53: [
    { name: "Unknown Protagonist", role: "Protagonist" },
  ],
};

async function main() {
  let total = 0;

  for (const [novelId, chars] of Object.entries(characters)) {
    for (const char of chars) {
      try {
        await prisma.character.upsert({
          where: {
            name_novelId: {
              name: char.name,
              novelId: parseInt(novelId),
            },
          },
          update: { role: char.role },
          create: {
            name: char.name,
            role: char.role,
            novelId: parseInt(novelId),
          },
        });
        total++;
      } catch (error) {
        console.error(`Failed to add ${char.name} for novel ${novelId}:`, error);
      }
    }
  }

  console.log(`Seeded ${total} characters across ${Object.keys(characters).length} novels.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());