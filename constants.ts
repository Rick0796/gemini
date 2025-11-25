
import { CourseModule, LessonType, CourseType, Message, GeminiResponse, SessionReport, TacticGenerationResponse, CoachMessage } from './types';
import { GoogleGenAI } from "@google/genai";

// ==========================================
// GEMINI API CONFIGURATION
// ==========================================
let ai: GoogleGenAI | null = null;
try {
  if (process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
} catch (e) {
  console.warn("Gemini API Key not found, falling back to advanced simulation engine.");
}

// ==========================================
// EDUCATIONAL DATABASE v1.0.0 (The Encyclopedia)
// ==========================================

export const RED_COURSE_DATA: CourseModule[] = [
  {
    id: "red_phase_1",
    title: "PHASE 1: INTEREST & MINDSET (认知重构)",
    level: 1,
    lessons: [
      {
        id: "red_1_1",
        title: "1.1 The Prize Frame (奖品性框架)",
        type: LessonType.THEORY,
        description: "社交位阶的物理学：为什么'对她好'往往是错误的开始？重塑你的底层吸引力逻辑。",
        locked: false, // First lesson unlocked
        completed: false,
        xp_reward: 100,
        content: {
          theory: `在建立吸引力的第一阶段，90%的人都会犯一个致命错误：【过度补偿】。
          
当你遇到心仪对象时，潜意识会告诉你："我配不上她，所以我需要通过'对她好'、'送礼物'、'秒回信息'来补偿这个差距。" 这在心理学上被称为【讨好型人格 (People Pleasing)】。

然而，在两性博弈中，吸引力遵循【稀缺性原则】。经济学告诉我们：容易得到的东西，价值为零。当你表现得像一个随叫随到的保姆时，你实际上是在向对方传达："我的时间没有价值，我没有其他选择。"

**核心概念：奖品性 (The Prize Frame)**
你要扭转这种位阶。你要建立一种心态：**"我是奖品，我在筛选你，而不是你在筛选我。"**

这并不意味着你要傲慢无礼，而是一种深层的自信。
1. **时间主权**：不要秒回。你有自己的生活、工作和爱好。回复信息是因为你现在有空，而不是因为你在等她的信息。
2. **筛选思维**：不要问"她喜欢我吗？"，要问"她符合我的标准吗？"。当她表现出无礼或无趣时，你要敢于后撤。

**心理学原理：本杰明·富兰克林效应**
让一个人喜欢你的最好方式，不是去帮助她，而是**让她来帮助你**。
当她为你付出了成本（哪怕只是帮你拿一杯水），她的大脑为了消除认知失调，会告诉自己："我帮他，说明我是喜欢他的。"`,
          key_concepts: ["Prize Frame (奖品框架)", "Scarcity (稀缺性)", "Cognitive Dissonance (认知失调)", "Franklin Effect (富兰克林效应)"],
          bad_example: "User: 宝，早安！记得吃早饭哦，外面下雨了带伞了吗？别感冒了我会心疼的。（典型的低位阶保姆式关心，毫无吸引力）",
          good_example: "User: 刚看到路边有只柯基腿短得像你，笑死我了。（提供情绪价值 + 适度打压 + 平视框架，展示你是一个有趣的人）",
          why_it_works: "反面教材在索取对方的认可（看我多关心你），处于低位。正确示范提供了'情绪价值'，并且通过适度的调侃（Negging），建立了平视甚至俯视的社交高位。"
        }
      },
      {
        id: "red_1_2",
        title: "1.2 Sunk Cost & Investment (沉没成本)",
        type: LessonType.THEORY,
        description: "如何让对方离不开你？引导投入的艺术。",
        locked: true,
        completed: false,
        xp_reward: 150,
        content: {
          theory: `为什么有些女生明明知道男朋友是渣男，却死活离不开？
这就涉及到了人性中最强大的漏洞之一：**沉没成本谬误 (Sunk Cost Fallacy)**。

人不是理性的。我们评估一段关系的价值，往往不是看对方有多好，而是看**自己在这段关系里投入了多少**。投入越多，越难割舍。

如果你在一段关系中，总是充当"付出者"（买单、接送、提供情绪价值），而对方只是"接受者"，那么当你离开时，对方不仅不会心痛，反而会觉得轻松。因为她没有成本。

**实战技巧：引导投入 (Compliance Testing)**
高手的聊天，本质上是一个【服从性测试】的循环。你需要循序渐进地引导对方为你投入。

1. **微小投入 (Micro Compliance)**：
   "发张照片看看。" / "那家店叫什么名字？推给我。" / "帮我拿一下外套。"
   如果是刚认识，这些小要求能测试她对你的兴趣度。

2. **情绪投入 (Emotional Investment)**：
   不要总是当她的情绪垃圾桶。要学会分享你的脆弱、你的故事，让她来安慰你，让她为你产生情绪波动（担心、开心、生气）。

3. **时间投入 (Time Investment)**：
   不要总是你跨越半个城市去找她。尝试模糊邀约："我在xx附近办事，你过来找我喝杯咖啡？"

**记住公式：**
引导小投入 -> 给予奖励（赞美/认可） -> 引导更大投入。`,
          key_concepts: ["Sunk Cost (沉没成本)", "Compliance Loop (服从循环)", "Investment (投入模型)"],
          bad_example: "User: 你想吃什么？想去哪？我都听你的，只要你开心。我来订位，我去接你。（剥夺了对方投入的机会）",
          good_example: "User: 听说你品味不错，帮我挑件衬衫？挑得好请你喝奶茶。（赋予资格 + 引导行为投入 + 建立奖赏机制）",
          why_it_works: "通过让对方付出微小的劳动（挑衬衫），她会在潜意识里合理化自己的行为：'我愿意花时间帮他，说明我对他是有点意思的'。"
        }
      },
      {
        id: "red_1_quiz",
        title: "1.3 Quiz: Frame Check",
        type: LessonType.QUIZ,
        description: "测试你是否真正掌握了'奖品心态'。",
        locked: true,
        completed: false,
        xp_reward: 100,
        content: {
          quiz_question: "刚认识的女生发了一张精修自拍，配文'今天妆画了好久'。作为一个具备'奖品心态'的人，你应该怎么回？",
          quiz_options: [
            { text: "哇，太美了，简直是仙女下凡！", isCorrect: false, feedback: "错误。这是典型的'粉丝'发言。你在仰视她，这会让你瞬间进入'供养者'赛道。" },
            { text: "妆不错，不过我更喜欢你眼睛里的自信。", isCorrect: true, feedback: "正确。这是'赋格'（Qualifying）。你不仅肯定了她的外表，更以'评委'的姿态赞美了她的内在特质（自信），保持了高位。" },
            { text: "P得有点过了吧？", isCorrect: false, feedback: "错误。这是低情商的打压，会直接引起反感，甚至被拉黑。奖品心态不是傲慢。" }
          ]
        }
      }
    ]
  },
  {
    id: "red_phase_2",
    title: "PHASE 2: ATTRACTION & TENSION (情绪张力)",
    level: 2,
    lessons: [
      {
        id: "red_2_1",
        title: "2.1 Push-Pull Mechanics (情绪推拉)",
        type: LessonType.THEORY,
        description: "如何制造像'过山车'一样的心动感觉？",
        locked: true,
        completed: false,
        xp_reward: 200,
        content: {
          theory: `平淡是吸引力的死敌。如果你只会说"好的"、"是的"、"没错"，对话就会变成一杯白开水。
吸引力的本质是**情绪波动 (Emotional Spike)**。而【推拉技巧】是制造这种波动的核武器。

**原理：间歇性强化 (Intermittent Reinforcement)**
就像老虎机一样，如果不确定下一次是赢是输，人就会上瘾。如果每次都赢，人很快就腻了。

**推 (Push)**：制造距离、否定、调侃、拒绝。让对方感到"稍微失去你"。
**拉 (Pull)**：拉近距离、赞美、认同、亲密。让对方感到"被你接纳"。

**实战公式：**
1. **先推后拉**（制造安全感）：
   "你这就有点笨了（推），不过笨得还挺可爱的（拉）。"
   "虽然我很嫌弃你（推），但还是忍不住想见你（拉）。"

2. **先拉后推**（制造不可得性）：
   "我觉得你厨艺真不错（拉），如果不放那么多盐就更好了（推）。"
   "我很想去（拉），但周五真的不行，我要陪我妈（推）。"

注意：推和拉必须结合使用。只推不拉是PUA（令人反感），只拉不推是舔狗（令人乏味）。`,
          key_concepts: ["Emotional Spike (情绪波动)", "Push-Pull (推拉)", "Dopamine Loop (多巴胺回路)"],
          bad_example: "User: 你真好看，性格也好，我好喜欢你。（纯拉，毫无张力）",
          good_example: "User: 别太想我，虽然这很难。（自恋式推拉，既自夸又给了对方关注）",
          why_it_works: "你打破了她的预期。她以为你会像其他人一样讨好她，结果你却自信地调侃她，这种反差瞬间制造了吸引力。"
        }
      },
      {
        id: "red_2_2",
        title: "2.2 Cold Reading (冷读术)",
        type: LessonType.THEORY,
        description: "不需要查户口，也能瞬间走进她心里。",
        locked: true,
        completed: false,
        xp_reward: 200,
        content: {
          theory: `千万不要再问"你多大？"、"你是哪里的？"、"你做什么工作的？"了！
这叫【索取信息】，会让对方感到像在面试。

高手使用【冷读术 (Cold Reading)】：**用陈述句代替疑问句**。
通过观察对方的细节，给出一个模糊但听起来很准的推测（基于巴纳姆效应）。

**转换公式：**
*   问："你是哪里人？" -> 改："听你口音像是南方人，性格蛮温婉的。"
*   问："你做什么工作的？" -> 改："看你朋友圈这么有条理，应该是从事金融或设计类工作的吧？"
*   问："你喜欢猫吗？" -> 改："感觉你是个猫系女生，外表高冷内心粘人。"

**如果猜对了**：建立了"懂她"的共鸣。
**如果猜错了**：她会反驳你，并主动告诉你正确答案。
"不是啦，我是做人事的。" -> "难怪，感觉你特别会看人。"（顺势接话）

这不仅获取了信息，还提供了话题和情绪价值。`,
          key_concepts: ["Barnum Effect (巴纳姆效应)", "Statement > Question (陈述>提问)", "Empathy (共情)"],
          bad_example: "User: 在吗？吃了吗？睡了吗？（查户口三连）",
          good_example: "User: 感觉你今天心情不错，是不是偷偷去吃好吃的了？（冷读情绪）",
          why_it_works: "你不再是一个无聊的提问机器，而是一个敏锐的观察者。这展示了你的高情商。"
        }
      }
    ]
  },
  {
    id: "red_phase_3",
    title: "PHASE 3: ESCALATION & INVITE (关系升级)",
    level: 3,
    lessons: [
      {
        id: "red_3_1",
        title: "3.1 Vague Invite (模糊邀约)",
        type: LessonType.THEORY,
        description: "如何邀约才能做到'零拒绝率'？",
        locked: true,
        completed: false,
        xp_reward: 250,
        content: {
          theory: `正式邀约（如：周五晚上7点吃饭好吗？）是一种高压行为。
女生会思考："我和他的关系到了单独吃饭的地步了吗？如果是约会，我要不要洗头化妆？如果拒绝会不会尴尬？"
这种心理压力往往导致拒绝。

高手使用**【模糊邀约】**来试探窗口，遵循**【零压力原则】**。

**三步走战略：**
1. **描述诱饵 (The Bait)**：不提邀约，只描绘一个有趣的场景。
   "最近看到一家爵士酒吧很有情调，灯光特别适合拍照，感觉你会喜欢。"
   
2. **观察反馈 (The Check)**：
   *   反馈好："是吗？在哪？" / "我也喜欢爵士。" -> **窗口打开 (Green Light)**。
   *   反馈差："哦。" / "不错。" -> **窗口关闭 (Red Light)**。立刻撤退，切断话题，不要暴露需求。

3. **顺势收网 (The Close)**：
   "有空带你去见识一下。"（依然不定时间，这叫模糊）。
   
当她第二次提起，或者反应非常热烈时，再转为正式邀约："择日不如撞日，就这周五吧。"`,
          key_concepts: ["Vague Invite (模糊邀约)", "Window Check (窗口试探)", "Zero Pressure (零压力)"],
          bad_example: "User: 这周六有空吗？我想请你吃饭。",
          good_example: "User: 那个展子风格很怪诞，感觉特适合你去拍照，改天去看看。",
          why_it_works: "进可攻退可守。即使她不接话，你也没被拒绝，保住了面子（Frame），也没有给她造成压力。"
        }
      },
      {
        id: "red_3_boss",
        title: "BOSS FIGHT: The Ice Queen",
        type: LessonType.BOSS_FIGHT,
        description: "实战模拟：对方是高分妹子，态度冷淡。你需要用推拉、冷读、曲解等技巧，在10轮对话内建立吸引。切记：暴露需求感=死亡。",
        locked: true,
        completed: false,
        xp_reward: 500,
        content: {}
      }
    ]
  },
  {
    id: "red_phase_4",
    title: "PHASE 4: LONG TERM & CRISIS (长期关系)",
    level: 4,
    lessons: [
      {
        id: "red_4_1",
        title: "4.1 Consistency & Trust (一致性)",
        type: LessonType.THEORY,
        description: "为什么忽冷忽热在长期关系中是毒药？",
        locked: true,
        completed: false,
        xp_reward: 300,
        content: {
          theory: `在吸引阶段（短期），不可预测性是春药。但在长期关系（Ltr）中，**可预测性**不仅是安全感的来源，更是信任的基石。
          
如果你在确立关系后依然疯狂使用推拉、打压，女生会进入【焦虑型依恋】状态，最终崩溃或逃离。

长期维护的核心是：**情绪价值的稳定性**。
你需要成为她的"情绪锚点"。当她外部世界混乱时（工作不顺、家庭矛盾），你是她唯一的秩序来源。

**一致性测试**：
女生会通过吵架、作、无理取闹来测试你的框架是否稳固。
如果你平时装得很酷，一吵架就歇斯底里，这就叫【框架崩塌】。
真正的强者，是泰山崩于前而色不变。面对她的情绪风暴，你只需要像岩石一样稳住，抱住她，等风暴过去。`,
          key_concepts: ["Secure Attachment (安全依恋)", "Emotional Anchor (情绪锚点)", "Frame Consistency (框架一致性)"],
          bad_example: "User: (吵架时) 你能不能别闹了？我也很烦！(情绪对撞)",
          good_example: "User: (平静地看着她) 发泄完了吗？发泄完了过来抱一下。(岩石框架)",
          why_it_works: "你没有被她的情绪带跑，反而包容了她的情绪。这种强大的稳定性是长期伴侣最核心的价值。"
        }
      }
    ]
  }
];

export const BLUE_COURSE_DATA: CourseModule[] = [
  {
    id: "blue_phase_1",
    title: "PHASE 1: LOGIC & STRUCTURE (逻辑构建)",
    level: 1,
    lessons: [
      {
        id: "blue_1_1",
        title: "1.1 Pyramid Principle (金字塔原理)",
        type: LessonType.THEORY,
        description: "职场沟通的第一法则：结论先行。",
        locked: false,
        completed: false,
        xp_reward: 100,
        content: {
          theory: `老板的时间成本极高，耐心极低。麦肯锡金字塔原理的核心是**结论先行 (Bottom Line First)**。
          
人类大脑习惯于归纳，而不是演绎。如果你先说过程、细节、苦劳，老板听了一分钟还不知道你想干嘛，他就会打断你。

**标准公式 (SCQA的变体)：**
1. **结论 (Conclusion)**：一句话概括中心思想（我们应该做A）。
2. **论据 (Arguments)**：支撑结论的3个理由（因为1，2，3）。
3. **事实 (Data)**：支撑理由的具体数据。

任何汇报，如果前30秒没说出结论，就是失败的。不要试图营造悬念，职场不是侦探小说。`,
          key_concepts: ["Conclusion First (结论先行)", "Deduction (演绎推理)", "Elevator Pitch (电梯演讲)"],
          bad_example: "User: 王总，昨晚小李代码出了bug，客户服务器也连不上，我们查了一晚上，后来发现是网络问题... (流水账)",
          good_example: "User: 王总，上线延期了（结论）。核心原因有二：1. 代码致命Bug；2. 客户环境异常（归类）。建议启动B计划（方案）。",
          why_it_works: "老板需要做'选择题'或'判断题'，而不是做'阅读理解'。结论先行帮他节省了认知带宽。"
        }
      },
      {
        id: "blue_1_2",
        title: "1.2 MECE Principle (不重不漏)",
        type: LessonType.THEORY,
        description: "如何让你的分析滴水不漏？",
        locked: true,
        completed: false,
        xp_reward: 150,
        content: {
          theory: `MECE (Mutually Exclusive Collectively Exhaustive) 意思是"相互独立，完全穷尽"。
这是咨询顾问分析问题的黄金法则。

当你分析问题时，如果不MECE，老板会觉得你逻辑混乱、思维由于。

**例子：分析销售额下降。**
*   **非MECE**："是因为产品不好，还有销售员不努力。"（这只是部分原因，可能有市场原因？竞品原因？而且产品不好可能导致销售员不努力，有重叠。）
*   **MECE**："我们将原因拆解为：内因（产品、运营、销售）+ 外因（竞品、宏观环境）。" 
    或者按数学公式拆解：销售额 = 流量 x 转化率 x 客单价。

**训练方法：**
时刻检查你的分类方式。是用"二分法"（A和非A）？是用"流程法"（事前、事中、事后）？还是"要素法"？`,
          key_concepts: ["MECE", "Logic Completeness (逻辑完备性)", "Structural Thinking (结构化思维)"],
          bad_example: "User: 客户不买单，可能是价格贵，也可能是因为他是男的。",
          good_example: "User: 客户流失分为两类：1. 价格敏感型（转投竞品）；2. 需求不匹配型（放弃购买）。",
          why_it_works: "展现了你思维的严密性，让对方无法反驳，只能顺着你的逻辑思考。"
        }
      }
    ]
  },
  {
    id: "blue_phase_2",
    title: "PHASE 2: MANAGEMENT & GAME (博弈管理)",
    level: 2,
    lessons: [
      {
        id: "blue_2_1",
        title: "2.1 Managing Up (向上管理)",
        type: LessonType.THEORY,
        description: "职场不是比谁更努力，是比谁更会管理预期。",
        locked: true,
        completed: false,
        xp_reward: 200,
        content: {
          theory: `职场最大的雷区是"给惊喜"（往往变成惊吓）。向上管理的核心是**透明度**和**承诺管理**。
          
老板的不安全感来源于是"失控"。

**原则：**
1. **Under-promise, Over-deliver**：只承诺你能100%做到的，然后做到120%。不要为了讨好老板当场拍胸脯，事后打脸。
2. **及时预警**：坏消息要尽早报，且必须带着方案。
3. **选择题思维**：不要把开放式难题抛给老板（"老板这事怎么办"），要让他做选择题。

"老板，目前有A/B两套方案，A风险低但慢，B快但有风险，您建议选哪个？"
这叫【授权】，你把决策的责任交还给了老板，同时展示了你的专业度。`,
          key_concepts: ["Expectation Mgmt (预期管理)", "Solution Oriented (方案导向)", "Close-ended Question (封闭式提问)"],
          bad_example: "User: 没问题，包在我身上！（最后没做完）",
          good_example: "User: 按目前资源，周五交付有风险。建议：A. 砍掉非核心功能保上线；B. 延期两天保质量。请您定夺。",
          why_it_works: "你把'办事不力'的问题转换成了'资源置换'的决策问题，既免责又体现专业。"
        }
      },
      {
        id: "blue_boss_1",
        title: "BOSS FIGHT: Crisis Report",
        type: LessonType.BOSS_FIGHT,
        description: "模拟场景：项目搞砸了，客户暴怒。你需要向精明的老板汇报坏消息，同时保住自己的位置。任何推卸责任或情绪化的表达都会导致Game Over。",
        locked: true,
        completed: false,
        xp_reward: 500,
        content: {}
      }
    ]
  }
];

// ==========================================
// SIMULATION ENGINE (Legacy + Advanced)
// ==========================================

const RED_REPLIES = {
  boring: ["哦。", "正在忙。", "你是不是对谁都这么聊天？", "无聊。", "去洗澡了。"],
  needy: ["我不缺朋友。", "你现在的样子很廉价。", "别急着表忠心，我压力很大。", "我们不合适，你太卑微了。"],
  test: ["删了吧。", "周末有人约我滑雪。", "我不喜欢太乖的。", "你确定你能驾驭我？"],
  impressed: ["哈哈，嘴挺毒。", "有点意思，继续。", "行啊，周五见。", "你比我想象中聪明。"]
};

const BLUE_REPLIES = {
  money_focus: ["别跟我谈预算，谈价值。", "便宜没好货。", "我看不到护城河。", "你的格局就值这点钱？"],
  weak_logic: ["我要的是数据。", "这个风险谁担？", "原则上支持，但是流程上过不去。", "重新写，逻辑不通。"],
  pressure: ["给我最后一分钟。", "出了纰漏你走人。", "别画饼，落地呢？", "我不要听过程，结果呢？"],
  impressed: ["切入点很犀利。", "把分析发我邮箱，今晚就要。", "这雷我顶着，你去干。", "下季度预算给你加倍。"]
};

let currentTrust = 50;
export const resetTrust = () => { currentTrust = 50; };
export const INITIAL_MESSAGES: Message[] = [];

const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

// Generate Tactic Content (Simulated AI Generation)
export const generateTacticContent = async (tacticKeyword: string): Promise<TacticGenerationResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let text = "";
      if (["曲解意图", "幽默", "调情"].some(k => tacticKeyword.includes(k))) {
         text = "你说得对，但我这个人最大的缺点就是太帅了，你得忍忍。";
      } else if (["推拉", "打压"].some(k => tacticKeyword.includes(k))) {
         text = "刚想夸你两句，你就飘了。快下来，地上凉。";
      } else if (["利益锚定", "数据"].some(k => tacticKeyword.includes(k))) {
         text = "王总，如果这个方案能帮您规避掉30%的合规风险，那这10万块其实是在买保险。";
      } else if (["风险转嫁", "甩锅"].some(k => tacticKeyword.includes(k))) {
         text = "这个需求技术上能实现，但会导致服务器负载增加200%，如果崩了，这个责任需要业务方书面确认。";
      } else {
         text = "我觉得这个问题我们可以换个角度看...";
      }
      resolve({ generatedText: text });
    }, 800);
  });
};

export const callGeminiAPI = async (message: string, courseType: CourseType): Promise<GeminiResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const msg = message.toLowerCase();
      const isRed = courseType === CourseType.RED;
      let replyText = "";
      let analysisResult: any = {};
      
      // Simulation Logic for Boss Fight
      if (isRed) {
        if (msg.length < 5 || msg.includes("在吗") || msg.includes("吃了吗")) {
           currentTrust -= 15;
           replyText = getRandom(RED_REPLIES.boring);
           analysisResult = { score: 10, trustLevel: currentTrust, coach_comment: "典型的屌丝开场白。她在想怎么把你拉黑。", suggestion: "使用推拉技巧或冷读开场，制造悬念。", sentiment_tag: "鄙视" };
        } else if (msg.includes("求你") || msg.includes("喜欢") || msg.includes("真心的")) {
           currentTrust -= 20;
           replyText = getRandom(RED_REPLIES.needy);
           analysisResult = { score: 5, trustLevel: currentTrust, coach_comment: "需求感爆表！你在索取认可，这非常廉价。", suggestion: "立刻后撤，展示高价值框架。", sentiment_tag: "厌恶" };
        } else if (msg.length > 8 && (msg.includes("你") || msg.includes("感觉"))) {
           currentTrust += 10;
           replyText = getRandom(RED_REPLIES.impressed);
           analysisResult = { score: 85, trustLevel: currentTrust, coach_comment: "不错的冷读。你成功引起了她的好奇心。", suggestion: "乘胜追击，进行模糊邀约。", sentiment_tag: "兴趣" };
        } else {
           currentTrust -= 5;
           replyText = getRandom(RED_REPLIES.test);
           analysisResult = { score: 40, trustLevel: currentTrust, coach_comment: "这是废物测试。她在测试你的胆量。", suggestion: "不要解释，曲解她的意图。", sentiment_tag: "测试" };
        }
      } else {
        if (msg.includes("便宜") || msg.includes("预算")) {
           currentTrust -= 15;
           replyText = getRandom(BLUE_REPLIES.money_focus);
           analysisResult = { score: 20, trustLevel: currentTrust, coach_comment: "低端销售思维。他在乎的是价值，不是价格。", suggestion: "使用'利益锚定'，强调隐形价值。", sentiment_tag: "轻视" };
        } else if (msg.includes("保证") || msg.includes("尽力")) {
           currentTrust -= 10;
           replyText = getRandom(BLUE_REPLIES.weak_logic);
           analysisResult = { score: 40, trustLevel: currentTrust, coach_comment: "逻辑苍白。老板听到'尽力'就头疼。", suggestion: "提供AB方案供他选择。", sentiment_tag: "怀疑" };
        } else if (msg.length > 10 && (msg.includes("风险") || msg.includes("收益") || msg.includes("数据"))) {
           currentTrust += 15;
           replyText = getRandom(BLUE_REPLIES.impressed);
           analysisResult = { score: 90, trustLevel: currentTrust, coach_comment: "击中痛点！这是老板想听的商业语言。", suggestion: "推进承诺，敲定下一步。", sentiment_tag: "认可" };
        } else {
           currentTrust -= 5;
           replyText = getRandom(BLUE_REPLIES.pressure);
           analysisResult = { score: 50, trustLevel: currentTrust, coach_comment: "平庸的汇报。没犯错，但也没亮点。", suggestion: "结论先行，提升信息密度。", sentiment_tag: "无感" };
        }
      }
      
      resolve({ reply: replyText, analysis: analysisResult });
    }, 1000);
  });
};

export const generateSessionReport = async (messages: Message[], courseType: CourseType): Promise<SessionReport> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const isRed = courseType === CourseType.RED;
            resolve({
                score: currentTrust > 80 ? 92 : (currentTrust > 50 ? 75 : 40),
                radarData: isRed ? [
                    { subject: '共情力', A: 80, fullMark: 100 },
                    { subject: '推拉技巧', A: currentTrust, fullMark: 100 },
                    { subject: '心态框架', A: 70, fullMark: 100 },
                    { subject: '幽默感', A: 60, fullMark: 100 },
                    { subject: '抗压值', A: 90, fullMark: 100 },
                    { subject: '预期管理', A: 85, fullMark: 100 },
                ] : [
                    { subject: '逻辑闭环', A: 85, fullMark: 100 },
                    { subject: '向上管理', A: currentTrust, fullMark: 100 },
                    { subject: '利益博弈', A: 75, fullMark: 100 },
                    { subject: '数据敏感', A: 60, fullMark: 100 },
                    { subject: '风险控制', A: 90, fullMark: 100 },
                    { subject: '结构化', A: 80, fullMark: 100 },
                ],
                fatal_errors: isRed ? 
                    ["在第3轮过早暴露需求感", "面对废物测试时选择了解释", "结尾邀约过于生硬"] : 
                    ["汇报时没有结论先行", "被老板质疑数据时表现慌张", "没有提供Plan B"],
                mvp_line: isRed ? 
                    "你：'别太想我，虽然这很难。' (完美的情绪推拉)" : 
                    "你：'与其省这10%的预算，不如规避那30%的合规风险。' (精准的利益锚定)",
                training_plan: isRed ? 
                    "建议重修 'Phase 2: 情绪张力构建'，你的框架感在压力下容易崩塌。" : 
                    "建议加强 'Phase 3: 博弈谈判'，在面对强势方时需要更坚定的底牌思维。"
            });
        }, 1500);
    });
};

// ==========================================
// LESSON COACH AI (Knowledge Base + Simulation)
// ==========================================

// Fallback Knowledge Base: Ensures unique responses per lesson when offline
const COACH_KNOWLEDGE_BASE: Record<string, string> = {
    "red_1_1": "【关于奖品性】的核心误区是‘装高冷’。真正的奖品性不是不理人，而是‘我的快乐不依赖于你’。你可以热情，但不能卑微。试着在这个练习里，把‘请你吃饭’改成‘带你去个好地方’，感受下主导权的变化。",
    "red_1_2": "【沉没成本】不仅适用于金钱。让她为你改个备注、为你录一句语音、为你挑一张照片，都是投入。投入越琐碎、频率越高，她越离不开你。这就是‘温水煮青蛙’。",
    "red_2_1": "【推拉】的节奏感很重要。新手容易犯错的是：推得太狠变成了人身攻击，或者拉得太猛变成了表白。记住 3:1 原则，三次推之后必须接一次拉，否则她会觉得你讨厌她。",
    "red_2_2": "【冷读】失败了怎么办？如果她说‘我不喜欢猫啊’，你别慌。你要说：‘那说明你隐藏得很好，外表看起来独立，其实内心很渴望被照顾。’ —— 看，无论她说什么，你都能圆回来，这就是‘巴纳姆效应’的魅力。",
    "red_3_1": "【模糊邀约】的关键是‘随时可撤回’。如果她反应冷淡，你立刻切换话题，就像从来没邀请过一样。这样你就永远不会遭遇‘被拒绝’的挫败感，你的框架依然完美。",
    "blue_1_1": "【结论先行】在面对高管时是保命技能。如果CEO在电梯里问你‘项目怎么样’，你千万别说‘我们最近很努力’。你要说‘进度滞后2天，但已有追赶方案，预计周五回正’。结果+现状+方案，这才是专业。",
    "blue_1_2": "【MECE】不仅用于分析，还用于甩锅...啊不，界定责任。当你说‘问题出在非技术环节’时，你实际上是用MECE排除了技术部的责任。逻辑就是权力。",
    "blue_2_1": "【向上管理】很多时候是在管理老板的‘焦虑’。当他频繁问你进度时，说明他失控了。你要主动汇报，甚至在他问之前就汇报，这就是‘夺回控制权’。"
};

export const askLessonCoach = async (question: string, lessonContext: string, lessonId?: string): Promise<CoachMessage> => {
    // 1. Try Real Gemini API if available
    if (ai) {
      try {
        const systemInstruction = `
          你是一位深谙中国社会潜规则、进化心理学和商业博弈论的顶级沟通教练。
          当前课程内容：${lessonContext}
          
          你的风格：
          1. 犀利、一针见血，拒绝正确的废话。
          2. 善于引用心理学效应（如沉没成本、富兰克林效应、锚定效应）来解释现象。
          3. 如果用户问话术，给出的例子要贴合中国式语境（含蓄、面子、博弈）。
          4. 回答要结构化，控制在 150 字以内。
        `;

        const response = await ai.models.generateContent({
           model: 'gemini-2.5-flash',
           contents: question,
           config: {
            systemInstruction: systemInstruction
           }
        });
        
        return {
           id: Date.now().toString(),
           sender: 'coach',
           content: response.text || ""
        };
      } catch (e) {
        console.error("Gemini API Error, falling back to simulation:", e);
      }
    }

    // 2. Fallback: Context-Aware Smart Engine
    return new Promise((resolve) => {
        setTimeout(() => {
            let answer = "";
            const q = question.toLowerCase();
            
            // Check specific lesson knowledge base first
            if (lessonId && COACH_KNOWLEDGE_BASE[lessonId]) {
                answer = COACH_KNOWLEDGE_BASE[lessonId];
                // Append a generic engaging suffix sometimes
                if (Math.random() > 0.7) answer += " 你在实战中遇到过类似情况吗？";
            } 
            // Generic Keyword Matching if no specific lesson ID matches
            else if (lessonContext.includes("奖品")) {
                answer = "奖品性不是装出来的，是你有选择权。如果你只有她一个选项，你装得再像也会露馅。去拓展你的社交圈，当你真不在乎时，你就赢了。";
            } else if (lessonContext.includes("金字塔")) {
                answer = "金字塔原理不仅用于汇报，也用于吵架。先说结论：‘我生气是因为你迟到’，再说理由。别翻旧账，那样就不MECE了。";
            } else {
                answer = "这是一个很好的切入点。基于本课的底层逻辑，我认为你需要跳出'字面意思'，去思考这句话背后的权力博弈。如果你处于低位，说什么都是错的；如果你处于高位，说什么都是对的。先调整你的位阶。";
            }
            
            resolve({
                id: Date.now().toString(),
                sender: 'coach',
                content: answer
            });
        }, 1200);
    });
};
