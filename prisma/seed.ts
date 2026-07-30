// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const novels = [
  // ============ XIANXIA / XUANHUAN ============
  {
    title: "Reverend Insanity",
    nativeTitle: "蛊真人",
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
    nativeTitle: "诡秘之主",
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
    nativeTitle: "我欲封天",
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
    nativeTitle: "一念永恒",
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
    nativeTitle: "仙逆",
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
    nativeTitle: "求魔",
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
    nativeTitle: "盘龙",
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
    nativeTitle: "莽荒纪",
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
    nativeTitle: "星辰变",
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
    nativeTitle: "吞噬星空",
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
    nativeTitle: "斗破苍穹",
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
    nativeTitle: "大主宰",
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
    nativeTitle: "武动乾坤",
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
    nativeTitle: "逆天邪神",
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
    nativeTitle: "武极天下",
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
    nativeTitle: "真武世界",
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
    nativeTitle: "斗罗大陆",
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
    nativeTitle: "妖神记",
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
    nativeTitle: "宠魅",
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
    nativeTitle: "凡人修仙传",
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
    nativeTitle: "放开那个女巫",
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
    nativeTitle: "奥术神座",
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
    nativeTitle: "我有一座恐怖屋",
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
    nativeTitle: "超神机械师",
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
    nativeTitle: "巫界术士",
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
    nativeTitle: "天道图书馆",
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
    nativeTitle: "史上最强师兄",
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
    nativeTitle: "我师兄实在太稳健了",
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
    nativeTitle: "至尊法神",
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
    nativeTitle: null,
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
    nativeTitle: "三界独尊",
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
    nativeTitle: "帝霸",
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
    nativeTitle: "武炼巅峰",
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
    nativeTitle: "混沌剑神",
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
    nativeTitle: "无敌天下",
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
    nativeTitle: "太古神王",
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
    nativeTitle: "绝世武神",
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
    nativeTitle: "灵域",
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
    nativeTitle: "完美世界",
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
    nativeTitle: "修真世界",
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
    nativeTitle: "修真四万年",
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
    nativeTitle: "键盘侠",
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
    nativeTitle: "修真聊天群",
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
    nativeTitle: "一代军师",
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
    nativeTitle: "罪恶之城",
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
    nativeTitle: "백작가의 망나니가 되었다",
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
    nativeTitle: "전지적 독자 시점",
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
    nativeTitle: null,
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
    nativeTitle: "두 번 사는 랭커",
    author: "Sadoyeon",
    description: "Yeon-woo discovers his twin brother's pocket watch after his brother dies in a mysterious tower. Using his brother's diary, he enters the Tower of the Sun God to seek revenge and power.",
    totalChapters: 801,
    status: "Completed",
    genres: ["Fantasy", "Action", "Adventure"],
    tags: ["Tower", "Revenge", "Monsters", "Growth", "Dark MC"],
    originalSource: "Munpia",
    yearPublished: 2017,
  },

  // ============ KOREAN ============
  {
    title: "Solo Leveling",
    nativeTitle: "나 혼자만 레벨업",
    author: "Chugong",
    description: "In a world where hunters battle monsters from dimensional gates, Sung Jin-Woo is the weakest E-rank hunter. After nearly dying in a double dungeon, he awakens a mysterious 'System' that lets him level up without limit.",
    totalChapters: 270,
    status: "Completed",
    genres: ["Fantasy", "Action", "Adventure"],
    tags: ["System", "Weak to Strong", "Monsters", "Dungeons", "OP MC"],
    originalSource: "KakaoPage",
    yearPublished: 2016,
  },
  {
    title: "The Legendary Moonlight Sculptor",
    nativeTitle: "달빛조각사",
    author: "Nam Hee-sung",
    description: "Lee Hyun, drowning in debt, turns to the virtual reality game Royal Road to earn money. He becomes Weed, a sculptor-class player whose relentless grinding and scheming make him a legend.",
    totalChapters: 1788,
    status: "Completed",
    genres: ["Fantasy", "Action", "Adventure"],
    tags: ["Game Elements", "VRMMO", "Money Obsessed MC", "Hard Work"],
    originalSource: "Naver Series",
    yearPublished: 2007,
  },
  {
    title: "Overgeared",
    nativeTitle: "템빨",
    author: "Park Saenal",
    description: "Shin Youngwoo, an unlucky laborer in the VR game Satisfy, stumbles upon the legacy of the legendary blacksmith Pagma. He rises from the bottom to become the strongest 'Overgeared' player.",
    totalChapters: 1840,
    status: "Ongoing",
    genres: ["Fantasy", "Action", "Adventure"],
    tags: ["Game Elements", "VRMMO", "Crafting", "Weak to Strong"],
    originalSource: "KakaoPage",
    yearPublished: 2014,
  },
  {
    title: "The Novel's Extra",
    nativeTitle: "소설 속 엑스트라",
    author: "Jee Gab Song",
    description: "Kim Hajin wakes up inside the world of the web novel he was writing, as a nameless extra. Using his knowledge of the plot, he navigates a story full of dangers he himself created.",
    totalChapters: 336,
    status: "Completed",
    genres: ["Fantasy", "Action", "Adventure"],
    tags: ["Transmigration", "Smart MC", "Future Knowledge", "Academy"],
    originalSource: "Munpia",
    yearPublished: 2017,
  },
  {
    title: "Return of the Mount Hua Sect",
    nativeTitle: "화산귀환",
    author: "Biga",
    description: "Chung Myung, the greatest swordsman of the now-fallen Mount Hua Sect, dies defeating the Heavenly Demon. He awakens a hundred years later in a child's body, determined to restore his sect to glory.",
    totalChapters: 2064,
    status: "Completed",
    genres: ["Martial Arts", "Action", "Comedy"],
    tags: ["Reincarnation", "Sword Arts", "Sect", "Comedy"],
    originalSource: "Munpia",
    yearPublished: 2021,
  },
  {
    title: "SSS-Class Suicide Hunter",
    nativeTitle: "SSS급 자살헌터",
    author: "Shin Noah",
    description: "Kim Gongja gains the skill of a legendary hero, but its true power only unlocks when he dies. To grow stronger, he must repeatedly kill himself in increasingly creative ways.",
    totalChapters: 290,
    status: "Completed",
    genres: ["Fantasy", "Action", "Mystery"],
    tags: ["System", "Time Loop", "Dark", "Smart MC"],
    originalSource: "KakaoPage",
    yearPublished: 2020,
  },
  {
    title: "Nano Machine",
    nativeTitle: "나노마신",
    author: "Han Joong Wol Ya",
    description: "Cheon Yeo-Woon, a lowly outcast in the Demonic Cult, is implanted with a nano machine from the future by a descendant. It transforms his body and sets him on a path to the peak of the martial world.",
    totalChapters: 529,
    status: "Completed",
    genres: ["Martial Arts", "Action", "Sci-Fi"],
    tags: ["Sci-Fi", "Martial Arts", "Weak to Strong", "Sect"],
    originalSource: "Munpia",
    yearPublished: 2020,
  },
  {
    title: "A Returner's Magic Should Be Special",
    nativeTitle: "회귀자의 마법은 특별해야 합니다",
    author: "Wahaha Pyon",
    description: "Desir Arman, one of the last survivors of a world consumed by the Shadow Labyrinth, is sent thirteen years into the past. He vows to prevent the catastrophe and save his comrades.",
    totalChapters: 312,
    status: "Completed",
    genres: ["Fantasy", "Action", "Adventure"],
    tags: ["Regression", "Magic", "Academy", "Smart MC"],
    originalSource: "Munpia",
    yearPublished: 2017,
  },
  {
    title: "Everyone Else is a Returnee",
    nativeTitle: "나 빼고 다 귀환자",
    author: "Toika",
    description: "While thousands of people were whisked away to another world to train as returnees, Yu Ilhan was left behind on Earth alone for a thousand years. When the others return, he has secretly become the strongest of all.",
    totalChapters: 304,
    status: "Completed",
    genres: ["Fantasy", "Comedy", "Action"],
    tags: ["OP MC", "Comedy", "Crafting", "Monsters"],
    originalSource: "Munpia",
    yearPublished: 2016,
  },
  {
    title: "The Greatest Estate Developer",
    nativeTitle: null,
    author: "Lee Hyun-min",
    description: "Kim Suho, a hardcore civil engineering student, transmigrates into the body of Lloyd Frontera, a lazy noble drowning in debt. He uses modern engineering knowledge to develop his territory and dodge a doomed fate.",
    totalChapters: 250,
    status: "Ongoing",
    genres: ["Fantasy", "Comedy", "Kingdom Building"],
    tags: ["Transmigration", "Modern Knowledge", "Comedy", "Kingdom Building"],
    originalSource: "KakaoPage",
    yearPublished: 2021,
  },
  {
    title: "Damn Reincarnation",
    nativeTitle: "빌어먹을 환생",
    author: "Mocheon-dang",
    description: "Hamel, a human warrior who died defeating the Demon King, reincarnates as Eugene, the descendant of his old comrade Vermouth. He sets out to finish what his former companions left undone.",
    totalChapters: 320,
    status: "Ongoing",
    genres: ["Fantasy", "Action", "Adventure"],
    tags: ["Reincarnation", "Magic", "Strong MC", "Demon King"],
    originalSource: "Munpia",
    yearPublished: 2021,
  },
  {
    title: "The Tutorial Is Too Hard",
    nativeTitle: "튜토리얼이 너무 어렵다",
    author: "Gandara",
    description: "An ordinary man is dragged into a brutal tutorial designed to test humanity's strongest. To survive its impossibly difficult trials, he must claw his way through with nothing but grit and cunning.",
    totalChapters: 250,
    status: "Ongoing",
    genres: ["Fantasy", "Action", "Adventure"],
    tags: ["System", "Tower", "Survival", "Smart MC"],
    originalSource: "Munpia",
    yearPublished: 2017,
  },

  // ============ JAPANESE (SYOSETU / LIGHT NOVEL) ============
  {
    title: "Mushoku Tensei: Jobless Reincarnation",
    nativeTitle: "無職転生",
    mediaType: "light_novel",
    author: "Rifujin na Magonote",
    description: "A 34-year-old shut-in dies and is reborn as Rudeus Greyrat in a world of magic and swords. Determined not to waste his second life, he masters magic from infancy and grows into a powerful mage.",
    totalChapters: 286,
    status: "Completed",
    genres: ["Fantasy", "Adventure", "Drama"],
    tags: ["Reincarnation", "Magic", "Coming of Age", "Character Growth"],
    originalSource: "Syosetu",
    yearPublished: 2012,
  },
  {
    title: "That Time I Got Reincarnated as a Slime",
    nativeTitle: "転生したらスライムだった件",
    mediaType: "light_novel",
    author: "Fuse",
    description: "Satoru Mikami is stabbed to death and reincarnates in a fantasy world as a slime monster. Naming himself Rimuru Tempest, he builds a nation of monsters and befriends powerful beings along the way.",
    totalChapters: 247,
    status: "Completed",
    genres: ["Fantasy", "Adventure", "Comedy"],
    tags: ["Reincarnation", "OP MC", "Kingdom Building", "Monsters"],
    originalSource: "Syosetu",
    yearPublished: 2013,
  },
  {
    title: "Re:Zero − Starting Life in Another World",
    nativeTitle: "Re:ゼロから始める異世界生活",
    mediaType: "light_novel",
    author: "Tappei Nagatsuki",
    description: "Subaru Natsuki is suddenly transported to a fantasy world, where he discovers his only power: 'Return by Death,' which rewinds time to a save point whenever he dies. He must endure death again and again to protect those he loves.",
    totalChapters: 700,
    status: "Ongoing",
    genres: ["Fantasy", "Drama", "Mystery"],
    tags: ["Time Loop", "Psychological", "Dark", "Suffering MC"],
    originalSource: "Syosetu",
    yearPublished: 2012,
  },
  {
    title: "Overlord",
    nativeTitle: "オーバーロード",
    mediaType: "light_novel",
    author: "Kugane Maruyama",
    description: "When the popular VR game Yggdrasil shuts down, the player Momonga remains trapped in the game as his skeletal overlord avatar, his NPC servants now sentient. He sets out to dominate the new world he finds himself in.",
    totalChapters: 105,
    status: "Ongoing",
    genres: ["Fantasy", "Action", "Drama"],
    tags: ["OP MC", "Villain MC", "Game Elements", "Dark"],
    originalSource: "Syosetu",
    yearPublished: 2012,
  },
  {
    title: "The Rising of the Shield Hero",
    nativeTitle: "盾の勇者の成り上がり",
    mediaType: "light_novel",
    author: "Aneko Yusagi",
    description: "Naofumi Iwatani is summoned to another world as the Shield Hero, the weakest of four legendary heroes. Betrayed and branded a criminal on his first day, he grows cynical and strong as he fights to clear his name and protect the world.",
    totalChapters: 379,
    status: "Completed",
    genres: ["Fantasy", "Adventure", "Drama"],
    tags: ["Isekai", "Betrayal", "Revenge", "Party"],
    originalSource: "Syosetu",
    yearPublished: 2012,
  },
  {
    title: "KonoSuba: God's Blessing on This Wonderful World!",
    nativeTitle: "この素晴らしい世界に祝福を!",
    mediaType: "light_novel",
    author: "Natsume Akatsuki",
    description: "After a pathetic death, hikikomori Kazuma Satou is reincarnated in a fantasy world with the useless goddess Aqua. Together with an explosion-obsessed mage and a masochistic crusader, he stumbles through misadventures and debt.",
    totalChapters: 100,
    status: "Completed",
    genres: ["Fantasy", "Comedy", "Adventure"],
    tags: ["Isekai", "Comedy", "Parody", "Party"],
    originalSource: "Syosetu",
    yearPublished: 2013,
  },
  {
    title: "Arifureta: From Commonplace to World's Strongest",
    nativeTitle: "ありふれた職業で世界最強",
    mediaType: "light_novel",
    author: "Ryo Shirakome",
    description: "Hajime Nagumo, a bullied classmate summoned to another world as a lowly transmutation user, is betrayed and cast into an abyss. He claws his way back from the depths, transformed into a ruthless monster-slaying powerhouse.",
    totalChapters: 523,
    status: "Completed",
    genres: ["Fantasy", "Action", "Adventure"],
    tags: ["Isekai", "Betrayal", "Harem", "OP MC"],
    originalSource: "Syosetu",
    yearPublished: 2013,
  },
  {
    title: "So I'm a Spider, So What?",
    nativeTitle: "蜘蛛ですが、なにか?",
    mediaType: "light_novel",
    author: "Okina Baba",
    description: "A high school girl is reincarnated as a lowly spider monster in a deadly dungeon. With sharp wit and sheer determination, she fights to survive, level up, and evolve in a world that wants her dead.",
    totalChapters: 681,
    status: "Completed",
    genres: ["Fantasy", "Adventure", "Comedy"],
    tags: ["Reincarnation", "Monster MC", "Game Elements", "Survival"],
    originalSource: "Syosetu",
    yearPublished: 2015,
  },
  {
    title: "Ascendance of a Bookworm",
    nativeTitle: "本好きの下剋上",
    mediaType: "light_novel",
    author: "Miya Kazuki",
    description: "Urano, a book-loving woman, dies and is reborn as Myne, a sickly child in a medieval world where books are scarce and literacy is rare. Unable to live without books, she resolves to make her own — no matter what it takes.",
    totalChapters: 677,
    status: "Completed",
    genres: ["Fantasy", "Slice of Life", "Drama"],
    tags: ["Reincarnation", "Slow Life", "Crafting", "Smart MC"],
    originalSource: "Syosetu",
    yearPublished: 2013,
  },
  {
    title: "The Saga of Tanya the Evil",
    nativeTitle: "幼女戦記",
    mediaType: "light_novel",
    author: "Carlo Zen",
    description: "A coldly rational salaryman is reincarnated as Tanya Degurechaff, a young girl in a war-torn world resembling WWI Europe. As a ruthless mage-soldier, she fights to climb the ranks and secure a safe life, defying the god who cursed her.",
    totalChapters: 100,
    status: "Ongoing",
    genres: ["Fantasy", "Action", "Drama"],
    tags: ["Reincarnation", "War", "Ruthless MC", "Magic"],
    originalSource: "Syosetu",
    yearPublished: 2013,
  },

  // ============ ENGLISH / ROYAL ROAD / PROGRESSION FANTASY ============
  {
    title: "The Wandering Inn",
    nativeTitle: null,
    author: "pirateaba",
    description: "Erin Solstice, a young woman from Earth, finds herself stranded in a fantasy world and takes over an abandoned inn. With no combat 'class' to speak of, she survives on wit, courage, and the strange Levels and Skills this world grants.",
    totalChapters: 900,
    status: "Ongoing",
    genres: ["Fantasy", "Adventure", "Slice of Life"],
    tags: ["LitRPG", "Slice of Life", "Worldbuilding", "Strong Female Lead"],
    originalSource: "Royal Road",
    yearPublished: 2016,
  },
  {
    title: "He Who Fights with Monsters",
    nativeTitle: null,
    author: "Shirtaloon",
    description: "Jason Asano is whisked from Earth into a fantasy world of magic, monsters, and adventurers. Sarcastic and out of his depth, he claws his way up as an adventurer with a dark, soul-based power set.",
    totalChapters: 700,
    status: "Ongoing",
    genres: ["Fantasy", "Action", "Comedy"],
    tags: ["LitRPG", "Isekai", "Snarky MC", "Magic"],
    originalSource: "Royal Road",
    yearPublished: 2019,
  },
  {
    title: "Mother of Learning",
    nativeTitle: null,
    author: "nobody103",
    description: "Zorian, a mage-in-training, finds himself trapped in a month-long time loop. To escape it and uncover who is behind it, he must master magic far beyond his years across countless repetitions of the same four weeks.",
    totalChapters: 107,
    status: "Completed",
    genres: ["Fantasy", "Mystery", "Adventure"],
    tags: ["Time Loop", "Magic", "Smart MC", "Mystery Solving"],
    originalSource: "Royal Road",
    yearPublished: 2011,
  },
  {
    title: "The Primal Hunter",
    nativeTitle: null,
    author: "Zogarth",
    description: "When the world is suddenly integrated into a vast multiversal System, Jake Thayne — an ordinary office worker — discovers a talent for the hunt. He embraces the apocalypse, leveling up as an archer in a deadly new reality.",
    totalChapters: 900,
    status: "Ongoing",
    genres: ["Fantasy", "Action", "Adventure"],
    tags: ["LitRPG", "System Apocalypse", "Hunter", "Strong MC"],
    originalSource: "Royal Road",
    yearPublished: 2021,
  },
  {
    title: "Defiance of the Fall",
    nativeTitle: null,
    author: "TheFirstDefier",
    description: "When cataclysmic blue boxes herald Earth's integration into a brutal cosmic System, Zac fights to survive the apocalypse. Wielding an axe and a mysterious dao, he carves a path through a universe where the strong devour the weak.",
    totalChapters: 1000,
    status: "Ongoing",
    genres: ["Fantasy", "Action", "Adventure"],
    tags: ["LitRPG", "System Apocalypse", "Cultivation", "Strong MC"],
    originalSource: "Royal Road",
    yearPublished: 2020,
  },
  {
    title: "Beware of Chicken",
    nativeTitle: null,
    author: "Casualfarmer",
    description: "Jin Rou expects to be reborn into a grand cultivation world as a powerful hero. Instead, he ditches the murderous sect life entirely to become a farmer — accidentally turning his livestock and crops into spiritual powerhouses.",
    totalChapters: 600,
    status: "Ongoing",
    genres: ["Fantasy", "Comedy", "Slice of Life"],
    tags: ["Cultivation", "Farming", "Slice of Life", "Comedy"],
    originalSource: "Royal Road",
    yearPublished: 2020,
  },
  {
    title: "Dungeon Crawler Carl",
    nativeTitle: null,
    author: "Matt Dinniman",
    description: "After an alien corporation demolishes most of humanity, Earth becomes a deadly game-show dungeon. Carl and his ex-girlfriend's pampered cat, Princess Donut, must descend through its lethal floors for the entertainment of the galaxy.",
    totalChapters: 700,
    status: "Ongoing",
    genres: ["Sci-Fi", "Comedy", "Action"],
    tags: ["LitRPG", "Dungeon", "Comedy", "Apocalypse"],
    originalSource: "Royal Road",
    yearPublished: 2020,
  },
  {
    title: "Cradle",
    nativeTitle: null,
    mediaType: "novel",
    author: "Will Wight",
    description: "Lindon is born 'Unsouled,' powerless in a world where everyone wields sacred arts. After learning his homeland is doomed, he sets out to grow strong enough to defy fate itself, climbing the ranks of cultivation one realm at a time.",
    totalChapters: null,
    status: "Completed",
    genres: ["Fantasy", "Action", "Adventure"],
    tags: ["Progression", "Cultivation", "Weak to Strong", "Character Growth"],
    originalSource: "Self-published",
    yearPublished: 2016,
  },
  {
    title: "Delve",
    nativeTitle: null,
    author: "SenescentSoul",
    description: "Rain, an ordinary man, is transported into a world governed by a precise, mathematical leveling System. A self-described min-maxer, he obsessively optimizes his growth as a Wood-affinity mage while uncovering the world's deeper mysteries.",
    totalChapters: 130,
    status: "Hiatus",
    genres: ["Fantasy", "Action", "Adventure"],
    tags: ["LitRPG", "Crunchy System", "Smart MC", "Magic"],
    originalSource: "Royal Road",
    yearPublished: 2018,
  },
  {
    title: "Super Supportive",
    nativeTitle: null,
    author: "Sleyca",
    description: "In a world of superpowered 'Supers,' an ordinary teenager named Alden gains a strange, support-oriented power. He enrolls at a prestigious hero academy, navigating friendship, growth, and a system far stranger than it first appears.",
    totalChapters: 180,
    status: "Ongoing",
    genres: ["Fantasy", "Slice of Life", "Action"],
    tags: ["Superpowers", "Academy", "Slice of Life", "Coming of Age"],
    originalSource: "Royal Road",
    yearPublished: 2022,
  },

  // ============ MORE POPULAR CHINESE ============
  {
    title: "The King's Avatar",
    nativeTitle: "全职高手",
    author: "Butterfly Blue",
    description: "Ye Xiu, a top-tier pro gamer of the virtual game Glory, is forced into retirement and out of his team. Starting over as a low-level player, he sets out to climb back to the summit of professional esports.",
    totalChapters: 1728,
    status: "Completed",
    genres: ["Action", "Adventure", "Slice of Life"],
    tags: ["Esports", "Game Elements", "Smart MC", "Comeback"],
    originalSource: "Qidian",
    yearPublished: 2011,
  },
  {
    title: "Martial God Asura",
    nativeTitle: "修罗武神",
    author: "Kindhearted Bee",
    description: "Chu Feng, a young man from the Azure Dragon School, possesses a mysterious power that lets him grow at an unrivaled pace. Hot-blooded and unyielding, he rises through a cruel martial world where only the strong survive.",
    totalChapters: 5061,
    status: "Completed",
    genres: ["Xuanhuan", "Fantasy", "Action"],
    tags: ["Cultivation", "Hot-blooded MC", "Face Slapping", "Weak to Strong"],
    originalSource: "Qidian",
    yearPublished: 2013,
  },
  {
    title: "Tales of Herding Gods",
    nativeTitle: "牧神记",
    author: "Pig Nerd Ginseng Fruit",
    description: "Qin Mu is raised by a village of disabled outcasts on the edge of a haunted land. As he grows, he uncovers his mysterious origins and a world steeped in ancient gods, devils, and forgotten history.",
    totalChapters: 1207,
    status: "Completed",
    genres: ["Xuanhuan", "Mystery", "Action"],
    tags: ["Mystery", "Cultivation", "Mythology", "Smart MC"],
    originalSource: "Qidian",
    yearPublished: 2017,
  },
  {
    title: "Versatile Mage",
    nativeTitle: "全职法师",
    author: "Chaos",
    description: "Mo Fan wakes up in a parallel world where magic has replaced science and humanity battles monstrous beasts. Born poor, he discovers he can wield multiple elements in a world where mages specialize in only one.",
    totalChapters: 3000,
    status: "Ongoing",
    genres: ["Fantasy", "Action", "Adventure"],
    tags: ["Magic", "Modern Day", "Hard Work", "Monsters"],
    originalSource: "Qidian",
    yearPublished: 2015,
  },
  {
    title: "Joy of Life",
    nativeTitle: "庆余年",
    author: "Mao Ni",
    description: "Fan Xian, a boy harboring the memories of a modern man, grows up amid the deadly intrigues of a powerful empire. Armed with wit and hidden martial skill, he navigates court politics, conspiracies, and a mystery tied to his own origins.",
    totalChapters: 746,
    status: "Completed",
    genres: ["Historical", "Drama", "Action"],
    tags: ["Politics", "Smart MC", "Court Intrigue", "Reincarnation"],
    originalSource: "Qidian",
    yearPublished: 2007,
  },
  {
    title: "Way of Choices",
    nativeTitle: "择天记",
    author: "Mao Ni",
    description: "Chen Changsheng, born under a fated star of early death, leaves his mountain home to defy his destiny in the imperial capital. In a world ruled by the Dao and the Heavens, he refuses to accept the fate written for him.",
    totalChapters: 1102,
    status: "Completed",
    genres: ["Xianxia", "Fantasy", "Romance"],
    tags: ["Cultivation", "Fate", "Romance", "Underdog"],
    originalSource: "Qidian",
    yearPublished: 2014,
  },
  {
    title: "Heaven Official's Blessing",
    nativeTitle: "天官赐福",
    author: "Mo Xiang Tong Xiu",
    description: "Xie Lian, a once-beloved crown prince ascended to godhood, is cast down and ridiculed for centuries before ascending a third time. On a routine mission, he meets a mysterious ghost king whose fate is bound to his own.",
    totalChapters: 252,
    status: "Completed",
    genres: ["Fantasy", "Romance", "Historical"],
    tags: ["Danmei", "Mythology", "Romance", "Slow Burn"],
    originalSource: "JJWXC",
    yearPublished: 2017,
  },
  {
    title: "The Grandmaster of Demonic Cultivation",
    nativeTitle: "魔道祖师",
    author: "Mo Xiang Tong Xiu",
    description: "Wei Wuxian, the notorious founder of demonic cultivation, dies in disgrace only to be summoned back into the body of a madman years later. He unravels old mysteries alongside the righteous cultivator Lan Wangji.",
    totalChapters: 126,
    status: "Completed",
    genres: ["Fantasy", "Romance", "Action"],
    tags: ["Danmei", "Cultivation", "Mystery", "Reincarnation"],
    originalSource: "JJWXC",
    yearPublished: 2015,
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
        coverImageUrl: null,
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

const charactersByNovelTitle: Record<string, { name: string; role: string }[]> = {
  "Reverend Insanity": [
    { name: "Fang Yuan", role: "Protagonist" },
    { name: "Fang Zheng", role: "Supporting" },
  ],
  "Lord of the Mysteries": [
    { name: "Klein Moretti", role: "Protagonist" },
    { name: "Audrey Hall", role: "Supporting" },
    { name: "Alger Wilson", role: "Supporting" },
  ],
  "I Shall Seal the Heavens": [
    { name: "Meng Hao", role: "Protagonist" },
    { name: "Xu Qing", role: "Supporting" },
  ],
  "A Will Eternal": [
    { name: "Bai Xiaochun", role: "Protagonist" },
    { name: "Song Junwan", role: "Supporting" },
  ],
  "Renegade Immortal": [
    { name: "Wang Lin", role: "Protagonist" },
  ],
  "Coiling Dragon": [
    { name: "Linley Baruch", role: "Protagonist" },
    { name: "Delia", role: "Supporting" },
    { name: "Bebe", role: "Supporting" },
  ],
  "Battle Through the Heavens": [
    { name: "Xiao Yan", role: "Protagonist" },
    { name: "Yao Lao", role: "Supporting" },
    { name: "Xun Er", role: "Supporting" },
  ],
  "Soul Land": [
    { name: "Tang San", role: "Protagonist" },
    { name: "Xiao Wu", role: "Supporting" },
  ],
  "Tales of Demons and Gods": [
    { name: "Nie Li", role: "Protagonist" },
    { name: "Ye Ziyun", role: "Supporting" },
  ],
  "Omniscient Reader's Viewpoint": [
    { name: "Kim Dokja", role: "Protagonist" },
    { name: "Yoo Joonghyuk", role: "Main Character" },
    { name: "Han Sooyoung", role: "Supporting" },
  ],
  "Martial World": [
    { name: "Lin Ming", role: "Protagonist" },
  ],
  "Against the Gods": [
    { name: "Yun Che", role: "Protagonist" },
  ],
  "Warlock of the Magus World": [
    { name: "Leylin Farlier", role: "Protagonist" },
  ],
  "Shadow Slave": [
    { name: "Sunny", role: "Protagonist" },
    { name: "Cassie", role: "Supporting" },
    { name: "Nephis", role: "Main Character" },
  ],
  "Trash of the Count's Family": [
    { name: "Cale Henituse", role: "Protagonist" },
    { name: "Choi Han", role: "Supporting" },
  ],
  "The Beginning After the End": [
    { name: "Arthur Leywin", role: "Protagonist" },
  ],
  "Second Life Ranker": [
    { name: "Yeon-woo", role: "Protagonist" },
  ],
  "Library of Heaven's Path": [
    { name: "Zhang Xuan", role: "Protagonist" },
  ],
  "The Legendary Mechanic": [
    { name: "Han Xiao", role: "Protagonist" },
  ],
  "Release That Witch": [
    { name: "Roland Wimbledon", role: "Protagonist" },
    { name: "Anna", role: "Supporting" },
  ],
};

async function seedCharacters() {
  const dbNovels = await prisma.novel.findMany({
    where: { title: { in: Object.keys(charactersByNovelTitle) } },
    select: { id: true, title: true },
  });

  const novelMap = new Map(dbNovels.map((n) => [n.title, n.id]));

  let created = 0;
  let skipped = 0;

  for (const [novelTitle, chars] of Object.entries(charactersByNovelTitle)) {
    const novelId = novelMap.get(novelTitle);
    if (!novelId) {
      console.log(`  ⚠️  Novel not found: ${novelTitle}`);
      continue;
    }

    for (const char of chars) {
      const existing = await prisma.character.findUnique({
        where: { name_novelId: { name: char.name, novelId } },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.character.create({
        data: { name: char.name, role: char.role, novelId },
      });
      console.log(`  ✅ Created: ${char.name} (${novelTitle})`);
      created++;
    }
  }

  console.log(`\nCharacters — Created: ${created}, Skipped: ${skipped}`);
}

async function main() {
  console.log("🌱 Seeding database...\n");

  console.log("📚 Seeding novels...");
  await seedNovels();

  console.log("\n✍️  Seeding authors...");
  await seedAuthors();

  console.log("\n🧑‍🤝‍🧑 Seeding characters...");
  await seedCharacters();

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