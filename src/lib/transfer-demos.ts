/** Curated, traceable HUMOTO motions retargeted locally with SparkUMR v1.0.0.
 * These previews are kinematic visualizations, not hardware demonstrations.
 * Original source/license and exact processing records live outside public/.
 */
export const TRANSFER_MEDIA_VERSION = "sparkumr-cinema-20261123";
export const TRANSFER_MEDIA_ORIGIN = (
  process.env.NEXT_PUBLIC_TRANSFER_MEDIA_ORIGIN ||
  "https://xianova-web.oss-cn-shenzhen.aliyuncs.com"
).replace(/\/+$/, "");

export type TransferRobot = "fourier_gr3" | "unitree_g1" | "robotera_l3";
export const TRANSFER_ROBOTS: {
  id: TransferRobot;
  name: string;
  short: string;
  dof: number;
}[] = [
  { id: "fourier_gr3", name: "Fourier GR3", short: "GR3", dof: 53 },
  { id: "unitree_g1", name: "Unitree G1", short: "G1", dof: 37 },
  { id: "robotera_l3", name: "Robotera L3", short: "L3", dof: 55 },
];

export type TransferDemo = {
  id: string;
  title: { zh: string; en: string };
  description: { zh: string; en: string };
  tags: { zh: string[]; en: string[] };
  duration: number;
  contactCm: Record<TransferRobot, number>;
};

export const TRANSFER_DEMOS: TransferDemo[] = [
  {
    id: "285",
    title: { zh: "重整一张办公桌", en: "A desk, rearranged" },
    description: { zh: "手机、电脑、台灯、杯子与笔记本，串联起一段完整的桌面整理。", en: "Arrange a phone, laptop, lamp, mug and notebook in one extended desk task." },
    tags: { zh: ["连续操作", "复杂场景"], en: ["Sequential", "Complex scene"] },
    duration: 40.416667,
    contactCm: { fourier_gr3: 1.36, unitree_g1: 2.03, robotera_l3: 1.59 },
  },
  {
    id: "879",
    title: { zh: "坐姿饮水与交流", en: "Seated drinking and conversation" },
    description: { zh: "从坐姿交流，到倒水与饮用，将手臂、躯干和器具操作连接成完整任务。", en: "Coordinate seated conversation, pouring and drinking in a complete hand–object sequence." },
    tags: { zh: ["坐姿操作", "手物协同"], en: ["Seated manipulation", "Hand–object"] },
    duration: 24.75,
    contactCm: { fourier_gr3: 1.81, unitree_g1: 3.46, robotera_l3: 2.05 },
  },
  {
    id: "244",
    title: { zh: "搅拌与盛装，连续协作", en: "Mix, scoop, transfer" },
    description: { zh: "用刮刀搅拌碗中材料，再盛装到托盘，呈现双手与工具之间的连续配合。", en: "Mix ingredients with a spatula, then scoop them onto a tray in a coordinated bimanual task." },
    tags: { zh: ["双手工具操作", "搅拌盛装"], en: ["Bimanual tool use", "Mix & scoop"] },
    duration: 12.208333,
    contactCm: { fourier_gr3: 1.38, unitree_g1: 2.46, robotera_l3: 2.15 },
  },
  {
    id: "097",
    title: { zh: "倒一杯水，再饮用", en: "Pour, then drink" },
    description: { zh: "从保温壶向杯中倒水，再拿起杯子饮用，衔接工具与身体。", en: "Pour from a vacuum flask into a mug, then lift the mug to drink." },
    tags: { zh: ["工具操作", "手物协同"], en: ["Tool use", "Hand–object"] },
    duration: 12.166667,
    contactCm: { fourier_gr3: 1.32, unitree_g1: 2.06, robotera_l3: 1.97 },
  },
  {
    id: "752",
    title: { zh: "起身、探手，再取衣", en: "Rise, reach, retrieve" },
    description: { zh: "从床边起身，伸手触碰台灯，再走向衣架取衣。一个连贯的多阶段任务。", en: "Get out of bed, reach for a lamp, then walk to the rack to pick up clothes." },
    tags: { zh: ["全身协调", "长程任务"], en: ["Whole-body", "Multi-stage"] },
    duration: 24.791667,
    contactCm: { fourier_gr3: 1.69, unitree_g1: 4.27, robotera_l3: 1.62 },
  },
  {
    id: "767",
    title: { zh: "从高层架取物", en: "Reach high, place low" },
    description: { zh: "伸展身体，从高层架取下编织篮，再将它放到地面。", en: "Stretch to grasp a woven basket on a high shelf and lower it to the ground." },
    tags: { zh: ["高位取物", "弯腰放置"], en: ["High reach", "Lowering"] },
    duration: 8.375,
    contactCm: { fourier_gr3: 1.4, unitree_g1: 6.46, robotera_l3: 1.76 },
  },
  {
    id: "489",
    title: { zh: "把厨具逐一归位", en: "An organized workspace" },
    description: { zh: "抓取、转移、放置，将多件厨具整理进收纳托盘。", en: "Grasp, transfer and arrange cooking utensils in an organizer tray." },
    tags: { zh: ["多物体操作", "整理收纳"], en: ["Multi-object", "Organization"] },
    duration: 12.166667,
    contactCm: { fourier_gr3: 1.24, unitree_g1: 2.33, robotera_l3: 1.79 },
  },
  {
    id: "980",
    title: { zh: "在桌与推车间往返", en: "From table to cart" },
    description: { zh: "将杯子和碟子从边桌搬到推车，再逐一送回。", en: "Transfer a mug and side plate between a table and a utility cart, then return them." },
    tags: { zh: ["空间转运", "连续取放"], en: ["Spatial transfer", "Pick & place"] },
    duration: 14.666667,
    contactCm: { fourier_gr3: 1.33, unitree_g1: 2.03, robotera_l3: 1.65 },
  },
  {
    id: "798",
    title: { zh: "花瓶的双手转运", en: "Two hands, one vase" },
    description: { zh: "双手托举花瓶，在推车与置物架之间完成取放。", en: "Use both hands to move a vase from a utility cart to a shelf and back." },
    tags: { zh: ["双手搬运", "高度变化"], en: ["Bimanual carry", "Height change"] },
    duration: 12.291667,
    contactCm: { fourier_gr3: 1.33, unitree_g1: 2.39, robotera_l3: 1.67 },
  },
  {
    id: "594",
    title: { zh: "推行中的左右手切换", en: "Push, switch, continue" },
    description: { zh: "交替使用左右手推行衣架，将身体移动与持续接触连接起来。", en: "Alternate hands while pushing a clothes rack back and forth across the room." },
    tags: { zh: ["持续接触", "移动操作"], en: ["Sustained contact", "Loco-manipulation"] },
    duration: 11.625,
    contactCm: { fourier_gr3: 1.39, unitree_g1: 2.21, robotera_l3: 1.92 },
  },
];
