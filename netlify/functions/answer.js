function normalizeLine(value) {
  return String(value || '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripOuterQuotes(text) {
  return String(text || '').replace(/^[“"'《】]+|[”"'》】]+$/g, '').trim();
}

function formatAnswer(quote, source) {
  const safeQuote = stripOuterQuotes(normalizeLine(quote));
  const safeSource = stripOuterQuotes(normalizeLine(source));

  if (!safeQuote || !safeSource) {
    return null;
  }

  return `“${safeQuote}”——《${safeSource}》`;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: '缺少环境变量 DEEPSEEK_API_KEY' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const question = normalizeLine(body.question || '');

    if (!question) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ error: '问题不能为空' })
      };
    }

    const payload = {
      model,
      temperature: 0.8,
      max_tokens: 120,
      stream: false,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            '你是“科幻答案之书”。无论用户提什么问题，你都只能返回一个 JSON 对象，格式必须是 {"quote":"一句科幻名言或台词","source":"明确出处"}。要求：1）quote 必须只有一句；2）必须来自科幻小说、电影、电视剧、动画、游戏等科幻作品；3）source 必须是作品名，不要作者名，不要解释；4）不要输出任何 JSON 之外的内容；5）优先输出中文，若原句更适合保留原文，可保留原文。'
        },
        {
          role: 'user',
          content: `用户的问题是：${question}`
        }
      ]
    };

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          error: result?.error?.message || 'DeepSeek API 调用失败',
          detail: result?.error || null
        })
      };
    }

    const content = result?.choices?.[0]?.message?.content || '{}';

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      parsed = null;
    }

    let finalAnswer = parsed ? formatAnswer(parsed.quote, parsed.source) : null;

    if (!finalAnswer) {
      const plain = normalizeLine(content);
      const match = plain.match(/[“"]?(.+?)[”"]?\s*[—-]{1,2}\s*[《<]?(.+?)[》>]?$/);
      if (match) {
        finalAnswer = formatAnswer(match[1], match[2]);
      }
    }

    if (!finalAnswer) {
      finalAnswer = '“给岁月以文明，而不是给文明以岁月。”——《三体》';
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ answer: finalAnswer })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: error.message || '服务器内部错误' })
    };
  }
};
