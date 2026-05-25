// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const novels = [
  // ============ XIANXIA / XUANHUAN ============
  {
    title: "Reverend Insanity",
    titleChinese: "蛊真人",
    author: "Gu Zhen Ren",
    description: "A story about Fang Yuan, a demonic cultivator who is reborn 500 years into the past with all his memories. Ruthless, cunning, and willing to do anything to achieve immortality. Widely regarded as one of the greatest Chinese webnovels ever written.",
    totalChapters: 2334,
    status: "Hiatus",
    genres: ["Xianxia", "Fantasy", "Action"],
    tags: ["Smart MC", "Villain MC", "Rebirth", "Ruthless MC", "Scheming"],
    originalSource: "Qidian",
    yearPublished: 2012,
  },
  {
    title: "Lord of the Mysteries",
    titleChinese: "诡秘之主",
    author: "Cuttlefish That Loves Diving",
    description: "Zhou Mingrui wakes up in an alternate Victorian era world as Klein Moretti. He finds a mysterious notebook that leads him into a world of mysticism, Beyonder powers, and ancient secrets. A masterpiece of world-building and mystery.",
    totalChapters: 1394,
    status: "Completed",
    genres: ["Mystery", "Fantasy", "Horror"],
    tags: ["Smart MC", "Mystery Solving", "Western Fantasy", "Power System", "Secret Organizations"],
    originalSource: "Qidian",
    yearPublished: 2018,
  },
  {
    title: "I Shall Seal the Heavens",
    titleChinese: "我欲封天",
    author: "Er Gen",
    description: "Meng Hao is a failed scholar who gets kidnapped into a sect of immortal cultivators. With his wits and determination, he rises through the cultivation world. Known for its humor, emotional depth, and unforgettable characters.",
    totalChapters: 1614,
    status: "Completed",
    genres: ["Xianxia", "Fantasy", "Adventure"],
    tags: ["Cultivation", "Comedy", "Clever MC", "Character Growth"],
    originalSource: "Qidian",
    yearPublished: 2014,
  },
  {
    title: "A Will Eternal",
    titleChinese: "一念永恒",
    author: "Er Gen",
    description: "Bai Xiaochun is afraid of dying. In a world of cultivation where death is commonplace, he seeks eternal life while accidentally causing chaos everywhere he goes. A comedic masterpiece by Er Gen.",
    totalChapters: 1314,
    status: "Completed",
    genres: ["Xianxia", "Fantasy", "Comedy"],
    tags: ["Comedy", "Cultivation", "Cowardly MC", "Alchemy", "Shameless MC"],
    originalSource: "Qidian",
    yearPublished: 2016,
  },
  {
    title: "Renegade Immortal",
    titleChinese: "仙逆",
    author: "Er Gen",
    description: "Wang Lin is a smart boy born in a poor village. After failing to find spiritual roots, he stumbles upon a mysterious bead that changes his destiny. Er Gen's first and darkest novel.",
    totalChapters: 2088,
    status: "Completed",
    genres: ["Xianxia", "Fantasy", "Drama"],
    tags: ["Cultivation", "Dark", "Determined MC", "Tragedy", "Revenge"],
    originalSource: "Qidian",
    yearPublished: 2009,
  },
  {
    title: "Pursuit of the Truth",
    titleChinese: "求魔",
    author: "Er Gen",
    description: "Su Ming grows up in a remote village, unaware of the vast cultivation world. After a series of tragic events, he embarks on a journey of cultivation and self-discovery.",
    totalChapters: 1468,
    status: "Completed",
    genres: ["Xianxia", "Fantasy", "Drama"],
    tags: ["Cultivation", "Mystery", "Dark", "Character Development"],
    originalSource: "Qidian",
    yearPublished: 2012,
  },
  {
    title: "Coiling Dragon",
    titleChinese: "盘龙",
    author: "I Eat Tomatoes",
    description: "Linley is the heir of a once-noble clan that has fallen into decline. Armed with a mysterious ring and the bloodline of the Dragonblood Warriors, he sets out to restore his clan's honor. One of the gateway novels to Chinese web fiction.",
    totalChapters: 806,
    status: "Completed",
    genres: ["Xuanhuan", "Fantasy", "Action"],
    tags: ["Cultivation", "Bloodline", "Dragons", "Classic", "Training"],
    originalSource: "Qidian",
    yearPublished: 2008,
  },
  {
    title: "Desolate Era",
    titleChinese: "莽荒纪",
    author: "I Eat Tomatoes",
    description: "Ji Ning, having died young due to illness, is reincarnated into a world of immortals and monsters. With memories of his past life and a strong will, he embarks on his path to become the strongest.",
    totalChapters: 1451,
    status: "Completed",
    genres: ["Xianxia", "Fantasy", "Action"],
    tags: ["Reincarnation", "Cultivation", "Sword Arts", "Cosmic Scale"],
    originalSource: "Qidian",
    yearPublished: 2012,
  },
  {
    title: "Stellar Transformations",
    titleChinese: "星辰变",
    author: "I Eat Tomatoes",
    description: "Qin Yu, the third son of a powerful emperor, is unable to practice internal techniques. He instead trains his body to extraordinary limits before discovering a mysterious meteor that changes everything.",
    totalChapters: 653,
    status: "Completed",
    genres: ["Xianxia", "Fantasy", "Action"],
    tags: ["Body Cultivation", "Space", "Cosmic", "Training"],
    originalSource: "Qidian",
    yearPublished: 2007,
  },
  {
    title: "Swallowed Star",
    titleChinese: "吞噬星空",
    author: "I Eat Tomatoes",
    description: "In a future Earth devastated by a catastrophe called the Grand Nirvana, monsters roam the land. Luo Feng, a young martial artist, discovers that the universe is far vaster and more dangerous than anyone imagined.",
    totalChapters: 1484,
    status: "Completed",
    genres: ["Sci-Fi", "Xuanhuan", "Action"],
    tags: ["Futuristic", "Martial Arts", "Space", "Monsters", "Evolution"],
    originalSource: "Qidian",
    yearPublished: 2010,
  },
  {
    title: "Battle Through the Heavens",
    titleChinese: "斗破苍穹",
    author: "Heavenly Silkworm Potato",
    description: "Xiao Yan was once a genius with immense talent, but mysteriously lost all his powers at age 11. After three years of mockery, he discovers a mysterious soul living in his mother's ring who helps him reclaim his power.",
    totalChapters: 1648,
    status: "Completed",
    genres: ["Xuanhuan", "Fantasy", "Action"],
    tags: ["Cultivation", "Alchemy", "Comeback", "Tournament", "Romance"],
    originalSource: "Qidian",
    yearPublished: 2009,
  },
  {
    title: "The Great Ruler",
    titleChinese: "大主宰",
    author: "Heavenly Silkworm Potato",
    description: "Mu Chen, a boy from the Northern Spiritual Realm, enters the Northern Heavens Spiritual Academy to become a powerful spiritual cultivator and eventually become the Great Ruler of the Great Thousand World.",
    totalChapters: 1565,
    status: "Completed",
    genres: ["Xuanhuan", "Fantasy", "Action"],
    tags: ["Academy", "Cultivation", "Spiritual Energy", "Tournament"],
    originalSource: "Qidian",
    yearPublished: 2013,
  },
  {
    title: "Wu Dong Qian Kun",
    titleChinese: "武动乾坤",
    author: "Heavenly Silkworm Potato",
    description: "Lin Dong, a child of an offshoot branch of the Lin Clan, obtains a mysterious stone talisman that gives him extraordinary abilities. He sets out to restore his family's honor in a world of martial arts.",
    totalChapters: 1314,
    status: "Completed",
    genres: ["Xuanhuan", "Fantasy", "Action"],
    tags: ["Cultivation", "Martial Arts", "Artifact", "Clan Politics"],
    originalSource: "Qidian",
    yearPublished: 2011,
  },
  {
    title: "Against the Gods",
    titleChinese: "逆天邪神",
    author: "Mars Gravity",
    description: "Yun Che, possessing the Sky Poison Pearl, is reborn after being chased off a cliff. With knowledge of his past life and a powerful artifact, he seeks revenge and rises to power in a world where strength is everything.",
    totalChapters: 1900,
    status: "Ongoing",
    genres: ["Xuanhuan", "Fantasy", "Action"],
    tags: ["Reincarnation", "Harem", "OP MC", "Revenge", "Artifact"],
    originalSource: "Qidian",
    yearPublished: 2012,
  },
  {
    title: "Martial World",
    titleChinese: "武极天下",
    author: "Cocooned Cow",
    description: "Lin Ming discovers a mysterious cube containing the memories of a supreme martial artist. He uses this knowledge to rise through the martial world, uncover ancient secrets, and reach heights no one thought possible.",
    totalChapters: 2246,
    status: "Completed",
    genres: ["Xuanhuan", "Fantasy", "Action"],
    tags: ["Cultivation", "Tournament Arc", "Strong MC", "Romance", "Body Refining"],
    originalSource: "Qidian",
    yearPublished: 2015,
  },
  {
    title: "True Martial World",
    titleChinese: "真武世界",
    author: "Cocooned Cow",
    description: "Yi Yun travels to a mystical world and obtains the Purple Crystal Origins, which gives him the ability to see the essence of martial arts. A spiritual sequel to Martial World.",
    totalChapters: 1774,
    status: "Completed",
    genres: ["Xuanhuan", "Fantasy", "Action"],
    tags: ["Cultivation", "Artifact", "Martial Arts", "Weak to Strong"],
    originalSource: "Qidian",
    yearPublished: 2015,
  },
  {
    title: "Soul Land",
    titleChinese: "斗罗大陆",
    author: "Tang Jia San Shao",
    description: "Tang San, a master of hidden weapons, is reborn into a world of martial souls. With his hidden weapon skills and a powerful Blue Silver Grass martial soul, he enrolls in Shrek Academy.",
    totalChapters: 336,
    status: "Completed",
    genres: ["Xuanhuan", "Fantasy", "Romance"],
    tags: ["Academy", "Rebirth", "Martial Souls", "Team Battles"],
    originalSource: "Qidian",
    yearPublished: 2008,
  },
  {
    title: "Tales of Demons and Gods",
    titleChinese: "妖神记",
    author: "Mad Snail",
    description: "Nie Li, the strongest Demon Spiritist, is killed in battle and wakes up as his 13-year-old self. With knowledge of the future, he sets out to save his city, protect his loved ones, and change fate.",
    totalChapters: 550,
    status: "Hiatus",
    genres: ["Xuanhuan", "Fantasy", "Action"],
    tags: ["Rebirth", "Time Travel", "Academy", "Demon Spirits", "Smart MC"],
    originalSource: "Qidian",
    yearPublished: 2015,
  },
  {
    title: "The Charm of Soul Pets",
    titleChinese: "宠魅",
    author: "Fish's Sky",
    description: "In a world where humans bond with soul pets to fight, Chu Mu is thrown into a deadly island to survive with only a small Ice Fox. He must grow stronger to escape and seek revenge.",
    totalChapters: 1648,
    status: "Completed",
    genres: ["Xuanhuan", "Fantasy", "Adventure"],
    tags: ["Monster Taming", "Survival", "Revenge", "Dark"],
    originalSource: "Qidian",
    yearPublished: 2012,
  },

  // ============ WUXIA ============
  {
    title: "A Record of a Mortal's Journey to Immortality",
    titleChinese: "凡人修仙传",
    author: "Wang Yu",
    description: "Han Li, a poor village boy, enters a local sect and begins his long, arduous journey of cultivation. Unlike typical protagonists, Han Li is cautious, pragmatic, and values his life above all else.",
    totalChapters: 2446,
    status: "Completed",
    genres: ["Xianxia", "Fantasy", "Adventure"],
    tags: ["Cautious MC", "Slow Build", "Cultivation", "Alchemy", "Realistic"],
    originalSource: "Qidian",
    yearPublished: 2008,
  },

  // ============ KINGDOM BUILDING / STRATEGY ============
  {
    title: "Release That Witch",
    titleChinese: "放开那个女巫",
    author: "Er Mu",
    description: "A modern engineer is transported into a medieval fantasy world as a prince. Using his scientific knowledge, he works with witches to build a technological civilization while defending against demonic threats.",
    totalChapters: 1498,
    status: "Completed",
    genres: ["Fantasy", "Kingdom Building", "Sci-Fi"],
    tags: ["Kingdom Building", "Modern Knowledge", "Witches", "Technology", "Strategy"],
    originalSource: "Qidian",
    yearPublished: 2016,
  },
  {
    title: "Throne of Magical Arcana",
    titleChinese: "奥术神座",
    author: "Cuttlefish That Loves Diving",
    description: "Lucien Evans transmigrates to a world where the Church of the God of Truth rules supreme and magic is heresy. Using his knowledge of science from Earth, he revolutionizes the magical world.",
    totalChapters: 910,
    status: "Completed",
    genres: ["Fantasy", "Sci-Fi", "Mystery"],
    tags: ["Science", "Magic", "Western Fantasy", "Smart MC", "Kingdom Building"],
    originalSource: "Qidian",
    yearPublished: 2016,
  },

  // ============ MYSTERY / HORROR ============
  {
    title: "My House of Horrors",
    titleChinese: "我有一座恐怖屋",
    author: "I Fix Air-Conditioner",
    description: "Chen Ge inherits a haunted house attraction from his missing parents. He discovers a black phone with missions that lead him to real haunted locations. Completing them gives him ghostly employees for his attraction.",
    totalChapters: 1190,
    status: "Completed",
    genres: ["Horror", "Mystery", "Supernatural"],
    tags: ["Horror", "Ghosts", "Brave MC", "Investigation", "Unique Premise"],
    originalSource: "Qidian",
    yearPublished: 2018,
  },

  // ============ SCI-FI / GAMING ============
  {
    title: "The Legendary Mechanic",
    titleChinese: "超神机械师",
    author: "Chocolion",
    description: "Han Xiao wakes up inside a sci-fi MMORPG he was beta testing, as an NPC. Using his knowledge of the game's future events, he manipulates players and NPCs alike to become the most legendary mechanic.",
    totalChapters: 1463,
    status: "Completed",
    genres: ["Sci-Fi", "Fantasy", "Action"],
    tags: ["Game Elements", "Smart MC", "Future Knowledge", "Mechanic", "Space"],
    originalSource: "Qidian",
    yearPublished: 2018,
  },
  {
    title: "Warlock of the Magus World",
    titleChinese: "巫界术士",
    author: "The Plagiarist",
    description: "Leylin Farlier, a scientist reincarnated with an AI chip in his brain, navigates a dark world of Magi where power is everything. Cold, calculating, and ruthlessly efficient.",
    totalChapters: 1200,
    status: "Completed",
    genres: ["Fantasy", "Sci-Fi", "Action"],
    tags: ["AI Chip", "Ruthless MC", "Dark", "Alchemy", "Scheming"],
    originalSource: "Qidian",
    yearPublished: 2015,
  },

  // ============ COMEDY / SLICE OF LIFE ============
  {
    title: "Library of Heaven's Path",
    titleChinese: "天道图书馆",
    author: "Heng Sao Tian Ya",
    description: "Zhang Xuan, a transmigrator, becomes the worst teacher in a cultivation academy. He discovers he has a Library of Heaven's Path that reveals all flaws in everything, making him an unparalleled teacher.",
    totalChapters: 2264,
    status: "Completed",
    genres: ["Xuanhuan", "Comedy", "Fantasy"],
    tags: ["Comedy", "Teacher MC", "OP MC", "Cultivation", "Face Slapping"],
    originalSource: "Qidian",
    yearPublished: 2016,
  },
  {
    title: "History's Strongest Senior Brother",
    titleChinese: "史上最强师兄",
    author: "August Eagle",
    description: "Yan Zhaoge transmigrates into a xuanhuan novel — not as the protagonist, but as the arrogant senior brother who's supposed to be face-slapped. He decides to flip the script entirely.",
    totalChapters: 1691,
    status: "Completed",
    genres: ["Xuanhuan", "Comedy", "Action"],
    tags: ["Transmigration", "Comedy", "Subversion", "Smart MC", "Meta"],
    originalSource: "Qidian",
    yearPublished: 2016,
  },

  // ============ ROMANCE / DRAMA ============
  {
    title: "My Senior Brother is Too Steady",
    titleChinese: "我师兄实在太稳健了",
    author: "Get to the Point",
    description: "Li Changshou transmigrates into a cultivation world and decides the safest path is the best. He meticulously plans everything, avoids danger at all costs, and somehow becomes incredibly powerful through sheer caution.",
    totalChapters: 758,
    status: "Completed",
    genres: ["Xianxia", "Comedy", "Fantasy"],
    tags: ["Cautious MC", "Comedy", "Planning", "Cultivation", "Smart MC"],
    originalSource: "Qidian",
    yearPublished: 2020,
  },

  // ============ SYSTEM / GAME ELEMENTS ============
  {
    title: "Supreme Magus",
    titleChinese: "至尊法神",
    author: "Legion20",
    description: "Derek McCoy was a man who spent his entire life facing every kind of suffering and betrayal. After dying alone and forgotten, he reincarnates as Lith Verhen in a world of magic.",
    totalChapters: 3200,
    status: "Ongoing",
    genres: ["Fantasy", "Action", "Drama"],
    tags: ["Reincarnation", "Magic", "Dark MC", "Academy", "Anti-Hero"],
    originalSource: "Webnovel",
    yearPublished: 2019,
  },
  {
    title: "Shadow Slave",
    titleChinese: null,
    author: "Guiltythree",
    description: "Sunny was born in the slums of a great city. With nothing to his name, he was fated to die. But when he awakened as a Master, he was given a chance to change his destiny — at a terrible price.",
    totalChapters: 1900,
    status: "Ongoing",
    genres: ["Fantasy", "Action", "Horror"],
    tags: ["Survival", "Dark", "Dream Realm", "Monsters", "Clever MC"],
    originalSource: "Webnovel",
    yearPublished: 2022,
  },

  // ============ MORE CLASSICS ============
  {
    title: "Sovereign of the Three Realms",
    titleChinese: "三界独尊",
    author: "Li Tian",
    description: "Jiang Chen, son of the Celestial Emperor, is reincarnated into the body of a worthless young master. With his vast knowledge from his previous life, he rises to reclaim his former glory.",
    totalChapters: 2376,
    status: "Completed",
    genres: ["Xuanhuan", "Fantasy", "Action"],
    tags: ["Reincarnation", "Alchemy", "Cultivation", "Knowledge Cheat"],
    originalSource: "Qidian",
    yearPublished: 2014,
  },
  {
    title: "Emperor's Domination",
    titleChinese: "帝霸",
    author: "Yan Bi Xiao Sheng",
    description: "Li Qiye, an existence that has lived through countless eras as the Dark Crow, finally obtains a mortal body. He begins his journey anew, with millions of years of knowledge and experience.",
    totalChapters: 5880,
    status: "Completed",
    genres: ["Xuanhuan", "Fantasy", "Action"],
    tags: ["OP MC", "Ancient MC", "Face Slapping", "Cultivation", "Long"],
    originalSource: "Qidian",
    yearPublished: 2013,
  },
  {
    title: "Martial Peak",
    titleChinese: "武炼巅峰",
    author: "Momo",
    description: "Yang Kai, a trial disciple of High Heaven Pavilion, discovers a black book that kickstarts his martial arts journey from the very bottom to the absolute peak of the martial world.",
    totalChapters: 6009,
    status: "Completed",
    genres: ["Xuanhuan", "Fantasy", "Action"],
    tags: ["Cultivation", "Harem", "Weak to Strong", "Space Manipulation", "Long"],
    originalSource: "Qidian",
    yearPublished: 2013,
  },
  {
    title: "Chaotic Sword God",
    titleChinese: "混沌剑神",
    author: "Xin Xing Xiao Yao",
    description: "Jian Chen, the publicly recognized number one expert of the Jianghu, dies in a battle and reincarnates into a foreign world. He retains his sword skills and determination to reach the peak.",
    totalChapters: 3462,
    status: "Completed",
    genres: ["Xuanhuan", "Fantasy", "Action"],
    tags: ["Reincarnation", "Sword Arts", "Cultivation", "Adventure"],
    originalSource: "Qidian",
    yearPublished: 2012,
  },
  {
    title: "Invincible",
    titleChinese: "无敌天下",
    author: "Shen Jian",
    description: "Huang Xiaolong is born with a unique martial spirit — a twin-dragon supreme martial spirit. Follow his journey from a small kingdom to the peak of the divine world.",
    totalChapters: 3777,
    status: "Completed",
    genres: ["Xuanhuan", "Fantasy", "Action"],
    tags: ["Cultivation", "Bloodline", "Dragons", "Weak to Strong"],
    originalSource: "Qidian",
    yearPublished: 2014,
  },
  {
    title: "Ancient Godly Monarch",
    titleChinese: "太古神王",
    author: "Jing Wu Hen",
    description: "In the Nine Heavens, strong warriors can split mountains and overturn seas. Qin Wentian, with a crippled stellar martial spirit, begins his journey to become the most powerful cultivator.",
    totalChapters: 2052,
    status: "Completed",
    genres: ["Xuanhuan", "Fantasy", "Action"],
    tags: ["Cultivation", "Constellations", "Weak to Strong", "Romance"],
    originalSource: "Qidian",
    yearPublished: 2014,
  },
  {
    title: "Peerless Martial God",
    titleChinese: "绝世武神",
    author: "Jing Wu Hen",
    description: "Lin Feng, a modern martial arts enthusiast, transmigrates into the body of a trash cultivator in a world where martial arts reign supreme. He refuses to be trampled upon.",
    totalChapters: 2500,
    status: "Completed",
    genres: ["Xuanhuan", "Fantasy", "Action"],
    tags: ["Transmigration", "Cultivation", "Face Slapping", "Harem"],
    originalSource: "Qidian",
    yearPublished: 2014,
  },
  {
    title: "Spirit Realm",
    titleChinese: "灵域",
    author: "Ni Cang Tian",
    description: "Qin Lie, found with amnesia, slowly uncovers his past as he navigates through a world of spirit realms, ancient mysteries, and powerful factions that all seem connected to his forgotten identity.",
    totalChapters: 1847,
    status: "Completed",
    genres: ["Xuanhuan", "Fantasy", "Action"],
    tags: ["Amnesia", "Mystery", "Cultivation", "Artifacts", "Dark"],
    originalSource: "Qidian",
    yearPublished: 2013,
  },
  {
    title: "Perfect World",
    titleChinese: "完美世界",
    author: "Chen Dong",
    description: "A boy born with supreme talent in a village at the edge of wilderness. Shi Hao, who had his supreme bone stolen, begins his rise in a vast and dangerous world of cultivation.",
    totalChapters: 1562,
    status: "Completed",
    genres: ["Xianxia", "Fantasy", "Action"],
    tags: ["Cultivation", "Supreme Bone", "Ancient Era", "Strong MC"],
    originalSource: "Qidian",
    yearPublished: 2014,
  },
  {
    title: "World of Cultivation",
    titleChinese: "修真世界",
    author: "Fang Xiang",
    description: "Zuo Mo is a zombie-faced, money-obsessed cultivator who just wants to farm and make money. But fate keeps dragging him into conflicts that force him to become increasingly powerful.",
    totalChapters: 915,
    status: "Completed",
    genres: ["Xianxia", "Fantasy", "Comedy"],
    tags: ["Farming", "Money Obsessed MC", "Cultivation", "Comedy", "Unique MC"],
    originalSource: "Qidian",
    yearPublished: 2011,
  },
  {
    title: "Forty Millenniums of Cultivation",
    titleChinese: "修真四万年",
    author: "The Enlightened Master Crouching Cow",
    description: "In a world where cultivation and technology merge, Li Yao, a young man from a junkyard, rises to become a legendary cultivator. A unique blend of sci-fi and xianxia that questions what it means to be human.",
    totalChapters: 3414,
    status: "Completed",
    genres: ["Xianxia", "Sci-Fi", "Action"],
    tags: ["Sci-Fi Cultivation", "Technology", "Philosophy", "Smart MC", "Politics"],
    originalSource: "Qidian",
    yearPublished: 2016,
  },
  {
    title: "Keyboard Immortal",
    titleChinese: "键盘侠",
    author: "Monk of the Six Illusions",
    description: "Zu An transmigrates to a world of cultivation and discovers he has the Keyboard Come system. By making people angry or jealous, he gains Rage Points to use the system. Hilarity ensues.",
    totalChapters: 1600,
    status: "Ongoing",
    genres: ["Xuanhuan", "Comedy", "Romance"],
    tags: ["Comedy", "System", "Shameless MC", "Harem", "Face Slapping"],
    originalSource: "Qidian",
    yearPublished: 2020,
  },
  {
    title: "Cultivation Chat Group",
    titleChinese: "修真聊天群",
    author: "Legend of the Paladin",
    description: "Song Shuhang accidentally joins a chat group of immortal cultivators. What he thought was a group of delusional people turns out to be actual powerful beings. His ordinary life is turned upside down.",
    totalChapters: 2200,
    status: "Completed",
    genres: ["Xianxia", "Comedy", "Slice of Life"],
    tags: ["Modern Day", "Comedy", "Chat Group", "Cultivation", "Slice of Life"],
    originalSource: "Qidian",
    yearPublished: 2016,
  },
  {
    title: "The Grandmaster Strategist",
    titleChinese: "一代军师",
    author: "Follow the Crowd",
    description: "Jiang Zhe, a brilliant strategist and poet, gets caught up in the wars of succession in a world inspired by ancient China. A masterfully written story of politics, war, and poetry.",
    totalChapters: 168,
    status: "Completed",
    genres: ["Historical", "Drama", "Martial Arts"],
    tags: ["Strategy", "Politics", "Poetry", "War", "Smart MC"],
    originalSource: "Qidian",
    yearPublished: 2006,
  },
  {
    title: "City of Sin",
    titleChinese: "罪恶之城",
    author: "Misty South",
    description: "Richard, son of the legendary mage Gaton, grows up in a school for noble runemasters. He must navigate a world of powerful families, war, and planar conquests to find his place.",
    totalChapters: 1200,
    status: "Completed",
    genres: ["Fantasy", "Action", "Drama"],
    tags: ["Western Fantasy", "Runes", "War", "Strategy", "Dark"],
    originalSource: "Qidian",
    yearPublished: 2016,
  },
  {
    title: "Trash of the Count's Family",
    titleChinese: "백작가의 망나니가 되었다",
    author: "Yoo Ryeo Han",
    description: "Kim Rok Soo wakes up as Cale Henituse, the trash of a count's family in a fantasy novel. All he wants is a peaceful, slacker life, but he keeps getting dragged into saving the world.",
    totalChapters: 850,
    status: "Ongoing",
    genres: ["Fantasy", "Comedy", "Adventure"],
    tags: ["Transmigration", "Lazy MC", "Comedy", "Strategy", "Found Family"],
    originalSource: "Munpia",
    yearPublished: 2018,
  },
  {
    title: "Omniscient Reader's Viewpoint",
    titleChinese: "전지적 독자 시점",
    author: "Sing Shong",
    description: "Kim Dokja is the only reader who completed a 3149-chapter webnovel. When that novel becomes reality, he alone knows how the world ends and how to survive it.",
    totalChapters: 551,
    status: "Completed",
    genres: ["Fantasy", "Action", "Drama"],
    tags: ["Apocalypse", "Meta", "Smart MC", "Friendship", "Constellations"],
    originalSource: "Munpia",
    yearPublished: 2018,
  },
  {
    title: "The Beginning After the End",
    titleChinese: null,
    author: "TurtleMe",
    description: "King Grey has unrivaled strength, wealth, and prestige in a world governed by martial ability. However, solitude lingers closely behind those with great power. He is reborn as Arthur Leywin.",
    totalChapters: 500,
    status: "Ongoing",
    genres: ["Fantasy", "Action", "Adventure"],
    tags: ["Reincarnation", "Magic", "Academy", "Dragons"],
    originalSource: "Tapas",
    yearPublished: 2018,
  },
  {
    title: "Second Life Ranker",
    titleChinese: "두 번 사는 랭커",
    author: "Sadoyeon",
    description: "Yeon-woo discovers his twin brother's pocket watch after his brother dies in a mysterious tower. Using his brother's diary, he enters the Tower of the Sun God to seek revenge and power.",
    totalChapters: 801,
    status: "Completed",
    genres: ["Fantasy", "Action", "Adventure"],
    tags: ["Tower", "Revenge", "Monsters", "Growth", "Dark MC"],
    originalSource: "Munpia",
    yearPublished: 2017,
  },
];

async function seedNovels() {
  const existingCount = await prisma.novel.count();
  if (existingCount > 0) {
    console.log(`⚠️  Found ${existingCount} existing novels.`);
    console.log("   Skipping novels that already exist (matching by title)...\n");
  }

  let added = 0;
  let skipped = 0;

  for (const novel of novels) {
    const existing = await prisma.novel.findFirst({ where: { title: novel.title } });

    if (existing) {
      console.log(`  ⏭️  Skipped (exists): ${novel.title}`);
      skipped++;
      continue;
    }

    await prisma.novel.create({
      data: {
        ...novel,
        coverImageUrl: `https://placehold.co/300x400/1a1a2e/ffffff?text=${encodeURIComponent(novel.title)}`,
      },
    });
    console.log(`  ✅ Added: ${novel.title}`);
    added++;
  }

  console.log(`\nNovels — Added: ${added}, Skipped: ${skipped}`);
}

async function seedAuthors() {
  // Collect unique author names from the novels list
  const uniqueNames = [...new Set(novels.map((n) => n.author).filter(Boolean))] as string[];

  let created = 0;
  let skipped = 0;

  for (const name of uniqueNames.sort()) {
    const existing = await prisma.author.findUnique({ where: { name } });

    if (existing) {
      console.log(`  ⏭️  Skipped (exists): ${name}`);
      skipped++;
      continue;
    }

    await prisma.author.create({ data: { name } });
    console.log(`  ✅ Created: ${name}`);
    created++;
  }

  console.log(`\nAuthors — Created: ${created}, Skipped: ${skipped}`);

  // Link each novel's authorId based on matching author string
  const allAuthors = await prisma.author.findMany({ select: { id: true, name: true } });
  const authorMap = new Map(allAuthors.map((a) => [a.name, a.id]));

  const dbNovels = await prisma.novel.findMany({
    where: { author: { not: null } },
    select: { id: true, author: true, authorId: true },
  });

  let linked = 0;
  let alreadyLinked = 0;

  for (const novel of dbNovels) {
    if (!novel.author) continue;
    const authorId = authorMap.get(novel.author);
    if (!authorId) continue;

    if (novel.authorId === authorId) {
      alreadyLinked++;
      continue;
    }

    await prisma.novel.update({ where: { id: novel.id }, data: { authorId } });
    linked++;
  }

  console.log(`Novel links — Linked: ${linked}, Already linked: ${alreadyLinked}`);
}

async function main() {
  console.log("🌱 Seeding database...\n");

  console.log("📚 Seeding novels...");
  await seedNovels();

  console.log("\n✍️  Seeding authors...");
  await seedAuthors();

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