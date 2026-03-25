const form = document.getElementById('ask-form');
const questionInput = document.getElementById('question');
const answerEl = document.getElementById('answer');
const statusEl = document.getElementById('status');
const submitBtn = document.getElementById('submit-btn');
const randomBtn = document.getElementById('random-btn');
const tipButtons = document.querySelectorAll('.tip-item');

const samples = [
  '我应该如何面对未知？',
  '人类为什么总要走向更远的地方？',
  '当我迷茫的时候，该相信什么？',
  '孤独是不是探索宇宙的代价？',
  '如果黑暗漫长，我还要坚持吗？'
];

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  randomBtn.disabled = isLoading;
  tipButtons.forEach((btn) => { btn.disabled = isLoading; });
  questionInput.disabled = isLoading;
  submitBtn.textContent = isLoading ? '正在接收宇宙回声…' : '向宇宙发问';
}

function setAnswer(text, { error = false } = {}) {
  answerEl.textContent = text;
  answerEl.classList.toggle('empty', !text || text === '你的答案会出现在这里');
  answerEl.classList.toggle('error', error);
}

async function ask(question) {
  const cleaned = (question || '').trim();
  if (!cleaned) {
    statusEl.textContent = '请先输入一个问题';
    setAnswer('你的答案会出现在这里');
    return;
  }

  setLoading(true);
  statusEl.textContent = '宇宙正在检索合适的回声';
  setAnswer('正在生成中…');

  try {
    const response = await fetch('/api/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: cleaned })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || '请求失败');
    }

    statusEl.textContent = '已收到回声';
    setAnswer(data.answer || '“向群星提问的人，终将听见回声。”——《未知档案》');
  } catch (error) {
    console.error(error);
    statusEl.textContent = '连接失败';
    setAnswer('暂时无法接通宇宙，请稍后再试。', { error: true });
  } finally {
    setLoading(false);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  await ask(questionInput.value);
});

randomBtn.addEventListener('click', () => {
  const pick = samples[Math.floor(Math.random() * samples.length)];
  questionInput.value = pick;
  questionInput.focus();
});

tipButtons.forEach((button) => {
  button.addEventListener('click', () => {
    questionInput.value = button.textContent.trim();
    questionInput.focus();
  });
});
