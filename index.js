/**
 * 本文件是在构建 Wordle 程序过程中需要使用的脚本
 * ! 在编写代码之前请您务必仔细阅读每一行注释并不要删除或修改注释
 * 其中部分函数已经给出，需要您根据实际需求进行补全
 * 函数的具体作用请参考注释
 * 请确保所有的 TODO 都被补全
 * 若无特殊需要请尽量不要定义新的函数
 */

/**
 * Global Variables
 *
 * 您的所有全局变量需要在此处定义
 * 我们已经预先为您定义了一部分全局变量
 *
 */

// 固定的答案长度
const answerLength = 5;
// 最多尝试次数
const maxGuessTime = 6;

// Wordle 中出现的三种颜色，更推荐使用枚举
// 此处 green 用字母 b 表示，具体原因请参见代码任务
const grey = "g";
const yellow = "y";
const green = "b";

// 颜色序列，类型为 string[]
let colorSequence = [];
// 单词序列，类型为 string[]
let wordSequence = [];

// 本次 Wordle 的答案
let answer = "";
// 当前猜测的答案
let guess = "";
// 当前已经使用的猜测次数
let currentGuessTime = 0;
// 当前游标位置（1~30）
let index = 1;

// 单词库，类型为 string[]，方便获取答案
let wordBank = [];
let wordSet = new Set();         //去重

/**
 * 程序当前的状态，更推荐使用枚举
 *
 * 预计会使用到的状态：
 * 1. "UNFINISHED": 表示 Wordle 未被解决即仍有剩余猜测次数
 * 2. "SOLVED": 表示当前 Wordle 已被解决
 * 3. "FAILED": 表示当前 Wordle 解决失败
 * 可以根据需要设计新的状态
 */
let state = "UNFINISHED";

/**
 * 预定义的 JavaScript 程序的入口
 * 请不要额外定义其他的程序入口
 */
start();

/**
 * start()
 *
 * 整个程序的入口函数，这里为了简化程序的运行逻辑违背了单一指责原则和最小权限原则，在实际开发时不推荐这样处理
 *
 * 您需要完成的任务：
 * 1. 初始化程序的运行状态
 * 2. 接收交互信息后改变内部状态并作出反馈
 *
 * 请思考：
 * 1. 在怎样的时刻需要调用 initialize 函数
 * // 首次页面加载的时候或者是重新开始的时候
 * 
 * 2. 程序的交互信息是什么（猜测的单词？）
 * // 就是键盘按下的每一次，说白了就是guess
 * 
 * 3. 内部状态会如何根据交互信息而改变（state 变量的作用？）
 * // state 反映了当前游戏的状态，交互信息会导致 guess 的改变，guess 的改变会导致 handleAnswer 的调用，handleAnswer 会根据 guess 的正确与否改变 state 的值
 * 
 * 4. 程序内部状态变化之后会作出怎样的反馈（页面重新渲染？）
 * // 重新渲染，文字提示颜色，虚拟键盘的按键颜色,还有成功和失败提示
 * 
 * 5. 如何读取交互信息
 * // 监听物理键盘事件-keydown，和虚拟键盘事件-click
 * 
 * 6. 程序在什么时候会终止
 * // 猜对了或者用完了所有机会或选择显示答案
 */
async function start() {
  await initialize();                      //异步await等待初始化
  render();
  const restartBtn = document.getElementById("restart-btn");
  if (restartBtn) {
    restartBtn.addEventListener("click", async () => {
       await initialize();
       render();
    });
  }
  const answerBtn = document.getElementById("answer-btn");
  if (answerBtn) {
    answerBtn.addEventListener("click", async () => {
       state = 'FAILED';
       showMessage(`答案是 ${answer.toLowerCase()},请重新开始!`);
    });
  }
//物理键盘
  window.addEventListener("keydown", (e) => {
    if (state !== "UNFINISHED") return;

    const key = e.key;

    if (key === "Enter") {
      e.preventDefault();
      if (guess.length !== answerLength) {
        showMessage(`请输入 ${answerLength} 个字母再提交`);
        return;
      }
      handleAnswer(guess);
      return;
    }

    if (key === "Backspace") {
      e.preventDefault();
      if (guess.length > 0) {
        guess = guess.slice(0, -1);
        render();
      }
      return;
    }

    // 输入字母
    if (/^[a-zA-Z]$/.test(key)) {                //实时输入
      if (guess.length < answerLength) {
        guess += key.toLowerCase();
        render();
      }
    }
  });
  //虚拟键盘
  const keys = document.querySelectorAll('.key');
  keys.forEach(key =>{
    key.addEventListener('click',()=>{
      const keyID = key.id;
      if (state !== "UNFINISHED") return;
      if (keyID === "enter") {
      if (guess.length !== answerLength) {
        showMessage(`请输入 ${answerLength} 个字母再提交`);
        return;
      }
      handleAnswer(guess);
      return;
    }

    if (keyID === "backspace") {
      if (guess.length > 0) {
        guess = guess.slice(0, -1);
        render();
      }
      return;
    }

    // 输入字母
    if (/^[a-zA-Z]$/.test(keyID)) {
      if (guess.length < answerLength) {
        guess += keyID;
        render();
      }
    }
    })
  })
}

/**
 * render()
 *
 * 根据程序当前的状态渲染对应的用户页面
 *
 * 您需要完成的任务：
 * 1. 基于 DOM 实现程序状态和 HTML 组件的绑定  
 * 2. 当程序内部状态发生改变时需要重新渲染页面
 *
 * 请思考：
 * 1. 什么是 DOM，这项技术有怎样的作用
 * // DOM 是 Document Object Model 的缩写，是浏览器提供的 API，用于操作 HTML 页面的结构和内容。
 * 
 * 2. 如何实现程序内部状态和 HTML 组件的绑定，为什么要这么设计
 * // 通过 DOM API 操作 HTML 元素的属性、内容和样式，将程序状态映射到页面上，实现状态与界面的同步。
 * 
 * 3. 应该在怎样的时刻调用 render 函数
 * // 在程序状态发生改变时调用 render 函数，初始化、输入字母、提交答案等操作后。
 */
function render() {
  // 遍历清空所有格子
  for (let i = 1; i <= 30; i++) {
    const cell = document.getElementById(`cell-${i}`);
    if (!cell) continue;       //避免报错
    cell.textContent = "";
    cell.dataset.color = "";
  }
  
  //初始化虚拟键盘，颜色
   const keys = document.querySelectorAll('.key');
   keys.forEach(key =>{
    key.dataset.color = '';
   });

  // 渲染已提交的历史行（wordSequence + colorSequence）
  for (let row = 0; row < wordSequence.length; row++) {
    const w = wordSequence[row];
    const c = colorSequence[row]; // "bgy"

    for (let col = 0; col < answerLength; col++) { 
      const cellIndex = row * answerLength + col + 1; // 1..30
      const cell = document.getElementById(`cell-${cellIndex}`);
      if (!cell) continue;

      cell.textContent = w[col].toLowerCase();                 //渲染输入框
      cell.dataset.color = c[col]; // 'b'/'y'/'g'
    }
    for (let col = 0; col < answerLength; col++) {            //渲染虚拟键盘
      const key = document.getElementById(`${w[col].toLowerCase()}`);      
      if (!key) continue;
      key.dataset.color = c[col];// 'b'/'y'/'g'
    }
  }

  // 渲染当前正在输入的一行（guess）
  const currentRowStart = currentGuessTime * answerLength + 1; // 1,6,11,16,21,26
  for (let col = 0; col < guess.length; col++) {
    const cellIndex = currentRowStart + col;
    const cell = document.getElementById(`cell-${cellIndex}`);
    if (!cell) continue;
    cell.textContent = guess[col].toLowerCase();
  }

  // 渲染消息/状态
  if (state === "UNFINISHED") {
    const msgEl = document.getElementById("message");
    if (msgEl) msgEl.textContent = `第 ${currentGuessTime + 1} 次猜测，输入字母后回车提交`;
  } else if (state === "SOLVED") {
    showMessage(`恭喜你，在第${currentGuessTime}次答对啦！`);
  } else if (state === "FAILED") {
    showMessage(`你失败了，答案是 ${answer.toLowerCase()}!`);
  }
}

/**
 * initialize()
 *
 * 初始化程序的状态
 *
 * 请思考：
 * 1. 有哪些状态或变量需要被初始化
 * // colorSequence, wordSequence, answer, guess, currentGuessTime, index, state，还有词库 wordBank，界面展示的信息
 * 
 * 2. 初始化时 state 变量处于怎样的状态
 * // UNFINISHED
 */
async function initialize() {
  // 重置运行状态
  colorSequence = [];     //颜色判断
  wordSequence = [];      //猜测
  answer = "";            //答案
  guess = "";             //猜测
  currentGuessTime = 0;   //次数
  index = 1;              //光标位置
  state = "UNFINISHED";   //状态
  wordBank = [];          //词库    
  wordSet = new Set();
  

  // 读取题库，并重新随机生成答案
  answer = await generateRandomAnswer();

  // 初始化界面
  showMessage("游戏开始！请输入 5 个字母后回车提交");
}

/**
 * generateRandomAnswer()
 *
 * 从题库中随机选取一个单词作为答案
 *
 * 题库文件为 words.json
 *
 * 请思考：
 * 1. 如何读取 json 文件
 * // fetch("./words.json").then(res => res.json()) 
 * 
 * 2. 如何随机抽取一个单词
 * // 先获取词库数组，然后 Math.random() * length 获取随机索引
 * @return {string} answer
 */
async function generateRandomAnswer() {
  try {
    const res = await fetch("./words.json");
    const data = await res.json();

    const words = data.words;

    if (!Array.isArray(words) || words.length === 0) {
      throw new Error("words.json 为空");
    }

    wordBank = words
      .map((w) => String(w).trim().toLowerCase())
      .filter((w) => w.length === answerLength && /^[a-z]+$/.test(w));

    if (wordBank.length === 0) {
      throw new Error("词库不合规");
    }

    wordSet = new Set(wordBank);

    const randomIndex = Math.floor(Math.random() * wordBank.length);
    return wordBank[randomIndex];
  } catch (err) {
    showMessage("words.json 格式不对");
    wordBank = ["apple"];
    wordSet = new Set(wordBank);
    return "apple";
  }  
}

/**
 * isValidWord()
 *
 * 判断一个单词是否合法
 *
 * 请思考：
 * 1. 判断一个单词是否合法的规则有哪些
 * // 五个字母，纯字母
 * 
 * 2. 是否存在多条判断规则
 * // yes
 * 
 * 3. 如果上条成立，那么这些规则执行的先后顺序是怎样的，不同的执行顺序是否会对单词的合法性判断造成影响
 * // 先判断基本的字符串和长度，再判断字符合法性，最后判断词库。这样可以减少不必要的词库查找，提高效率
 * 
 * 4. 如果单词不合法，那么程序的状态会如何变化，程序应当作出怎样的反馈
 * // state 不变，反馈“单词不合法”提示信息
 *
 * @param {string} word
 * @return {boolean} isValid
 */
function isValidWord(word) {
  if (typeof word !== "string") return false;

  const w = word.trim().toLowerCase();

  if (w.length !== answerLength) return false; 

  if (!/^[a-z]+$/.test(w)) return false;

  return true;
}

/**
 * handleAnswer()
 *
 * 处理一次对单词的猜测，并根据其猜测结果更新程序内部状态
 *
 * 请思考：
 * 1. 是否需要对 guess 变量的字符串作某种预处理，为什么
 * // 需要，统一变成和词库处理相同的形式，这样方便对比
 *
 * @param {string} guess
 */
function handleAnswer(guessInput) {
  // 去空格，统一小写
  const g = String(guessInput).trim().toLowerCase();

  if (!isValidWord(g)) {
    showMessage("单词不合法，请重新开始");
    return;
  }

  // 计算颜色序列
  const cs = calculateColorSequence(g, answer);

  // 记录历史
  wordSequence.push(g);
  colorSequence.push(cs);

  // 更新次数与输入状态
  currentGuessTime += 1;
  guess = "";
  index = currentGuessTime * answerLength + 1; // 下一行起始格

  // 更新 state
  if (cs === green.repeat(answerLength)) {
    state = "SOLVED";
  } else if (currentGuessTime >= maxGuessTime) {
    state = "FAILED";
  } else {
    state = "UNFINISHED";
  }

  // 重新渲染页面
  render();
}

/**
 * calculateColorSequence()
 *
 * 计算两个单词的颜色匹配序列
 *
 * 例如：
 * 给定 answer = "apple", guess = "angel"
 *
 * 那么返回结果为："bggyy"
 *
 * 请思考：
 * 1. Wordle 的颜色匹配算法是如何实现的
 * // 先判断位置正确的字母（绿），再处理剩余字母的存在与否（黄/灰），需要注意重复字母的情况
 * 
 * 2. 有哪些特殊的匹配情况
 * // 重复字母，例如 answer 中有两个 'p'，guess 中有一个 'p'，如果位置正确则绿，否则只能有一个黄，另一个灰
 *
 * @param {string} guess
 * @param {string} answer
 * @return {string} colorSequence
 */
function calculateColorSequence(guess, answer) {
  const g = guess.toLowerCase();
  const a = answer.toLowerCase();

  // 结果先全部灰
  const result = new Array(answerLength).fill(grey);

  // 统计答案中字母剩余数量（黄色），解决重复问题
  const remain = {};

  // 绿（位置正确），先判断最特殊的
  for (let i = 0; i < answerLength; i++) {
    if (g[i] === a[i]) {
      result[i] = green;        //判断黄/灰时直接跳过
    } else {
      // 统计未被绿色占用的答案字母
      remain[a[i]] = (remain[a[i]] || 0) + 1;
    }
  }

  // 对非绿位置判断黄/灰
  for (let i = 0; i < answerLength; i++) {
    if (result[i] === green) continue;

    const ch = g[i];
    if (remain[ch] > 0) {      //通过配额判断有无，没有或已达到配额都是灰色
      result[i] = yellow;
      remain[ch] -= 1; // 消耗一个该字母配额
    } else {
      result[i] = grey;
    }
  }

  return result.join("");
}

//提示函数
function showMessage(text) {
  const msgEl = document.getElementById("message");
  if (msgEl) msgEl.textContent = text;
}
