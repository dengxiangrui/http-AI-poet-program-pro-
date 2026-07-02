const config = {
  API_KEY: 'sk-ws-H.RXLHMHD.Cmvt.MEUCIA46MMNfScAs-1dks02f6BmSjxbZ-3IU5j0ostiA1mC-AiEAtZmf0gt3ml9QQtx2VtcqLmsmYt_uJoKZ0NInxkFa4ig',
  API_URL: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
  MODEL: 'qwen-plus'
};

async function requestApi(prompt) {
  const response = await fetch(config.API_URL, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + config.API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.MODEL,
      input: {
        prompt: prompt
      },
      parameters: {
        result_format: 'text',
        max_tokens: 3000
      }
    })
  });

  const data = await response.json();

  if (data.output && data.output.text) {
    return data.output.text;
  } else {
    throw new Error(data.message || 'API调用失败');
  }
}

async function generatePoem(options) {
  const { theme, type, isAcrostic, style, emotion } = options;

  let prompt = '你是一位专业的古诗词AI助手。\n请根据以下要求创作一首' + type + '：\n主题：' + theme + '\n';
  if (isAcrostic) prompt += '形式：藏头诗（每句首字连读为"' + theme + '"）\n';
  if (style) prompt += '风格：模仿' + style + '\n';
  if (emotion) prompt += '情感：' + emotion + '\n';
  prompt += '输出格式要求：\n标题：[标题]\n内容：[诗句，用中文逗号隔开]\n\n请严格遵守格式，不要输出任何解释性文字。';

  const result = await requestApi(prompt);

  const titleMatch = result.match(/标题：(.+)/);
  const contentMatch = result.match(/内容：(.+)/);

  return {
    title: titleMatch ? titleMatch[1].trim() : theme,
    content: contentMatch ? contentMatch[1].split('，').map(s => s.trim()).filter(s => s) : ['暂无内容'],
    theme: theme,
    type: type,
    style: style,
    emotion: emotion
  };
}

async function analyzePoem(poem) {
  const poemText = poem.title + '\n' + poem.content.join('\n');
  const prompt = '请对以下诗词进行专业鉴赏，分析其意境、手法和情感，字数控制在500字以内：\n\n' + poemText;

  return await requestApi(prompt);
}

async function polishPoem(poem, suggestion) {
  const poemText = poem.content.join('，');
  const prompt = '请对以下诗词进行润色：\n原诗：' + poemText + '\n要求：' + suggestion + '\n请只返回润色后的诗句，格式为：诗句1，诗句2...';

  const result = await requestApi(prompt);

  return {
    ...poem,
    content: result.split('，').map(s => s.trim()).filter(s => s)
  };
}

window.api = {
  generatePoem,
  analyzePoem,
  polishPoem
};