import { CourseModule, LessonType, CourseType, Message, GeminiResponse, SessionReport, TacticGenerationResponse, CoachMessage, PracticeResult } from './types';
import { GoogleGenAI } from "@google/genai";

// ==========================================
// GEMINI API CONFIGURATION (LAZY SAFE INIT)
// ==========================================

let aiInstance: GoogleGenAI | null = null;
let isInitialized = false;
let currentTrust = 50;

export const INITIAL_MESSAGES: Message[] = [];

const RED_REPLIES = {
  boring: ["哦。", "是吗。", "我在忙。", "不知道说什么。"],
  needy: ["我们要不还是做朋友吧。", "你太粘人了。", "我需要空间。"],
  impressed: ["哈哈，有点意思。", "原来你也懂这个。", "今晚有空吗？"],
  test: ["你是不是对每个女生都这么说？", "你觉得我胖吗？", "我和你妈掉水里你救谁？"]
};

const BLUE_REPLIES = {
  money_focus: ["预算没法批。", "太贵了，不考虑。", "这不在计划内。"],
  weak_logic: ["逻辑不通。", "数据支撑在哪里？", "我不觉得这是个好主意。"],
  impressed: ["这个方案很清晰。", "批准。", "就按你说的做。", "分析得很到位。"],
  pressure: ["重点是什么？", "我赶时间。", "一句话概括。"]
};

const getApiKey = (): string | undefined => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      // @ts-ignore
      return process.env.API_KEY;
    }
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_KEY) {
      // @ts-ignore
      return process.env.REACT_APP_API_KEY;
    }
  } catch (e) {
    return undefined;
  }
  return undefined;
};

const getAI = (): GoogleGenAI | null => {
  if (isInitialized) return aiInstance;

  const apiKey = getApiKey();
  if (apiKey) {
    try {
      aiInstance = new GoogleGenAI({ apiKey: apiKey });
      console.log("Gemini API Initialized Successfully");
    } catch (e) {
      console.error("Failed to initialize Gemini API:", e);
    }
  } else {
    console.warn("Gemini API Key not found. Falling back to ADVANCED SIMULATION ENGINE (Offline Mode).");
  }
  
  isInitialized = true;
  return aiInstance;
};

const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

// ==========================================
// EDUCATIONAL DATABASE v3.0 (COMPLETE)
// ==========================================

export const RED_COURSE_DATA: CourseModule[] = [
  {
    id: "red_phase_1",
    title: "第一阶段：认知重构 (MINDSET)",
    level: 1,
    lessons: [
      {
        id: "red_1_1",
        title: "1.1 奖品性框架 (The Prize Frame)",
        type: LessonType.THEORY,
        description: "社交位阶的物理学：彻底根除'讨好型'人格，建立高价值吸引力。",
        locked: false,
        completed: false,
        xp_reward: 100,
        pages: [
          { title: "第一章：供养者悖论", type: "text", content: `**为什么你对她越好，她越不珍惜？**\n\n这并非因为人性本恶，而是因为你违背了经济学第一定律：**边际效用递减**。\n*   空气对生存至关重要，但它是免费的，所以没人珍惜每一口呼吸。\n*   钻石除了好看毫无用处，但它是稀缺的，所以人人趋之若鹜。\n\n当你秒回信息、随叫随到、无底线包容时，你在向对方传达一个潜意识信号：\n**"我的时间是廉价的（像空气一样），我没有其他选择。"**\n\n这就是【供养者悖论】：\n当你试图通过"过度的付出"来换取"喜欢"时，你实际上是在进行一种低级的贿赂。\n在进化心理学中，女性寻找的是**基因价值（强者）**，而不是**服务价值（保姆）**。\n一旦你被归类为"供养者"，你的性吸引力（Sexual Tension）将瞬间归零。` },
          { title: "第二章：什么是'奖品性'？", type: "text", content: `要打破这个死循环，你必须重构你的底层操作系统，建立**【奖品性框架】(The Prize Frame)**。\n\n很多男生误以为"奖品性"就是装高冷、装逼。错。\n奖品性的核心独白是：\n**"我是一个高价值的人，我在筛选你，看你是否符合我的标准，而不是战战兢兢地等待你的挑选。"**\n\n**高位者的三大特征：**\n1.  **时间主权**：你永远优先处理自己的事情。回消息慢不是因为故作高深，而是因为你真的在忙于建设自己的人生。\n2.  **敢于后撤**：当对方表现出无礼、冷淡或不尊重时，你能够毫无心理负担地抽身离去。你不需要通过跪舔来维持关系。\n3.  **筛选思维**：不要问"她喜不喜欢我？"，要问"她是否有礼貌？"、"她是否有趣？"、"她是否值得我投入时间？"\n\n**记住：买家永远比卖家有底气。你要做买家。**` },
          { title: "第三章：多巴胺与预测误差", type: "key_takeaway", content: `为什么"坏男人"总是更有吸引力？这里涉及脑科学机制：**多巴胺奖赏预测误差 (RPE)**。\n\n如果一台老虎机，你每次拉杆都必定吐出1块钱，你玩两把就腻了。\n如果一台老虎机，你拉杆时而没钱，时而吐出100块，你会上瘾般地一直玩下去。\n\n**老实人的聊天**：\n早安、晚安、吃了吗、多喝水。\n——这是必定吐钱的老虎机。**预测误差为0，多巴胺分泌为0。**\n\n**高手的聊天**：\n时而热情（拉），时而冷淡（推）；时而秒回，时而消失。\n——这构成了**【间歇性强化】**。对方为了获得那个"不确定的奖励"，会投入巨大的沉没成本去猜测你的心思。\n\n**结论**：不要做那个确定的"早安机器"，要做那个不可预测的"盲盒"。` },
          { title: "第四章：话术重构 (Rewrite)", type: "case_analysis", content: `让我们通过具体的聊天场景，来看清"低位"与"高位"的区别。\n\n**场景一：女生发了一张有点模糊的自拍**\n\n❌ **低位（粉丝心态）**：\n"哇，太美了！仙女下凡！虽然有点模糊但依然挡不住你的美貌。"\n*解析：极度渴望认可，像个粉丝在控评。对方只会回一个表情包。*\n\n✅ **高位（评委心态）**：\n"这像素，你是用座机拍的吗？不过笑容还凑合。"\n*解析：1. 敢于调侃（Negging），建立了平视甚至俯视的框架。2. "笑容还凑合"是推拉中的拉，肯定了她的特质，而不是跪舔她的外表。*\n\n**场景二：女生问"你在干嘛？"**\n\n❌ **低位（汇报心态）**：\n"我在想你呀。刚下班，准备去吃饭，你吃了吗？"\n*解析：暴露极强需求感，瞬间交出底牌。*\n\n✅ **高位（奖品心态）**：\n"正在拯救世界（忙工作）。怎么，想我了？"\n*解析：1. 幽默化解。2. 反向筛选——将她的提问定义为"她在想我"，这是强者的自信。*` },
          { title: "第五章：废物测试破解", type: "text", content: `当你建立起奖品框架后，女生会本能地通过**【废物测试 (Shit-Test)】**来检验你的框架是否真实。\n她会故意刁难你，看你会不会瞬间变回那个唯唯诺诺的舔狗。\n\n**常见测试题：**\n1.  "你对每个女生都这么好吗？"\n2.  "你是不是个渣男？"\n3.  "你太小了/太老了/太矮了，不是我喜欢的类型。"\n\n**破解心法：**\n永远不要**解释**（Explain）、不要**道歉**（Apologize）、不要**合理化**（Rationalize）。\n要学会**曲解**、**夸大**、**反问**。\n\n*   她："你是不是渣男？"\n*   低位："我不是啊，我很专一的..."（解释=掩饰=低位）\n*   高位："是啊，我只渣我看上的人，可惜你还需要努力。"（承认+反向筛选）` },
          { title: "第六章：本课总结与作业", type: "key_takeaway", content: `**核心法则总结：**\n\n1.  **稀缺性**：你的关注是昂贵的，不要免费派发。\n2.  **不可预测性**：保持神秘感，制造多巴胺缺口。\n3.  **筛选而非讨好**：时刻评估她是否符合你的标准。\n\n**课后作业：**\n打开你的聊天软件，翻看最近的对话。\n找出三条你表现出"解释自己"、"急于回应"或"过度关心"的消息。\n尝试用本课学到的【奖品框架】将其重写，并记录在备忘录中。` },
          { title: "第七章：进阶彩蛋 (Bonus)", type: "text", content: `**恭喜你读到了最后！**\n这里有一个关于【心态建设】的终极心法：\n**"无所谓"**。\n\n这不是让你摆烂，而是让你在尽力之后，对结果保持"无所谓"的态度。\n*   她回不回消息？无所谓。\n*   她喜不喜欢我？无所谓。\n*   今天约会成不成功？无所谓。\n\n当你真的"无所谓"时，你的需求感就是零。而当你需求感为零时，你就是最迷人的。` }
        ],
        quiz_data: {
          question: "女生发消息说：'今晚好无聊啊。' 基于奖品框架，最佳回复是？",
          options: [
            { text: "无聊吗？那我陪你聊天呀，或者出来看电影？", isCorrect: false, feedback: "错误。你是随叫随到的陪聊吗？这是典型的供养者思维，暴露了你没有自己的生活。" },
            { text: "去跑个五公里就不无聊了。", isCorrect: false, feedback: "错误。直男思维，虽然没有跪舔，但终结了话题，没有提供任何情绪价值。" },
            { text: "那是因为你还没遇到有趣的人（比如我）。", isCorrect: true, feedback: "正确。1. 自信（我是奖品）。2. 提供了情绪诱饵。3. 并没有直接发出邀约，而是等她来咬钩。" }
          ]
        }
      },
      {
        id: "red_1_2",
        title: "1.2 沉没成本 (Sunk Cost)",
        type: LessonType.THEORY,
        description: "心理学黑客：如何让对方离不开你？引导投入的艺术。",
        locked: true,
        completed: false,
        xp_reward: 150,
        pages: [
            { title: "第一章：温水煮青蛙", type: "text", content: "**为什么很多女生离不开对她并不好的渣男？**\n为什么你在游戏里充了钱、肝了等级，就很难弃坑，哪怕游戏已经不好玩了？\n\n这背后的心理学机制是完全一样的：**沉没成本 (Sunk Cost)**。\n\n人性有一个巨大的Bug：\n**我们不是因为喜欢一个事物而为它付出，而是因为为它付出了，为了证明自己不是傻子，才不得不强迫自己去喜欢它。**\n\n这叫**【认知失调】(Cognitive Dissonance)**。\n如果她为你花了时间、花了钱、花了情绪，而她如果不喜欢你，那她就是一个\"浪费时间的傻子\"。\n大脑为了保护自尊，会修改记忆：\"我投入了这么多，我一定是很爱他。\"\n\n**结论：**\n想让一个人爱上你，不要拼命对她好。\n**要引导她，让她对你好。**" },
            { title: "第二章：富兰克林效应", type: "key_takeaway", content: "美国开国元勋本杰明·富兰克林曾通过向政敌\"借书\"，成功化敌为友。\n他总结道：\"**相比于那些你帮助过的人，那些曾经帮助过你的人，会更愿意再帮你一次。**\"\n\n在两性交往中，这被称为**【服从性测试】(Compliance Testing)**。\n你需要建立一个【请求 -> 投入 -> 奖赏】的循环。\n\n大多数\"好人\"不敢提要求，怕麻烦对方，怕被拒绝。\n结果就是：**你剥夺了对方为你投入的机会，也就剥夺了对方爱上你的机会。**" },
            { title: "第三章：投入的三个阶梯", type: "text", content: "如何科学地引导投入？你需要循序渐进。\n\n**Level 1: 微小服从 (Micro-Compliance)**\n*   目的：筛选感兴趣的人，建立初步框架。\n*   话术：\"声音太小了，发语音听听。\" / \"这张照片不错，发原图给我。\" / \"帮我拿下纸巾。\"\n*   *如果她拒绝微小要求，说明吸引力不足，切勿升级。*\n\n**Level 2: 行为投入 (Behavioral Investment)**\n*   目的：占用她的时间与精力。\n*   话术：\"我明天要面试，帮我挑条领带？\" / \"叫我起床，我怕闹钟叫不醒。\" / \"帮我查一下那家店的地址。\"\n\n**Level 3: 情绪投入 (Emotional Investment)**\n*   目的：深度绑定，成为情感合伙人。\n*   操作：向她展示你的脆弱（比如工作上的委屈），引导她来安慰你。让她在情绪上为你付出。" },
            { title: "第四章：话术重构 (Rewrite)", type: "case_analysis", content: "**场景：你想约她周末吃饭**\n\n❌ **供养者模式（全包式）**：\n\"周末想去哪玩？我来订票，我开车接你，你什么都不用操心，人来就行。\"\n*解析：你以为这是体贴？错。这叫\"剥夺参与感\"。如果那天堵车或者餐厅不好吃，她会直接怪罪你，因为她是\"消费者\"，你是\"服务员\"。*\n\n✅ **引导投入模式（合伙人）**：\n\"周末去爬山吧。我负责开车和背零食（你的投入），你负责做个简单的路书攻略，看看哪条路风景好（她的投入）。分工合作？\"\n*解析：\n1. 赋予了她任务。\n2. 增加了她的沉没成本（做攻略需要时间）。\n3. 如果路不好走，她也会包容，因为这是她选的路。*" },
            { title: "第五章：逆向思维", type: "text", content: "**为什么你不敢提要求？**\n因为你潜意识里觉得自己\"配不上\"对方，所以不敢给对方添麻烦。\n\n**强者思维：**\n\"我是高价值的，能帮上我的忙，是你的荣幸。\"\n这不是傲慢，这是一种底层的自信辐射。当你自信地提出要求时，对方会潜意识认为你是一个值得她付出的人。\n\n**注意：**\n当她为你付出了（比如帮你挑了衣服），你**必须**给予正向反馈（Reward）。\n\"眼光不错嘛，不愧是我看中的人。\"\n\"谢了，改天请你喝奶茶。\"\n**没有奖赏的投入是不可持续的。**" },
            { title: "第六章：AI 实战演练", type: "ai_practice", content: "【场景模拟】：你想约心仪的女生周末去看画展。为了增加她的沉没成本，不让她轻易鸽你，你应该怎么发出这个邀约？请在回复中包含一个小任务。", practice_id: "red_1_2_invite" },
            { title: "第七章：本课总结", type: "key_takeaway", content: "**核心心法**：\n1. **去保姆化**：停止无条件的付出。你的付出必须是有条件的。\n2. **交换思维**：我对你好，前提是你也对我好。\n3. **从小事开始**：不要一上来就要求大投入，先从“帮我拿个快递”开始训练她的服从性。\n\n记住：**爱情的本质是共谋。**只有共同付出的关系，才是稳固的。" }
        ],
        quiz_data: {
          question: "女生发消息说：'今晚好无聊啊。' 基于沉没成本原理，最佳回复是？",
          options: [
            { text: "那出来吃饭？我请你。", isCorrect: false, feedback: "错误。直接买单是供养者，没有引导她付出。" },
            { text: "推荐你看部电影《肖申克的救赎》，看完给我写个50字的观后感。", isCorrect: true, feedback: "正确。虽然有点夸张，但逻辑是对的：赋予了任务，让她投入时间精力。" },
            { text: "多喝热水。", isCorrect: false, feedback: "错误。无效关心。" }
          ]
        }
      },
      {
        id: "red_1_3",
        title: "1.3 去除需求感 (Killing Neediness)",
        type: LessonType.THEORY,
        description: "核心自信：如何戒断'秒回'和'查户口'，掌握最小兴趣原则。",
        locked: true,
        completed: false,
        xp_reward: 150,
        pages: [
            { title: "第一章：需求感即低价值", type: "text", content: "什么是需求感 (Neediness)？\n就是你向对方传达：**\"我需要你，比你需要我更多。\"**\n\n社会心理学中的**【最小兴趣原则】(Principle of Least Interest)** 指出：\n**在任何关系中，那个对继续关系最不感兴趣的人，拥有最大的权力。**\n\n*   秒回信息 = 我很闲，我在等你。\n*   连发好几条 = 我怕你没看见，我怕你冷落我。\n*   解释自己 = 我渴望你的认可。\n\n一旦暴露强需求感，你在对方眼中就变成了一个**\"已征服的猎物\"**。\n猎人对已经到手的猎物是没有兴趣的。" },
            { title: "第二章：忙碌是最好的医美", type: "text", content: "如何去除需求感？靠忍吗？\n忍是没用的，因为你的能量场会出卖你。你会变得焦虑、患得患失。\n\n真正的解法是：**你真的很忙，且生活精彩。**\n当你正在健身、在搞钱、在和兄弟开黑时，你回消息自然会慢。这种慢是真实的，是有底气的。\n\n**时间延迟法**：\n看到消息，不要条件反射地回。\n先问自己：\"我现在手头的事做完了吗？\"\n哪怕只是在看书，也要把这一章看完再回。\n这不仅是战术，更是对自己时间的尊重。" },
            { title: "第三章：镜像法则 (Mirroring)", type: "key_takeaway", content: "不知道怎么回消息？请遵循**【镜像法则】**。\n这就好比打乒乓球，她发什么球，你回什么球。\n\n1.  **字数镜像**：\n    *   她回：\"哦。\" (1个字)\n    *   你回：\"嗯。\" (1个字)\n    *   ❌ 错误：她回\"哦\"，你回\"怎么了？心情不好吗？我给你讲个笑话...\" (小作文)\n\n2.  **时间镜像**：\n    *   她隔30分钟回。\n    *   你也隔30分钟左右回。\n    *   ❌ 错误：她隔30分钟回，你秒回。\n\n3.  **情绪镜像**：\n    *   她冷淡，你冷淡。\n    *   她热情，你热情。\n    *   不要用你的热脸去贴冷屁股。" },
            { title: "第四章：话术重构 (Rewrite)", type: "case_analysis", content: "**场景一：女生隔了很久才回你消息**\n\n❌ **低位（抱怨/阴阳怪气）**：\n\"哟，大忙人终于回消息了。\" / \"你刚才干嘛去了？怎么不理我？\"\n*解析：这暴露了你一直在等她。你在索取解释，这是极度的不自信。*\n\n✅ **高位（无视/跳过）**：\n(她隔两小时回，你也隔两小时回)\n\"刚健完身（高价值展示）。你说那家店在哪来着？\"\n*解析：完全无视她的延迟。你的生活丰富多彩，根本没注意到她回晚了。这会让她产生好奇：\"他怎么不在乎我？\"*\n\n**场景二：她回复很敷衍（\"哈哈\"、\"嗯\"）**\n\n❌ **低位（强行找话）**：\n\"哈哈是什么意思呀？\" / \"那你吃饭了吗？\"\n*解析：你在跪求话题延续。*\n\n✅ **高位（主动切断）**：\n(不回，或者回一个表情包结束对话)\n*解析：奖励热情，惩罚冷淡。当她敷衍时，你撤回关注，这是对她行为的纠正。*" },
            { title: "第五章：敢于切断 (Walking Away)", type: "text", content: "去除需求感的最高境界，是**敢于主动结束对话**。\n\n很多男生舍不得结束对话，非要聊到\"晚安\"、聊到没话找话。\n这不仅油腻，而且消磨了好感。\n\n**意犹未尽法**：\n在聊天气氛最高潮、最开心的时候，主动说：\n\"先不聊了，我去开个会/去健个身，回聊。\"\n\n这会制造**【齐加尼克效应】(Zeigarnik Effect)**：\n因为对话在最高点戛然而止，她会一直回味刚才的快乐，并期待下一次聊天。" },
            { title: "第六章：AI 实战演练", type: "ai_practice", content: "【场景模拟】：你和女生聊得正开心，她突然发了一句：“不聊了，我去洗澡了。”（这是一个经典的终止信号，也可能是一个测试）。为了展示无需求感，你会怎么回？", practice_id: "red_1_3_shower" },
            { title: "第七章：本课总结", type: "key_takeaway", content: "**核心法则**：\n1. **镜像原则**：她字数少，你也少；她回得慢，你也慢。\n2. **生活重心**：你才是你电影的主角，她只是配角。不要为了配角暂停你的主线剧情。\n3. **敢于结束**：做那个主动挂电话的人。\n\n**心态口诀**：\n**\"有你很好，没你也行。\"**" }
        ],
        quiz_data: {
          question: "女生问：'你为什么对我这么好？' 怎么回才没有需求感？",
          options: [
            { text: "因为我喜欢你呀，我想追你。", isCorrect: false, feedback: "错误。过早表白，交出底牌，压力巨大。" },
            { text: "我对小猫小狗也挺好的。", isCorrect: true, feedback: "正确。推拉+曲解。否认了特殊性，展示了'我只是个好人'的无所谓态度，反而让她想证明自己很特殊。" },
            { text: "我对你好吗？还行吧。", isCorrect: false, feedback: "错误。平平无奇的解释。" }
          ]
        }
      },
      {
        id: "red_1_4",
        title: "1.4 第一阶段结业 (Phase Review)",
        type: LessonType.THEORY,
        description: "心态整合：构建坚不可摧的强者框架。",
        locked: true,
        completed: false,
        xp_reward: 300,
        pages: [
            { title: "第一章：强者画像 (The Avatar)", type: "text", content: "恭喜你完成了第一阶段 **MINDSET (认知重构)** 的学习。\n\n在进入下一阶段学习具体的\"推拉\"、\"冷读\"技巧之前，我们需要先确认你的\"操作系统\"是否已经升级。\n技巧是APP，心态是操作系统。\n如果是Windows 98的系统（舔狗心态），装再高级的APP（PUA话术）也会崩溃。\n\n**强者画像 (The Alpha Avatar)**：\n1.  **不反应**：面对废测、打压、冷淡，情绪稳定，不解释，不自证。\n2.  **不索取**：不索取情绪价值，不索取认可。我是光源，我照亮别人。\n3.  **不执着**：允许任何人离开我的生活。" },
            { title: "第二章：核心概念清单", type: "key_takeaway", content: "**请自查是否已内化以下概念：**\n\n*   **Prize Frame (奖品框架)**：我是买家，我在筛选。\n*   **Sunk Cost (沉没成本)**：引导投入，让她越陷越深。\n*   **Cognitive Dissonance (认知失调)**：利用她的大脑Bug，让她合理化对你的爱。\n*   **Compliance Testing (服从测试)**：从微小请求开始建立主导权。\n*   **Mirroring (镜像法则)**：敌不动我不动，敌动我动。\n*   **Zeigarnik Effect (未完成效应)**：在高潮处切断，制造想念。" },
            { title: "第三章：心态进阶 - 不反应", type: "text", content: "在实战中，女生会无意识地抛出情绪钩子。\n\"你今天穿得好土。\"\n\"你是不是没谈过恋爱？\"\n\n弱者的反应：愤怒、羞愧、急于辩解。\n强者的反应：**不反应 (Non-Reaction)**。\n\n你把它当成一阵风，或者把它当成一个笑话。\n\"是吗？看来我的时尚品味超前了二十年。\"\n这种\"不受影响\"的能力，是最大的吸引力。" },
            { title: "第四章：实战综合大考", type: "ai_practice", content: "【综合大考】：女生在朋友圈发了一张和异性的合照（虽然只是普通朋友），配文'今天很开心'。作为正在追她的你，你会评论什么来展示你的高框架？（提示：不要吃醋，不要忽视，要展示自信）", practice_id: "red_1_4_final" },
            { title: "第五章：下一步计划", type: "text", content: "你已经通过了新手村的试炼。\n现在的你，已经不再是一个会被轻易拿捏的\"老实人\"。\n\n**Next Phase: ATTRACTION (情绪张力)**\n在下一阶段，我们将学习如何主动出击：\n*   如何像过山车一样操纵她的情绪？\n*   如何不查户口也能知道她的一切？\n*   如何把她的每一句话都变成调情的素材？\n\n做好准备，游戏才刚刚开始。" }
        ],
        quiz_data: {
          question: "第一阶段的核心心法是？",
          options: [
            { text: "只要技巧深，铁杵磨成针。", isCorrect: false, feedback: "错误。技巧只是辅助。" },
            { text: "无所谓。", isCorrect: true, feedback: "正确。对结果无所谓，才能在过程中发挥至极。" },
            { text: "坚持就是胜利。", isCorrect: false, feedback: "错误。在错误的方向上坚持，是自取灭亡。" }
          ]
        }
      }
    ]
  },
  {
    id: "red_phase_2",
    title: "第二阶段：情绪张力 (ATTRACTION)",
    level: 2,
    lessons: [
      {
        id: "red_2_1",
        title: "2.1 推拉技巧 (Push-Pull)",
        type: LessonType.THEORY,
        description: "情绪过山车：利用间歇性强化，制造无法抗拒的心动感。",
        locked: true,
        completed: false,
        xp_reward: 200,
        pages: [
            { title: "第一章：情绪的物理学", type: "text", content: "平淡是吸引力的死敌。推拉就是制造情绪过山车..." },
            { title: "第二章：斯金纳箱 (Skinner Box)", type: "key_takeaway", content: "推拉的本质是间歇性强化..." },
            { title: "第三章：推拉公式", type: "text", content: "黄金比例：3次推 + 1次拉..." },
            { title: "第四章：实战误区", type: "case_analysis", content: "纯推是PUA，纯拉是舔狗..." },
            { title: "第五章：高阶校准", type: "text", content: "根据关系阶段调整力度..." },
            { title: "第六章：AI 实战演练", type: "ai_practice", content: "【场景模拟】：女生发了一张做饭的照片（卖相一般），配文“贤惠吗？”。请运用【先推后拉】的技巧进行回复。", practice_id: "red_2_1_pushpull" },
            { title: "第七章：本课总结", type: "key_takeaway", content: "哪怕是负面的情绪，也比没有情绪好。" }
        ],
        quiz_data: {
          question: "女生说：'你好讨厌。' 这说明了什么？",
          options: [
            { text: "她真的讨厌我。", isCorrect: false, feedback: "错误。" },
            { text: "我的推拉生效了，她在撒娇。", isCorrect: true, feedback: "正确。" },
            { text: "无视她。", isCorrect: false, feedback: "错误。" }
          ]
        }
      },
      {
        id: "red_2_2",
        title: "2.2 进阶冷读术 (Cold Reading)",
        type: LessonType.THEORY,
        description: "停止查户口：如何用陈述句瞬间建立深层共鸣？",
        locked: true,
        completed: false,
        xp_reward: 200,
        pages: [
            { title: "第一章：查户口是死罪", type: "text", content: "用陈述句代替疑问句..." },
            { title: "第二章：巴纳姆效应", type: "key_takeaway", content: "利用笼统的人格描述..." },
            { title: "第三章：猜错了怎么办", type: "case_analysis", content: "猜错也是一种互动..." },
            { title: "第四章：三层冷读法", type: "text", content: "浅层、情绪、深层..." },
            { title: "第五章：AI 实战演练", type: "ai_practice", content: "【场景模拟】：刚加微信，想知道她的职业。请使用冷读术。", practice_id: "red_2_2_coldread" }
        ]
      },
      {
        id: "red_2_3",
        title: "2.3 曲解与幽默 (Misinterpretation)",
        type: LessonType.THEORY,
        description: "调情大师：将每一句话都转化为暧昧的燃料。",
        locked: true,
        completed: false,
        xp_reward: 200,
        pages: [
            { title: "第一章：自恋式曲解", type: "text", content: "把她的任何反馈都解释为'她喜欢我'..." },
            { title: "第二章：性张力曲解", type: "key_takeaway", content: "安全地引入暧昧话题..." },
            { title: "第三章：AI 实战演练", type: "ai_practice", content: "【场景模拟】：女生说'你这人真讨厌'。请使用曲解回复。", practice_id: "red_2_3_humor" }
        ]
      },
      {
        id: "red_2_4",
        title: "2.4 第二阶段结业 (Review)",
        type: LessonType.THEORY,
        description: "张力整合：如何把握推拉的火候与分寸？",
        locked: true,
        completed: false,
        xp_reward: 300,
        pages: [
            { title: "第一章：校准", type: "text", content: "读空气的能力..." },
            { title: "第二章：AI 综合大考", type: "ai_practice", content: "【场景模拟】：夜店搭讪被拒'我不加陌生人'。请反转局势。", practice_id: "red_2_4_final" }
        ]
      }
    ]
  },
  {
    id: "red_phase_3",
    title: "第三阶段：关系升级 (ESCALATION)",
    level: 3,
    lessons: [
      {
        id: "red_3_1",
        title: "3.1 模糊邀约 (Vague Invite)",
        type: LessonType.THEORY,
        description: "零压力原则：如何发出一个100%不会被拒绝的邀约？",
        locked: true,
        completed: false,
        xp_reward: 250,
        pages: [
            { title: "第一章：正式邀约必死", type: "text", content: "不要给对方压力..." },
            { title: "第二章：AI 实战演练", type: "ai_practice", content: "【场景模拟】：想约女生滑雪，使用模糊邀约。", practice_id: "red_3_1_invite" }
        ]
      },
      {
        id: "red_3_2",
        title: "3.2 窗口识别 (Window Check)",
        type: LessonType.THEORY,
        description: "读心术：精准区分礼貌与兴趣。",
        locked: true,
        completed: false,
        xp_reward: 250,
        pages: [
            { title: "第一章：IOI与IOD", type: "text", content: "识别真假兴趣指标..." },
            { title: "第二章：AI 实战演练", type: "ai_practice", content: "【场景模拟】：她回了一张喝咖啡的照片。判断信号并回复。", practice_id: "red_3_2_window" }
        ]
      },
      {
        id: "red_3_3",
        title: "3.3 进挪技巧 (Kino)",
        type: LessonType.THEORY,
        description: "突破友谊区：自然地发生肢体接触。",
        locked: true,
        completed: false,
        xp_reward: 250,
        pages: [
            { title: "第一章：进挪阶梯", type: "text", content: "从社交触碰到亲密触碰..." },
            { title: "第二章：AI 实战演练", type: "ai_practice", content: "【场景模拟】：她说'你手好大'。设计进挪动作。", practice_id: "red_3_3_kino" }
        ]
      },
      {
        id: "red_3_4",
        title: "3.4 第三阶段结业 (Review)",
        type: LessonType.THEORY,
        description: "实战整合：从线上到线下的完美闭环。",
        locked: true,
        completed: false,
        xp_reward: 350,
        pages: [
            { title: "第一章：冷冻法", type: "text", content: "对方冷淡时的终极武器..." },
            { title: "第二章：AI 综合大考", type: "ai_practice", content: "【场景模拟】：临场被鸽。请给出高位回复。", practice_id: "red_3_4_final" }
        ]
      }
    ]
  },
  {
    id: "red_phase_4",
    title: "第四阶段：深层连接 (CONNECTION)",
    level: 4,
    lessons: [
        {
            id: "red_4_1",
            title: "4.1 情绪一致性 (Consistency)",
            type: LessonType.THEORY,
            description: "安全感来源：成为她在情绪风暴中的'定海神针'。",
            locked: true,
            completed: false,
            xp_reward: 300,
            pages: [
                { title: "第一章：定海神针", type: "text", content: "长期关系的核心是情绪稳定性..." }
            ]
        },
        {
            id: "red_4_2",
            title: "4.2 策略性示弱 (Vulnerability)",
            type: LessonType.THEORY,
            description: "出丑效应：为什么完美的男人不可爱？",
            locked: true,
            completed: false,
            xp_reward: 300,
            pages: [
                { title: "第一章：出丑效应", type: "text", content: "暴露无伤大雅的缺点..." }
            ]
        },
        {
            id: "red_4_3",
            title: "4.3 赋格技术 (Qualifying)",
            type: LessonType.THEORY,
            description: "皮格马利翁效应：如何让她变成你想要的样子？",
            locked: true,
            completed: false,
            xp_reward: 300,
            pages: [
                { title: "第一章：贴标签", type: "text", content: "赞美你希望她具备的特质..." }
            ]
        },
        {
            id: "red_4_4",
            title: "4.4 第四阶段结业",
            type: LessonType.THEORY,
            description: "灵魂伴侣的诞生。",
            locked: true,
            completed: false,
            xp_reward: 350,
            pages: [
                { title: "第一章：深度共情", type: "text", content: "不仅听懂内容，更听懂情绪..." }
            ]
        }
    ]
  },
  {
    id: "red_phase_5",
    title: "第五阶段：长期关系 (MASTERY)",
    level: 5,
    lessons: [
      {
        id: "red_5_1",
        title: "5.1 依恋类型 (Attachment Styles)",
        type: LessonType.THEORY,
        description: "识别伴侣的底层代码：焦虑型 vs 回避型。",
        locked: true,
        completed: false,
        xp_reward: 350,
        pages: [
            {
                title: "第一章：相爱相杀的魔咒",
                type: "text",
                content: `**为什么越想抓紧，对方跑得越快？**\n\n在长期关系中，最痛苦的组合莫过于**【焦虑型 (Anxious)】**遇到了**【回避型 (Avoidant)】**。\n\n*   **焦虑型**：核心恐惧是**被抛弃**。表现为夺命连环Call、疑神疑鬼、需要不断确认"你爱我"。\n*   **回避型**：核心恐惧是**被吞噬**。表现为拒绝亲密、需要独立空间、一有冲突就冷暴力。\n\n当焦虑型拼命追（索取安全感），回避型就会拼命逃（捍卫独立性）。这就是**【追逃模式】(Pursuer-Distancer Dance)**。`
            },
            {
                title: "第二章：安全基地 (Secure Base)",
                type: "key_takeaway",
                content: `破局的关键在于：**你需要模拟【安全型 (Secure)】依恋。**\n\n如果你是焦虑型，你需要学会**自我安抚**。\n当你感到不安时，不要立刻去骚扰对方，而是去做十个深呼吸，告诉自己："她没回消息可能只是在忙，不是不爱我。"\n\n如果你是回避型，你需要学会**预告需求**。\n不要直接消失，而是说："我现在有点乱，需要一个人静静，1小时后找你。"\n\n**做对方的安全基地**：\n无论她在外面受了什么委屈，你这里永远是温暖的港湾，而不是审判庭。`
            },
            {
                title: "第三章：AI 实战演练",
                type: "ai_practice",
                content: "【场景模拟】：你的伴侣（典型的回避型）最近工作压力大，回家后一言不发，躲进房间玩手机。作为想缓解关系的你，应该怎么做/怎么说？",
                practice_id: "red_5_1_attach"
            }
        ],
        quiz_data: {
          question: "面对回避型伴侣的冷淡，焦虑型最错误的做法是？",
          options: [
            { text: "疯狂发消息问'你怎么了'。", isCorrect: false, feedback: "错误。这会触发回避型的防御机制，让他逃得更远。" },
            { text: "给他空间，做自己的事。", isCorrect: true, feedback: "正确。停止追逐，他感到安全后自然会回来。" },
            { text: "比他更冷淡。", isCorrect: false, feedback: "错误。这是赌气，不是解决问题。" }
          ]
        }
      },
      {
        id: "red_5_2",
        title: "5.2 非暴力沟通 (NVC)",
        type: LessonType.THEORY,
        description: "高情商吵架：如何在表达不满的同时，还能加深感情？",
        locked: true,
        completed: false,
        xp_reward: 350,
        pages: [
            {
                title: "第一章：暴力的语言",
                type: "text",
                content: `❌ **常见的暴力沟通**：\n*   **道德评判**："你太自私了！"\n*   **进行比较**："你看别人男朋友..."\n*   **推卸责任**："都怪你让我生气！"\n*   **强人所难**："你必须马上道歉！"\n\n这些话发泄了情绪，但**没有任何建设性**。它们只会激起对方的防御，把争吵变成一场输赢的博弈。`
            },
            {
                title: "第二章：NVC 四步法",
                type: "key_takeaway",
                content: `马歇尔·卢森堡博士提出的**非暴力沟通 (Nonviolent Communication)** 包含四个要素：\n\n1.  **观察 (Observation)**：陈述客观事实，不带评判。\n    *   ❌ "你天天迟到。" (评判)\n    *   ✅ "这周你要么是8点后才回来。" (事实)\n\n2.  **感受 (Feeling)**：表达你的情绪，而不是想法。\n    *   ❌ "我觉得你不爱我。" (想法)\n    *   ✅ "我感到很孤单，很失落。" (感受)\n\n3.  **需要 (Need)**：挖掘情绪背后的根源。\n    *   ✅ "因为我很看重我们的共处时间。"\n\n4.  **请求 (Request)**：具体的、可执行的行动。\n    *   ❌ "你能不能对我好点？" (模糊)\n    *   ✅ "以后能不能每周二晚上陪我吃顿饭？" (具体)`
            },
            {
                title: "第三章：话术重构",
                type: "case_analysis",
                content: `**场景：男朋友打游戏不理你**\n\n❌ **暴力版**：\n"一天到晚就知道玩游戏！这日子没法过了！你跟游戏过一辈子去吧！"\n*结果：他会觉得你不可理喻，戴上耳机继续玩。*\n\n✅ **NVC版**：\n"我看你回家后一直在打游戏（观察），都没跟我说过话。"\n"我感到有点被忽略，挺难过的（感受）。"\n"因为我希望能跟你分享一下今天发生的趣事（需要）。"\n"这局打完后，能不能陪我聊10分钟？（请求）"\n*结果：他会意识到你的需求，并且这个请求很容易做到。*`
            },
            {
                title: "第四章：AI 实战演练",
                type: "ai_practice",
                content: "【场景模拟】：对方答应周末陪你去看电影，结果临时变卦去和朋友喝酒。你很生气。请使用【NVC四步法】表达你的不满。",
                practice_id: "red_5_2_nvc"
            }
        ]
      },
      {
        id: "red_5_3",
        title: "5.3 终极考核：分手挽回 (The Breakup)",
        type: LessonType.BOSS_FIGHT,
        description: "Boss战：女友提出分手。你需要运用全套技巧（一致性、共情、NVC）化解危机。",
        locked: true,
        completed: false,
        xp_reward: 1000,
        pages: []
      }
    ]
  }
];

export const BLUE_COURSE_DATA: CourseModule[] = [
  {
    id: "blue_phase_1",
    title: "第一阶段：逻辑构建 (LOGIC)",
    level: 1,
    lessons: [
      {
        id: "blue_1_1",
        title: "1.1 金字塔原理 (Pyramid Principle)",
        type: LessonType.THEORY,
        description: "麦肯锡顾问的沟通铁律：如何用30秒说清复杂问题？",
        locked: false,
        completed: false,
        xp_reward: 100,
        pages: [
          {
            title: "第一章：高管的大脑运作机制",
            type: "text",
            content: `你是否遇到过这种情况：\n你准备了详尽的PPT，刚讲了三分钟，老板就打断你："你到底想说什么？重点是什么？"\n\n这不怪老板没耐心。\n高层管理者的认知带宽极度稀缺。他们的大脑被训练成**"找结论"**的机器。\n如果你采用【演绎推理】（先说背景，再说过程，最后给结论），老板在听到结论前，大脑必须悬空，处于高负荷状态。\n\n**金字塔原理的核心：结论先行 (Bottom Line First)**\n先说中心思想，再由上而下地展开论述。\n就像报纸的头条，一句话概括所有，感兴趣的人自然会读下去。`
          },
          {
            title: "第二章：SCQA 叙事框架",
            type: "text",
            content: `如何优雅地引出结论？麦肯锡推荐 **SCQA 框架**。\n这是一个能让干涩的商业汇报变得像故事一样引人入胜的结构。\n\n1.  **S (Situation) 情境**：大家都认可的背景事实。\n2.  **C (Complication) 冲突**：在这个背景下发生了什么问题/变化？\n3.  **Q (Question) 疑问**：那我们该怎么办？\n4.  **A (Answer) 回答**：你的解决方案（即结论）。\n\n**例子：**\n*   (S) 公司要在下季度实现20%增长。\n*   (C) 但是目前流量成本暴涨了50%。\n*   (Q) 我们如何在不增加预算的情况下完成目标？\n*   (A) 我建议砍掉低效的展示广告，全面转向私域运营。`
          },
          {
            title: "第三章：汇报实战对比",
            type: "case_analysis",
            content: `**场景：项目延期汇报**\n\n❌ **普通员工（流水账式）**：\n"王总，是这样的。上周三阿里云服务器波动了一下，导致数据没同步过来。然后小李又请了两天病假。加上客户那边需求变来变去，设计图改了三版。所以原本定于周五的上线可能要推迟..."\n*老板OS：烦死了，你就说什么时候能上！*\n\n✅ **高潜人才（金字塔式）**：\n"王总，项目将延期3天，预计下周一上线（结论）。\n核心原因有三点（归类）：\n1. 基础设施故障（阿里云波动）；\n2. 关键人力缺失（核心开发病假）；\n3. 需求蔓延（客户新增需求）。\n为了保上线，我建议启动B方案：先上核心功能，次要功能延后迭代（方案）。您看可以吗？"\n*老板OS：逻辑清晰，有理有据，还给了方案。准了。*`
          },
          {
            title: "第四章：AI 实战演练",
            type: "ai_practice",
            content: "【场景模拟】：你在电梯里遇到了CEO，他问你：“最近那个AI项目进展怎么样？” 你只有30秒的时间（电梯时间）。请运用【金字塔原理】进行汇报。",
            practice_id: "blue_1_1_elevator"
          }
        ],
        quiz_data: {
          question: "SCQA框架中，C代表什么？",
          options: [
            { text: "Conclusion (结论)", isCorrect: false, feedback: "错误。" },
            { text: "Complication (冲突)", isCorrect: true, feedback: "正确。冲突是推动故事发展的动力，也是引出问题的关键。" },
            { text: "Context (背景)", isCorrect: false, feedback: "错误。" }
          ]
        }
      },
      {
        id: "blue_1_2",
        title: "1.2 MECE原则 (不重不漏)",
        type: LessonType.THEORY,
        description: "逻辑思维的黄金法则：如何让你的分析滴水不漏？",
        locked: true,
        completed: false,
        xp_reward: 150,
        pages: [
            {
                title: "第一章：什么是 MECE",
                type: "text",
                content: `**MECE (Mutually Exclusive, Collectively Exhaustive)**\n意思是：**相互独立，完全穷尽**。\n\n这是咨询顾问分析问题的基本功。\n\n*   **相互独立**：你的分类之间不能有重叠。比如把人分为“男人”和“老人”，就是有重叠的（老男人）。\n*   **完全穷尽**：你的分类加起来必须等于整体，不能有遗漏。比如把人分为“男人”和“女人”，理论上是穷尽的（暂不考虑非二元）。\n\n如果不MECE，你的逻辑就会有漏洞，容易被人攻击。`
            },
            {
                title: "第二章：如何构建逻辑树",
                type: "key_takeaway",
                content: `解决复杂问题，要学会画**逻辑树 (Logic Tree)**。\n\n**问题：利润下降了**\n\n*   **收入减少**\n    *   销量下降\n    *   价格下降\n*   **成本增加**\n    *   固定成本增加（房租、人员）\n    *   变动成本增加（原材料、营销）\n\n通过这种层层拆解，你可以迅速定位到问题的症结，而不是瞎猜。`
            }
        ]
      }
    ]
  },
  {
    id: "blue_phase_2",
    title: "第二阶段：向上管理 (MANAGEMENT)",
    level: 2,
    lessons: [
        { id: "blue_2_1", title: "2.1 预期管理", type: LessonType.THEORY, description: "待更新...", locked: true, completed: false, xp_reward: 0, pages: [] }
    ]
  },
  {
    id: "blue_phase_3",
    title: "第三阶段：横向博弈 (INFLUENCE)",
    level: 3,
    lessons: [
        { id: "blue_3_1", title: "3.1 利益地图", type: LessonType.THEORY, description: "待更新...", locked: true, completed: false, xp_reward: 0, pages: [] }
    ]
  },
  {
    id: "blue_phase_4",
    title: "第四阶段：谈判说服 (NEGOTIATION)",
    level: 4,
    lessons: [
        { id: "blue_4_1", title: "4.1 BATNA", type: LessonType.THEORY, description: "待更新...", locked: true, completed: false, xp_reward: 0, pages: [] }
    ]
  },
  {
    id: "blue_phase_5",
    title: "第五阶段：高阶领导力 (LEADERSHIP)",
    level: 5,
    lessons: [
        { id: "blue_5_1", title: "5.1 灰度决策", type: LessonType.THEORY, description: "待更新...", locked: true, completed: false, xp_reward: 0, pages: [] }
    ]
  }
];

export const evaluatePractice = async (practiceId: string, userAnswer: string): Promise<PracticeResult> => {
    const ai = getAI();
    if (ai) {
        try {
            const systemInstruction = `
              你是一位严厉的社交教练。请根据用户对特定场景的回答进行评分（0-100）和点评。
              场景ID: ${practiceId}
              评分标准：
              - 红色（情感）：高位框架、推拉得当、有趣、无需求感、NVC非暴力。
              - 蓝色（逻辑）：结论先行、逻辑清晰、利益导向。
              
              返回JSON格式：{"score": number, "feedback": string, "sentiment": "GOOD" | "BAD" | "NEUTRAL"}
            `;
            const response = await ai.models.generateContent({
               model: 'gemini-2.5-flash',
               contents: userAnswer,
               config: { systemInstruction: systemInstruction, responseMimeType: "application/json" }
            });
            const json = JSON.parse(response.text || "{}");
            return {
                score: json.score || 50,
                feedback: json.feedback || "AI 评分服务暂时不可用。",
                sentiment: json.sentiment || "NEUTRAL"
            };
        } catch (e) {
            console.error("Gemini Practice Eval Error:", e);
        }
    }

    // FALLBACK SIMULATION LOGIC
    return new Promise((resolve) => {
        setTimeout(() => {
            const lowerAnswer = userAnswer.toLowerCase();
            let score = 60;
            let feedback = "中规中矩的回答。";
            let sentiment: 'GOOD' | 'BAD' | 'NEUTRAL' = "NEUTRAL";

            // PHASE 1-3 SCENARIOS
            if (practiceId === "red_1_2_invite") {
                if (lowerAnswer.includes("帮我") || lowerAnswer.includes("推荐") || lowerAnswer.includes("选")) {
                    score = 90; feedback = "完美！成功引导投入。"; sentiment = "GOOD";
                } else if (lowerAnswer.includes("请你")) {
                    score = 40; feedback = "太卑微了。"; sentiment = "BAD";
                }
            } else if (practiceId === "red_1_3_shower") {
                if (lowerAnswer.includes("去吧") || lowerAnswer.length < 6) {
                    score = 95; feedback = "干得漂亮！无需求感。"; sentiment = "GOOD";
                } else if (lowerAnswer.includes("等你")) {
                    score = 20; feedback = "需求感爆表！"; sentiment = "BAD";
                }
            } else if (practiceId === "red_1_4_final") {
                if (lowerAnswer.includes("点赞") || lowerAnswer.includes("不错")) {
                     score = 85; feedback = "稳妥。自信关注。"; sentiment = "GOOD";
                } else if (lowerAnswer.includes("谁") || lowerAnswer.includes("酸")) {
                     score = 10; feedback = "大忌！你在吃醋。"; sentiment = "BAD";
                }
            } else if (practiceId === "red_2_1_pushpull") {
                if ((lowerAnswer.includes("毒") || lowerAnswer.includes("能吃")) && lowerAnswer.includes("不错")) {
                    score = 90; feedback = "完美推拉！"; sentiment = "GOOD";
                } else if (lowerAnswer.includes("好看") || lowerAnswer.includes("想吃")) {
                    score = 50; feedback = "太普通了。"; sentiment = "NEUTRAL";
                }
            } else if (practiceId === "red_2_2_coldread") {
                if (lowerAnswer.includes("看你") || lowerAnswer.includes("感觉")) {
                    score = 90; feedback = "很好！使用了冷读。"; sentiment = "GOOD";
                } else if (lowerAnswer.includes("你是")) {
                    score = 30; feedback = "错误！查户口。"; sentiment = "BAD";
                }
            } else if (practiceId === "red_2_3_humor") {
                if (lowerAnswer.includes("爱上") || lowerAnswer.includes("魅力")) {
                    score = 95; feedback = "大师级曲解！"; sentiment = "GOOD";
                } else if (lowerAnswer.includes("对不起")) {
                    score = 40; feedback = "不要道歉。"; sentiment = "BAD";
                }
            } else if (practiceId === "red_2_4_final") {
                if (lowerAnswer.includes("谁说要加") || lowerAnswer.includes("想多了")) {
                    score = 90; feedback = "漂亮！反将一军。"; sentiment = "GOOD";
                } else if (lowerAnswer.includes("就加一个")) {
                    score = 10; feedback = "低价值纠缠。"; sentiment = "BAD";
                }
            } else if (practiceId === "red_3_1_invite") {
                if ((lowerAnswer.includes("听说") || lowerAnswer.includes("最近")) && !lowerAnswer.includes("去不去")) {
                    score = 90; feedback = "完美的诱饵抛出！"; sentiment = "GOOD";
                } else if (lowerAnswer.includes("想去")) {
                    score = 60; feedback = "有点急了。"; sentiment = "NEUTRAL";
                }
            } else if (practiceId === "red_3_2_window") {
                if (lowerAnswer.includes("杯子") || lowerAnswer.includes("环境")) {
                    score = 90; feedback = "冷读细节，高手。"; sentiment = "GOOD";
                } else if (lowerAnswer.includes("好喝吗")) {
                    score = 50; feedback = "查户口。"; sentiment = "NEUTRAL";
                }
            } else if (practiceId === "red_3_3_kino") {
                if (lowerAnswer.includes("比一比") || lowerAnswer.includes("抓")) {
                    score = 95; feedback = "很自然的进挪理由！"; sentiment = "GOOD";
                } else if (lowerAnswer.includes("摸")) {
                    score = 30; feedback = "有点猥琐了。"; sentiment = "BAD";
                }
            } else if (practiceId === "red_3_4_final") {
                if (lowerAnswer.includes("好的") || lowerAnswer.includes("去忙")) {
                    score = 90; feedback = "完美后撤。"; sentiment = "GOOD";
                } else if (lowerAnswer.includes("为什么")) {
                    score = 40; feedback = "暴露了失望。"; sentiment = "BAD";
                }
            }

            // PHASE 5 SCENARIOS
            else if (practiceId === "red_5_1_attach") {
                if (lowerAnswer.includes("空间") || lowerAnswer.includes("待会") || lowerAnswer.includes("静静")) {
                    score = 90; feedback = "很好！给回避型空间，就是最大的安全感。"; sentiment = "GOOD";
                } else if (lowerAnswer.includes("怎么了") || lowerAnswer.includes("谈谈")) {
                    score = 40; feedback = "逼得太紧了，他现在需要的是洞穴，不是沟通。"; sentiment = "BAD";
                }
            } else if (practiceId === "red_5_2_nvc") {
                if (lowerAnswer.includes("我感到") && lowerAnswer.includes("因为") && lowerAnswer.includes("希望")) {
                    score = 95; feedback = "完美的NVC格式！表达感受而非指责，提出具体请求。"; sentiment = "GOOD";
                } else if (lowerAnswer.includes("你总是") || lowerAnswer.includes("骗子")) {
                    score = 20; feedback = "这是暴力沟通，只会引发争吵。"; sentiment = "BAD";
                }
            } else if (practiceId === "blue_1_1_elevator") {
                if (lowerAnswer.includes("进展顺利") || lowerAnswer.includes("延期") || lowerAnswer.includes("上线")) {
                    score = 85; feedback = "结论先行，这正是CEO想听的。"; sentiment = "GOOD";
                } else if (lowerAnswer.length > 50 && !lowerAnswer.includes("总的来说")) {
                    score = 50; feedback = "太啰嗦了，电梯门都要开了你还没说完重点。"; sentiment = "NEUTRAL";
                }
            }

            resolve({ score, feedback, sentiment });
        }, 1500);
    });
};

export const callGeminiAPI = async (message: string, courseType: CourseType): Promise<GeminiResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const msg = message.toLowerCase();
      const isRed = courseType === CourseType.RED;
      let replyText = "";
      let analysisResult: any = {};
      
      if (isRed) {
        if (msg.length < 5 || msg.includes("在吗")) {
           currentTrust -= 15;
           replyText = getRandom(RED_REPLIES.boring);
           analysisResult = { score: 10, trustLevel: currentTrust, coach_comment: "低价值开场。", suggestion: "使用冷读。", sentiment_tag: "鄙视" };
        } else {
           currentTrust += 5;
           replyText = getRandom(RED_REPLIES.impressed);
           analysisResult = { score: 80, trustLevel: currentTrust, coach_comment: "不错的回复。", suggestion: "继续保持。", sentiment_tag: "兴趣" };
        }
      } else {
        if (msg.includes("便宜")) {
           currentTrust -= 15;
           replyText = getRandom(BLUE_REPLIES.money_focus);
           analysisResult = { score: 20, trustLevel: currentTrust, coach_comment: "低端思维。", suggestion: "谈价值。", sentiment_tag: "轻视" };
        } else {
           currentTrust += 5;
           replyText = getRandom(BLUE_REPLIES.impressed);
           analysisResult = { score: 85, trustLevel: currentTrust, coach_comment: "逻辑清晰。", suggestion: "推进落地。", sentiment_tag: "认可" };
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
                score: currentTrust > 80 ? 92 : 60,
                radarData: [
                    { subject: isRed ? '共情' : '逻辑', A: 80, fullMark: 100 },
                    { subject: isRed ? '心态' : '结构', A: 70, fullMark: 100 },
                    { subject: isRed ? '推拉' : '博弈', A: 90, fullMark: 100 },
                    { subject: isRed ? '幽默' : '数据', A: 60, fullMark: 100 },
                    { subject: isRed ? '进挪' : '风控', A: 85, fullMark: 100 },
                    { subject: isRed ? '框架' : '汇报', A: 75, fullMark: 100 },
                ],
                fatal_errors: ["无致命失误"],
                mvp_line: "暂无高光时刻",
                training_plan: "建议继续进修下一阶段课程。"
            });
        }, 1500);
    });
};

export const generateTacticContent = async (tacticKeyword: string): Promise<TacticGenerationResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ generatedText: "正在生成高情商回复..." });
    }, 800);
  });
};

export const askLessonCoach = async (question: string, lessonContext: string, lessonId?: string): Promise<CoachMessage> => {
    const ai = getAI();
    if (ai) {
      try {
        const systemInstruction = `你是一位顶级沟通教练。课程内容：${lessonContext}`;
        const response = await ai.models.generateContent({
           model: 'gemini-2.5-flash',
           contents: question,
           config: { systemInstruction }
        });
        return { id: Date.now().toString(), sender: 'coach', content: response.text || "" };
      } catch (e) { console.error(e); }
    }
    return { id: Date.now().toString(), sender: 'coach', content: "这是个好问题，关键在于透过现象看本质。" };
};

export const resetTrust = () => { currentTrust = 50; };