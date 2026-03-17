const topicData = {
  "国家与法治": [
    {
      type: "review",
      title: "依法治国的核心",
      content: "依法治国的核心是依宪治国。宪法是国家的根本法，具有最高法律效力。"
    },
    {
      type: "quiz",
      title: "单选题",
      question: "我国的根本政治制度是：",
      choices: ["人民代表大会制度", "基层群众自治制度", "民族区域自治制度", "社会主义制度"],
      answer: 0,
      explanation: "人民代表大会制度是我国根本政治制度。"
    },
    {
      type: "review",
      title: "公民权利与义务关系",
      content: "公民权利和义务相统一。任何公民既是合法权利的享有者，也是法定义务的承担者。"
    },
    {
      type: "quiz",
      title: "单选题",
      question: "下列行为体现依法维权的是：",
      choices: ["网络辱骂他人", "私下报复侵权者", "通过法院起诉维权", "编造事实博同情"],
      answer: 2,
      explanation: "依法维权要通过合法程序，如诉讼、调解等。"
    }
  ],
  "道德与成长": [
    {
      type: "review",
      title: "友谊的特质",
      content: "友谊是一种亲密关系，是平等的、双向的，也是一种心灵相遇。"
    },
    {
      type: "quiz",
      title: "单选题",
      question: "面对青春期情绪波动，正确做法是：",
      choices: ["情绪来了就发泄", "压抑所有感受", "学会合理调节情绪", "把责任推给别人"],
      answer: 2,
      explanation: "调节情绪的方法包括转移注意、合理宣泄、自我暗示等。"
    },
    {
      type: "review",
      title: "止于至善",
      content: "止于至善要求我们从点滴小事做起，不断完善自我，追求更高道德境界。"
    },
    {
      type: "quiz",
      title: "单选题",
      question: "下列做法符合敬畏生命的是：",
      choices: ["校园欺凌旁观不管", "珍爱自己和他人生命", "危险水域嬉戏", "沉迷网络忽视作息"],
      answer: 1,
      explanation: "敬畏生命要求珍视生命价值，关爱他人。"
    }
  ],
  "国情与责任": [
    {
      type: "review",
      title: "中国梦本质",
      content: "中国梦的本质是国家富强、民族振兴、人民幸福。"
    },
    {
      type: "quiz",
      title: "单选题",
      question: "青少年服务社会的正确方式是：",
      choices: ["只关心个人利益", "参与志愿服务活动", "遇到问题回避", "盲目跟风消费"],
      answer: 1,
      explanation: "服务社会有助于实现人生价值，增强社会责任感。"
    },
    {
      type: "review",
      title: "创新的重要性",
      content: "创新是引领发展的第一动力。建设创新型国家需要落实科教兴国和人才强国战略。"
    },
    {
      type: "quiz",
      title: "单选题",
      question: "绿水青山就是金山银山体现了：",
      choices: ["只要经济不要环境", "人与自然和谐共生", "先污染后治理", "资源可以无限开发"],
      answer: 1,
      explanation: "可持续发展强调经济发展与生态保护统一。"
    }
  ]
};

const state = {
  topic: "",
  mode: "review",
  items: [],
  index: 0,
  currentItem: null,
  reviewingWrongOnly: false,
  storage: JSON.parse(localStorage.getItem("moralStudyProgress") || "{}")
};

const els = {
  topicSelect: document.getElementById("topic-select"),
  modeSelect: document.getElementById("mode-select"),
  startBtn: document.getElementById("start-btn"),
  cardTitle: document.getElementById("card-title"),
  cardContent: document.getElementById("card-content"),
  choices: document.getElementById("choices"),
  showAnswerBtn: document.getElementById("show-answer-btn"),
  markMasteredBtn: document.getElementById("mark-mastered-btn"),
  nextBtn: document.getElementById("next-btn"),
  feedback: document.getElementById("feedback"),
  masteredCount: document.getElementById("mastered-count"),
  wrongCount: document.getElementById("wrong-count"),
  streakCount: document.getElementById("streak-count"),
  reviewWrongBtn: document.getElementById("review-wrong-btn"),
  resetBtn: document.getElementById("reset-btn")
};

function ensureStorageShape() {
  state.storage.mastered = state.storage.mastered || [];
  state.storage.wrong = state.storage.wrong || [];
  state.storage.streak = state.storage.streak || 0;
}

function saveStorage() {
  localStorage.setItem("moralStudyProgress", JSON.stringify(state.storage));
  refreshStats();
}

function refreshStats() {
  els.masteredCount.textContent = state.storage.mastered.length;
  els.wrongCount.textContent = state.storage.wrong.length;
  els.streakCount.textContent = state.storage.streak;
}

function getItemId(item) {
  return `${state.topic}:${item.title}:${item.type}:${item.question || item.content}`;
}

function setupTopics() {
  Object.keys(topicData).forEach((topic) => {
    const option = document.createElement("option");
    option.value = topic;
    option.textContent = topic;
    els.topicSelect.appendChild(option);
  });
}

function buildSessionItems() {
  const allItems = topicData[state.topic].filter((item) => item.type === state.mode);
  if (state.reviewingWrongOnly && state.mode === "quiz") {
    const wrongSet = new Set(state.storage.wrong);
    state.items = allItems.filter((item) => wrongSet.has(getItemId(item)));
  } else {
    state.items = allItems;
  }
  state.index = 0;
}

function showItem() {
  els.feedback.textContent = "";
  els.feedback.className = "feedback";
  els.choices.innerHTML = "";

  if (state.items.length === 0) {
    els.cardTitle.textContent = "当前没有可学习内容";
    els.cardContent.textContent = state.reviewingWrongOnly
      ? "你没有该主题的错题，太棒了！"
      : "请切换主题或模式后再试。";
    return;
  }

  state.currentItem = state.items[state.index % state.items.length];
  els.cardTitle.textContent = `${state.currentItem.title}（${state.index + 1}/${state.items.length}）`;

  if (state.mode === "review") {
    els.cardContent.textContent = state.currentItem.content;
    els.showAnswerBtn.disabled = true;
    els.markMasteredBtn.disabled = false;
  } else {
    els.cardContent.textContent = state.currentItem.question;
    els.showAnswerBtn.disabled = false;
    els.markMasteredBtn.disabled = true;
    renderChoices();
  }
}

function renderChoices() {
  state.currentItem.choices.forEach((choice, idx) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = `${String.fromCharCode(65 + idx)}. ${choice}`;
    btn.addEventListener("click", () => checkAnswer(idx, btn));
    els.choices.appendChild(btn);
  });
}

function checkAnswer(selected, btn) {
  const isCorrect = selected === state.currentItem.answer;
  const id = getItemId(state.currentItem);

  [...els.choices.children].forEach((b, idx) => {
    b.disabled = true;
    if (idx === state.currentItem.answer) b.classList.add("correct");
  });

  if (isCorrect) {
    btn.classList.add("correct");
    state.storage.streak += 1;
    state.storage.wrong = state.storage.wrong.filter((wrongId) => wrongId !== id);
    els.feedback.textContent = `回答正确！${state.currentItem.explanation}`;
    els.feedback.classList.add("ok");
  } else {
    btn.classList.add("wrong");
    state.storage.streak = 0;
    if (!state.storage.wrong.includes(id)) {
      state.storage.wrong.push(id);
    }
    els.feedback.textContent = `回答错误。${state.currentItem.explanation}`;
    els.feedback.classList.add("error");
  }

  saveStorage();
}

function showAnswer() {
  if (state.mode !== "quiz" || !state.currentItem) return;
  els.feedback.textContent = `答案：${String.fromCharCode(65 + state.currentItem.answer)}。${state.currentItem.explanation}`;
  els.feedback.className = "feedback";
}

function markMastered() {
  if (state.mode !== "review" || !state.currentItem) return;
  const id = getItemId(state.currentItem);
  if (!state.storage.mastered.includes(id)) {
    state.storage.mastered.push(id);
    saveStorage();
  }
  els.feedback.textContent = "已标记为掌握，继续保持复习！";
  els.feedback.className = "feedback ok";
}

function nextItem() {
  if (!state.items.length) return;
  state.index += 1;
  showItem();
}

function startLearning() {
  state.topic = els.topicSelect.value;
  state.mode = els.modeSelect.value;
  state.reviewingWrongOnly = false;
  buildSessionItems();
  showItem();
}

function reviewWrongOnly() {
  state.topic = els.topicSelect.value;
  state.mode = "quiz";
  els.modeSelect.value = "quiz";
  state.reviewingWrongOnly = true;
  buildSessionItems();
  showItem();
}

function resetProgress() {
  state.storage = { mastered: [], wrong: [], streak: 0 };
  saveStorage();
  els.feedback.textContent = "学习记录已重置。";
  els.feedback.className = "feedback";
}

function init() {
  ensureStorageShape();
  setupTopics();
  refreshStats();
  state.topic = els.topicSelect.value;

  els.startBtn.addEventListener("click", startLearning);
  els.showAnswerBtn.addEventListener("click", showAnswer);
  els.markMasteredBtn.addEventListener("click", markMastered);
  els.nextBtn.addEventListener("click", nextItem);
  els.reviewWrongBtn.addEventListener("click", reviewWrongOnly);
  els.resetBtn.addEventListener("click", resetProgress);
}

init();
