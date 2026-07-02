var appData = {
  inputText: '',
  isAcrostic: false,
  selectedType: '绝句',
  selectedStyle: '',
  selectedEmotion: '',
  isGenerating: false,
  poemData: null,
  historyList: [],
  hotTags: ['#孤独', '#中秋', '#思乡', '#表白', '#离别', '#山水', '#明月', '#春日'],
  poemTypes: ['绝句', '律诗', '词', '古风'],
  styles: ['李白', '杜甫', '李清照', '苏轼', '王维', '陶渊明'],
  emotions: ['悲伤', '喜悦', '闲适', '豪迈', '思念', '哲理'],
  quickPolishOptions: ['换个写法', '更优美一些', '更有气势', '更含蓄', '第三句改一下'],
  polishInput: '',
  analysis: ''
};

function init() {
  loadHistory();
  renderHotTags();
  renderOptions();
  renderQuickPolish();
  bindEvents();
}

function loadHistory() {
  try {
    var history = localStorage.getItem('poem_history');
    if (history) {
      appData.historyList = JSON.parse(history);
      renderHistory();
    }
  } catch (error) {
    console.error('加载历史失败:', error);
  }
}

function saveToHistory(poem) {
  try {
    appData.historyList.unshift(poem);
    if (appData.historyList.length > 20) {
      appData.historyList = appData.historyList.slice(0, 20);
    }
    localStorage.setItem('poem_history', JSON.stringify(appData.historyList));
    renderHistory();
  } catch (error) {
    console.error('保存历史失败:', error);
  }
}

function renderHotTags() {
  var container = document.getElementById('hotTags');
  if (!container) return;
  
  container.innerHTML = '';
  appData.hotTags.forEach(function(tag) {
    var span = document.createElement('span');
    span.className = 'hot-tag';
    span.textContent = tag;
    span.addEventListener('click', function() {
      appData.inputText = tag.replace('#', '');
      var inputEl = document.getElementById('inputText');
      if (inputEl) inputEl.value = appData.inputText;
      updateCreateBtn();
    });
    container.appendChild(span);
  });
}

function renderOptions() {
  renderOptionList('typeList', appData.poemTypes, 'selectedType', appData.selectedType, function(value) {
    appData.selectedType = value;
  });
  renderOptionList('styleList', appData.styles, 'selectedStyle', appData.selectedStyle, function(value) {
    appData.selectedStyle = appData.selectedStyle === value ? '' : value;
  });
  renderOptionList('emotionList', appData.emotions, 'selectedEmotion', appData.selectedEmotion, function(value) {
    appData.selectedEmotion = appData.selectedEmotion === value ? '' : value;
  });
}

function renderOptionList(containerId, options, dataKey, currentValue, onClick) {
  var container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '';
  options.forEach(function(option) {
    var span = document.createElement('span');
    span.className = 'option-item' + (currentValue === option ? ' active' : '');
    span.textContent = option;
    span.addEventListener('click', function() {
      onClick(option);
      renderOptions();
    });
    container.appendChild(span);
  });
}

function renderQuickPolish() {
  var container = document.getElementById('quickPolish');
  if (!container) return;
  
  container.innerHTML = '';
  appData.quickPolishOptions.forEach(function(option) {
    var span = document.createElement('span');
    span.className = 'quick-polish-item';
    span.textContent = option;
    span.addEventListener('click', function() {
      appData.polishInput = option;
      var inputEl = document.getElementById('polishInput');
      if (inputEl) inputEl.value = option;
      doPolish();
    });
    container.appendChild(span);
  });
}

function renderResult(poem) {
  var titleEl = document.getElementById('poemTitle');
  var typeEl = document.getElementById('poemType');
  var styleEl = document.getElementById('poemStyle');
  var styleDot = document.getElementById('poemStyleDot');
  var contentEl = document.getElementById('poemContent');
  var tagsEl = document.getElementById('poemTags');
  var analysisEl = document.getElementById('analysis');
  var analysisCard = document.getElementById('analysisCard');
  var resultSection = document.getElementById('resultSection');
  
  if (!titleEl || !typeEl || !contentEl || !tagsEl || !resultSection) return;
  
  titleEl.textContent = poem.title;
  typeEl.textContent = poem.type;
  
  if (poem.style && styleEl && styleDot) {
    styleEl.textContent = poem.style;
    styleEl.style.display = 'inline';
    styleDot.style.display = 'inline';
  } else if (styleEl && styleDot) {
    styleEl.style.display = 'none';
    styleDot.style.display = 'none';
  }
  
  contentEl.innerHTML = '';
  poem.content.forEach(function(line) {
    var span = document.createElement('span');
    span.className = 'poem-line';
    span.textContent = line;
    contentEl.appendChild(span);
  });
  
  tagsEl.innerHTML = '';
  var themeTag = document.createElement('span');
  themeTag.className = 'tag';
  themeTag.textContent = '#' + poem.theme;
  tagsEl.appendChild(themeTag);
  
  if (poem.emotion) {
    var emotionTag = document.createElement('span');
    emotionTag.className = 'tag';
    emotionTag.textContent = '#' + poem.emotion;
    tagsEl.appendChild(emotionTag);
  }
  
  if (analysisEl) analysisEl.textContent = '';
  if (analysisCard) analysisCard.style.display = 'none';
  
  resultSection.style.display = 'block';
}

function renderHistory() {
  var container = document.getElementById('historyList');
  var section = document.getElementById('historySection');
  
  if (!container || !section) return;
  
  if (appData.historyList.length === 0) {
    section.style.display = 'none';
    return;
  }
  
  section.style.display = 'block';
  container.innerHTML = '';
  
  appData.historyList.forEach(function(poem, index) {
    var div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = '<span class="history-title">' + poem.title + '</span><span class="history-theme">' + poem.theme + '</span>';
    div.addEventListener('click', function() {
      appData.poemData = poem;
      appData.inputText = poem.theme;
      appData.selectedType = poem.type;
      appData.selectedStyle = poem.style || '';
      appData.selectedEmotion = poem.emotion || '';
      
      var inputEl = document.getElementById('inputText');
      if (inputEl) inputEl.value = appData.inputText;
      
      var acrosticEl = document.getElementById('acrosticSwitch');
      if (acrosticEl) acrosticEl.checked = false;
      
      renderOptions();
      renderResult(poem);
    });
    container.appendChild(div);
  });
}

function bindEvents() {
  var inputText = document.getElementById('inputText');
  if (inputText) {
    inputText.addEventListener('input', function(e) {
      appData.inputText = e.target.value;
      updateCreateBtn();
    });
  }
  
  var createBtn = document.getElementById('createBtn');
  if (createBtn) {
    createBtn.addEventListener('click', doGenerate);
  }
  
  var acrosticSwitch = document.getElementById('acrosticSwitch');
  if (acrosticSwitch) {
    acrosticSwitch.addEventListener('change', function(e) {
      appData.isAcrostic = e.target.checked;
    });
  }
  
  var analyzeBtn = document.getElementById('analyzeBtn');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', doAnalyze);
  }
  
  var closeAnalysisBtn = document.getElementById('closeAnalysisBtn');
  if (closeAnalysisBtn) {
    closeAnalysisBtn.addEventListener('click', closeAnalysis);
  }
  
  var copyBtn = document.getElementById('copyBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', doCopy);
  }
  
  var polishInput = document.getElementById('polishInput');
  if (polishInput) {
    polishInput.addEventListener('input', function(e) {
      appData.polishInput = e.target.value;
    });
  }
  
  var polishBtn = document.getElementById('polishBtn');
  if (polishBtn) {
    polishBtn.addEventListener('click', doPolish);
  }
  
  var clearHistoryBtn = document.getElementById('clearHistoryBtn');
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', clearHistory);
  }
}

function updateCreateBtn() {
  var btn = document.getElementById('createBtn');
  if (!btn) return;
  btn.disabled = appData.isGenerating || !appData.inputText.trim();
}

function showToast(message, icon) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = 'toast show';
  
  setTimeout(function() {
    toast.className = 'toast';
  }, 2000);
}

function doGenerate() {
  var inputText = appData.inputText.trim();
  
  if (!inputText) {
    showToast('请输入主题');
    return;
  }

  appData.isGenerating = true;
  var createBtnText = document.getElementById('createBtnText');
  if (createBtnText) createBtnText.textContent = '创作中...';
  updateCreateBtn();

  var options = {
    theme: inputText,
    type: appData.selectedType,
    isAcrostic: appData.isAcrostic,
    style: appData.selectedStyle,
    emotion: appData.selectedEmotion
  };
  
  window.api.generatePoem(options)
    .then(function(poem) {
      appData.poemData = poem;
      appData.isGenerating = false;
      if (createBtnText) createBtnText.textContent = '开始创作';
      updateCreateBtn();
      
      renderResult(poem);
      saveToHistory(poem);
      showToast('创作完成');
    })
    .catch(function(error) {
      appData.isGenerating = false;
      if (createBtnText) createBtnText.textContent = '开始创作';
      updateCreateBtn();
      
      console.error('生成失败:', error);
      showToast(error.message || '创作失败');
    });
}

function doAnalyze() {
  var poemData = appData.poemData;
  var analysis = appData.analysis;
  
  if (!poemData) return;
  
  if (analysis) {
    closeAnalysis();
    return;
  }

  appData.isGenerating = true;
  var createBtnText = document.getElementById('createBtnText');
  if (createBtnText) createBtnText.textContent = '鉴赏中...';
  updateCreateBtn();

  window.api.analyzePoem(poemData)
    .then(function(result) {
      appData.analysis = result;
      appData.isGenerating = false;
      if (createBtnText) createBtnText.textContent = '开始创作';
      updateCreateBtn();
      
      var analysisContent = document.getElementById('analysisContent');
      var analysisCard = document.getElementById('analysisCard');
      if (analysisContent) analysisContent.textContent = result;
      if (analysisCard) analysisCard.style.display = 'block';
    })
    .catch(function(error) {
      appData.isGenerating = false;
      if (createBtnText) createBtnText.textContent = '开始创作';
      updateCreateBtn();
      
      console.error('鉴赏失败:', error);
      showToast('鉴赏失败');
    });
}

function closeAnalysis() {
  appData.analysis = '';
  var analysisCard = document.getElementById('analysisCard');
  if (analysisCard) analysisCard.style.display = 'none';
}

function doCopy() {
  var poemData = appData.poemData;
  
  if (!poemData) return;

  var poemText = poemData.title + '\n\n' + poemData.content.join('\n') + '\n\n—— AI创作';
  
  navigator.clipboard.writeText(poemText)
    .then(function() {
      showToast('已复制');
    })
    .catch(function() {
      showToast('复制失败');
    });
}

function doPolish() {
  var poemData = appData.poemData;
  var polishInput = appData.polishInput.trim();
  
  if (!poemData || !polishInput) {
    showToast('请输入修改建议');
    return;
  }

  appData.isGenerating = true;
  var createBtnText = document.getElementById('createBtnText');
  if (createBtnText) createBtnText.textContent = '修改中...';
  updateCreateBtn();

  window.api.polishPoem(poemData, polishInput)
    .then(function(updatedPoem) {
      appData.poemData = updatedPoem;
      appData.polishInput = '';
      appData.isGenerating = false;
      
      var polishInputEl = document.getElementById('polishInput');
      if (polishInputEl) polishInputEl.value = '';
      if (createBtnText) createBtnText.textContent = '开始创作';
      updateCreateBtn();
      
      renderResult(updatedPoem);
      showToast('修改完成');
    })
    .catch(function(error) {
      appData.isGenerating = false;
      if (createBtnText) createBtnText.textContent = '开始创作';
      updateCreateBtn();
      
      console.error('修改失败:', error);
      showToast('修改失败');
    });
}

function clearHistory() {
  if (confirm('确定清空历史记录吗？')) {
    appData.historyList = [];
    localStorage.removeItem('poem_history');
    renderHistory();
    showToast('已清空');
  }
}

document.addEventListener('DOMContentLoaded', init);