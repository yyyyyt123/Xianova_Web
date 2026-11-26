const articles = [
  {
    id: "gLpf_I5ATdyuyYX-j11BiA",
    title: "战略合作 | 夏仙创新与前海科创集团、前海大数据，携手共建前海深港具身中试基地，开启具身落地新篇章",
    date: "2026-11-11",
    summary: "三方签署前海深港具身智能数据中试训练场项目战略合作协议，将围绕场景共建、数据服务、模型训练和产业赋能开展合作。",
  },
  {
    id: "5zbmuRgvaLyn7DQm6MTDtQ",
    title: "WRC2026｜夏仙创新携手帕西尼展出 SparkInfinity 数据泛化方案",
    date: "2026-08-26",
    summary: "夏仙创新携手帕西尼亮相 2026 世界机器人大会，展示 SparkInfinity 如何把一次人类示教扩展到不同物体、场景和机器人本体。",
  },
  {
    id: "nBXarJsj0GbZo676t0FjIA",
    title: "战略合作 | 夏仙创新与帕西尼携手共建全模态、跨场景、跨本体具身数据泛化方案",
    date: "2026-08-25",
    summary: "夏仙创新与帕西尼在 2026 世界机器人大会签署战略合作协议，共同探索从全模态数据采集到跨本体、跨场景泛化的训练数据交付流程。",
  },
  {
    id: "pSvzd2I_l3jBMQuw-j-jjQ",
    title: "捷报！夏仙创新斩获第十八届深创赛创业组二等奖",
    date: "2026-08-19",
    summary: "夏仙创新凭借「泛化涌现」项目获奖，项目以物体中心表征为基础，探索操作技能在不同物体和机器人本体间的迁移。",
  },
  {
    id: "RIK8GwPqcD65JWVBNcTJuw",
    title: "法国南部大区代表团主席 Christian ESTROSI 参观夏仙创新具身操作零样本泛化演示",
    date: "2026-08-13",
    summary: "法国南部大区代表团到访璞跃中国大湾区国际创新中心，现场观看夏仙创新的具身操作零样本泛化演示。",
  },
  {
    id: "ry1Dnm_zGZENZVTLzDABtA",
    title: "夏仙创新受邀出席 APEC 技术向善研讨会：让具身智能回归“以人为本”",
    date: "2026-07-17",
    summary: "夏仙创新受邀参加在深圳前海举行的 APEC 技术向善研讨会，与各经济体代表探讨具身智能如何服务人的需求。",
  },
  {
    id: "GwYyVbE8eVqVGyk6m-mIVQ",
    title: "启幕前海 | 夏仙创新开启具身泛化新征程",
    date: "2026-07-10",
    summary: "夏仙创新正式入驻前海，与投资机构、产业协会和合作伙伴共同见证公司启幕，开启具身智能产业化的新阶段。",
  },
  {
    id: "sTTV8j_9aFUSvdgoeFcagQ",
    title: "张江科学城领导一行莅临夏仙创新调研指导",
    date: "2026-05-15",
    summary: "张江科学城一行到访夏仙创新，了解以物体为中心的几何表征技术，并观摩机器人操作技能跨场景迁移的真机演示。",
  },
];

export const curatedNews = articles.map((article) => ({
  ...article,
  url: `https://mp.weixin.qq.com/s/${article.id}`,
  image: `/images/news/${article.id}.jpg`,
  language: "zh" as const,
}));
