// ==UserScript==
// @name         抖音优化、自动化
// @namespace    https://github.com/ziyii01/Script-by-ziyii
// @version      2026.04.30
// @description  抖音优化、自动化
// @author       ziyii
// @match        *://live.douyin.com/*
// @icon         https://p-pc-weboff.byteimg.com/tos-cn-i-9r5gewecjs/favicon.png
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_notification
// @grant        GM_registerMenuCommand
// @updateURL    https://raw.githubusercontent.com/ziyii01/Script-by-ziyii/main/05/main.user.js
// @downloadURL  https://raw.githubusercontent.com/ziyii01/Script-by-ziyii/main/05/main.user.js
// @license      GNU AFFERO GENERAL PUBLIC LICENSE
// ==/UserScript==

(function () {
  "use strict";

  // ======================
  // 配置常量
  // ======================

  const CONFIG_KEYS = {
    CLICK_X: "clickX", // 点赞按钮的X坐标
    CLICK_Y: "clickY", // 点赞按钮的Y坐标
    MAX_COUNT: "maxCount", // 最大点赞组数
    MIN_INTERVAL: "minInterval", // 点赞最小间隔（秒）
    MAX_INTERVAL: "maxInterval", // 点赞最大间隔（秒）
    AUTO_REPEAT: "autoRepeatHourly", // 是否每小时自动重复执行
    GIFT_BLOCKED: "isGiftBlocked", // 礼物屏蔽状态
    HEADER_HIDDEN: "isHeaderHidden", // 顶栏隐藏状态
  };

  const DEFAULT_CONFIG = {
    clickX: 0,
    clickY: 0,
    maxCount: 3000,
    minInterval: 0.3,
    maxInterval: 1,
    autoRepeatHourly: true,
    isGiftBlocked: false,
    isHeaderHidden: false,
  };

  const UI_CONSTANTS = {
    GIFT_CONTAINER_ID: "BottomLayout",
    HEADER_LAYOUT_ID: "HeaderLayout", // 顶栏元素ID
    PLAYER_LAYOUT_ID: "PlayerLayout", // 播放器布局元素ID
    TIP_DURATION: 3000, // 提示显示时长（毫秒）
    TIP_FADE_DURATION: 500, // 提示淡出时长（毫秒）
    HOURLY_INTERVAL: 3600000, // 1小时的毫秒数
    DOUBLE_CLICK_DELAY: 10, // 双击之间的延迟（毫秒）
    OBSERVER_INIT_DELAY: 1000, // 观察者初始化延迟（毫秒）
    ANTI_IDLE_INTERVAL: 3000, // 防闲置键盘模拟间隔（毫秒）
  };

  // ======================
  // 配置管理
  // ======================

  /**
   * 从存储中获取当前配置
   * @returns {Object} 当前配置对象
   */
  function getConfig() {
    return {
      clickX: GM_getValue(CONFIG_KEYS.CLICK_X, DEFAULT_CONFIG.clickX),
      clickY: GM_getValue(CONFIG_KEYS.CLICK_Y, DEFAULT_CONFIG.clickY),
      maxCount: GM_getValue(CONFIG_KEYS.MAX_COUNT, DEFAULT_CONFIG.maxCount),
      minInterval: GM_getValue(
        CONFIG_KEYS.MIN_INTERVAL,
        DEFAULT_CONFIG.minInterval,
      ),
      maxInterval: GM_getValue(
        CONFIG_KEYS.MAX_INTERVAL,
        DEFAULT_CONFIG.maxInterval,
      ),
      autoRepeatHourly: GM_getValue(
        CONFIG_KEYS.AUTO_REPEAT,
        DEFAULT_CONFIG.autoRepeatHourly,
      ),
      isGiftBlocked: GM_getValue(
        CONFIG_KEYS.GIFT_BLOCKED,
        DEFAULT_CONFIG.isGiftBlocked,
      ),
      isHeaderHidden: GM_getValue(
        CONFIG_KEYS.HEADER_HIDDEN,
        DEFAULT_CONFIG.isHeaderHidden,
      ),
    };
  }

  /**
   * 保存配置值到存储
   * @param {string} key - 配置键名
   * @param {*} value - 配置值
   */
  function setConfig(key, value) {
    GM_setValue(key, value);
  }

  // ======================
  // UI工具函数
  // ======================

  /**
   * 在页面顶部显示临时提示消息
   * @param {string} message - 要显示的消息
   */
  function showTemporaryTip(message) {
    const tipElement = document.createElement("div");
    tipElement.innerText = message;
    tipElement.style.cssText = `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 114, 255, 0.9);
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 2147483647;
      pointer-events: none;
    `;

    document.body.appendChild(tipElement);

    setTimeout(() => {
      tipElement.style.opacity = "0";
      tipElement.style.transition = "opacity 0.5s";
      setTimeout(() => tipElement.remove(), UI_CONSTANTS.TIP_FADE_DURATION);
    }, UI_CONSTANTS.TIP_DURATION);
  }

  // ======================
  // 礼物屏蔽功能
  // ======================

  /**
   * 应用礼物屏蔽状态到DOM
   */
  function applyGiftBlockState() {
    const { isGiftBlocked } = getConfig();
    const giftContainer = document.getElementById(
      UI_CONSTANTS.GIFT_CONTAINER_ID,
    );

    if (giftContainer) {
      giftContainer.style.display = isGiftBlocked ? "none" : "";
    }
  }

  /**
   * 切换礼物屏蔽状态的开启/关闭
   */
  function toggleGiftBlocking() {
    let { isGiftBlocked } = getConfig();
    const giftContainer = document.getElementById(
      UI_CONSTANTS.GIFT_CONTAINER_ID,
    );

    if (giftContainer) {
      isGiftBlocked = !isGiftBlocked;
      setConfig(CONFIG_KEYS.GIFT_BLOCKED, isGiftBlocked);
      giftContainer.style.display = isGiftBlocked ? "none" : "";

      GM_notification({
        text: isGiftBlocked ? "已屏蔽礼物" : "已取消屏蔽礼物",
        timeout: 5000,
      });
    }
  }

  /**
   * 设置MutationObserver监听DOM变化并应用礼物屏蔽
   */
  function setupGiftBlockObserver() {
    // 页面加载后应用初始状态
    setTimeout(applyGiftBlockState, UI_CONSTANTS.OBSERVER_INIT_DELAY);

    // 创建观察者监听DOM变化
    const observer = new MutationObserver(() => {
      applyGiftBlockState();
    });

    // 开始观察整个文档
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    console.log("[AutoLike] 礼物屏蔽监听器已启动");
  }

  // ======================
  // 顶栏隐藏功能
  // ======================

  /**
   * 应用顶栏隐藏状态到DOM
   */
  function applyHeaderHiddenState() {
    const { isHeaderHidden } = getConfig();
    const headerLayout = document.getElementById(UI_CONSTANTS.HEADER_LAYOUT_ID);
    const playerLayout = document.getElementById(UI_CONSTANTS.PLAYER_LAYOUT_ID);

    if (headerLayout) {
      headerLayout.style.display = isHeaderHidden ? "none" : "";
    }

    // 调整PlayerLayout下第一个div的padding-top
    if (playerLayout && playerLayout.firstElementChild) {
      playerLayout.firstElementChild.style.paddingTop = isHeaderHidden
        ? "0px"
        : "50px";
    }
  }

  /**
   * 切换顶栏隐藏状态的开启/关闭
   */
  function toggleHeaderHidden() {
    let { isHeaderHidden } = getConfig();
    const headerLayout = document.getElementById(UI_CONSTANTS.HEADER_LAYOUT_ID);
    const playerLayout = document.getElementById(UI_CONSTANTS.PLAYER_LAYOUT_ID);

    if (headerLayout) {
      isHeaderHidden = !isHeaderHidden;
      setConfig(CONFIG_KEYS.HEADER_HIDDEN, isHeaderHidden);
      headerLayout.style.display = isHeaderHidden ? "none" : "";

      // 调整PlayerLayout下第一个div的padding-top
      if (playerLayout && playerLayout.firstElementChild) {
        playerLayout.firstElementChild.style.paddingTop = isHeaderHidden
          ? "0px"
          : "50px";
      }

      GM_notification({
        text: isHeaderHidden ? "已隐藏顶栏" : "已显示顶栏",
        timeout: 5000,
      });
    }
  }

  /**
   * 设置MutationObserver监听DOM变化并应用顶栏隐藏
   */
  function setupHeaderHiddenObserver() {
    // 页面加载后应用初始状态
    setTimeout(applyHeaderHiddenState, UI_CONSTANTS.OBSERVER_INIT_DELAY);

    // 创建观察者监听DOM变化
    const observer = new MutationObserver(() => {
      applyHeaderHiddenState();
    });

    // 开始观察整个文档
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    console.log("[AutoLike] 顶栏隐藏监听器已启动");
  }

  // ======================
  // 防闲置功能
  // ======================

  /**
   * 模拟键盘活动以防止进入闲置/睡眠模式
   */
  let antiIdleTimer = null; // 存储防闲置定时器ID

  function preventIdleMode() {
    // 如果已有定时器在运行，先清除
    if (antiIdleTimer) {
      clearTimeout(antiIdleTimer);
      antiIdleTimer = null;
    }

    // 模拟鼠标移动（极微小幅度）
    function simulateMouseMove() {
      mousePos.x += randomOffset();
      mousePos.y += randomOffset();

      document.dispatchEvent(
        new MouseEvent("mousemove", {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: mousePos.x,
          clientY: mousePos.y,
        }),
      );

      console.log("模拟鼠标移动:", mousePos);
    }
    function simulateKeyboardActivity() {
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: " ",
          keyCode: 32,
          bubbles: true,
          cancelable: true,
        }),
      );

      console.log("模拟键盘活动");
    }
    function randomAction() {
      Math.random() > 0.5 ? simulateMouseMove() : simulateKeyboardActivity();
      // 安排下一次模拟
      antiIdleTimer = setTimeout(randomAction, UI_CONSTANTS.ANTI_IDLE_INTERVAL);
    }

    randomAction();
  }

  /**
   * 停止防闲置功能
   */
  function stopAntiIdleMode() {
    if (antiIdleTimer) {
      clearTimeout(antiIdleTimer);
      antiIdleTimer = null;
      console.log("[AutoLike] 防闲置功能已暂停");
    }
  }

  // ======================
  // 自动点赞核心逻辑
  // ======================

  /**
   * 在指定坐标模拟鼠标点击
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  function simulateClick(x, y) {
    try {
      // 添加1-5像素的随机偏移
      const randomX = x + Math.floor(Math.random() * 5) + 1;
      const randomY = y + Math.floor(Math.random() * 5) + 1;

      const targetElement = document.elementFromPoint(randomX, randomY);

      if (!targetElement) {
        console.warn("[AutoLike] 未在指定坐标找到目标元素，跳过本次点击");
        return;
      }

      // 创建并触发原生鼠标点击事件
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        clientX: randomX,
        clientY: randomY,
        button: 0, // 鼠标左键
      });

      targetElement.dispatchEvent(clickEvent);
    } catch (error) {
      console.error("[AutoLike] 点击模拟失败：", error);
    }
  }

  /**
   * 执行一组双击操作
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  function executeDoubleClickGroup(x, y) {
    simulateClick(x, y);
    setTimeout(() => {
      simulateClick(x, y);
    }, UI_CONSTANTS.DOUBLE_CLICK_DELAY);
  }

  /**
   * 在配置的范围内计算随机间隔
   * @param {number} minInterval - 最小间隔（秒）
   * @param {number} maxInterval - 最大间隔（秒）
   * @returns {number} 随机间隔（毫秒）
   */
  function calculateRandomInterval(minInterval, maxInterval) {
    return (
      Math.random() * (maxInterval - minInterval) * 1000 + minInterval * 1000
    );
  }

  /**
   * 启动带递归执行的自动双击循环
   */
  function startAutoDoubleClick() {
    // 开启点赞时，暂停防闲置功能
    stopAntiIdleMode();

    let clickGroupsCompleted = 0;
    const startTime = Date.now();
    const config = getConfig();

    const { clickX, clickY, minInterval, maxInterval, maxCount } = config;

    /**
     * 递归执行下一组双击
     */
    function executeNextClickGroup() {
      clickGroupsCompleted += 1;

      // 执行当前组的双击
      executeDoubleClickGroup(clickX, clickY);

      console.log(`[AutoLike] 已完成第 ${clickGroupsCompleted} 组双击`);

      // 检查是否达到最大组数
      if (clickGroupsCompleted <= maxCount) {
        // 计算下次执行的随机间隔
        const nextInterval = calculateRandomInterval(minInterval, maxInterval);

        // 安排下一组双击
        setTimeout(executeNextClickGroup, nextInterval);
      } else {
        // 点赞完成后，重新开启防闲置功能
        preventIdleMode();
        console.log("[AutoLike] 点赞完成，防闲置功能已恢复");
      }
    }

    // 启动第一组双击
    executeNextClickGroup();

    // 处理每小时自动重复逻辑
    const elapsedTime = Date.now() - startTime;

    if (elapsedTime < UI_CONSTANTS.HOURLY_INTERVAL) {
      // 如果小于一小时，在启动时间基础上安排下一次执行
      setTimeout(() => {
        startAutoDoubleClick();
      }, UI_CONSTANTS.HOURLY_INTERVAL - elapsedTime);
    } else {
      // 否则继续正常运行
      startAutoDoubleClick();
    }
  }

  // ======================
  // 坐标设置功能
  // ======================

  /**
   * 进入坐标捕获模式 - 用户点击以设置点赞按钮位置
   */
  function setupCoordinateCapture() {
    showTemporaryTip("请点击页面上的点赞按钮位置…");
    console.log("[AutoLike] 请在页面上点击你要设置的点赞位置");

    const handleCoordinateClick = (event) => {
      event.preventDefault();
      event.stopPropagation();

      const x = event.clientX;
      const y = event.clientY;

      GM_setValue(CONFIG_KEYS.CLICK_X, x);
      GM_setValue(CONFIG_KEYS.CLICK_Y, y);

      showTemporaryTip(`✅ 坐标已设为 (${x}, ${y})`);
      console.log(`[AutoLike] 坐标保存: X=${x}, Y=${y}`);

      // 捕获坐标后移除监听器
      document.removeEventListener("click", handleCoordinateClick, true);
    };

    document.addEventListener("click", handleCoordinateClick, true);
  }

  // ======================
  // 配置显示功能
  // ======================

  /**
   * 在警告对话框中显示当前配置信息
   */
  function showConfigInfo() {
    const config = getConfig();

    const configMessage = `
当前配置：
  坐标: (${config.clickX}, ${config.clickY})
  最大组数: ${config.maxCount}
  间隔: ${config.minInterval} ~ ${config.maxInterval} 秒
  每小时自动: ${config.autoRepeatHourly ? "✅ 是" : "❌ 否"}
  礼物屏蔽: ${config.isGiftBlocked ? "✅ 是" : "❌ 否"}
  顶栏隐藏: ${config.isHeaderHidden ? "✅ 是" : "❌ 否"}
    `.trim();

    alert(configMessage);
  }

  // ======================
  // 初始化
  // ======================

  // 初始化礼物屏蔽监听器
  setupGiftBlockObserver();

  // 初始化顶栏隐藏监听器
  setupHeaderHiddenObserver();

  // 初始化防闲置功能
  preventIdleMode();

  // 注册油猴菜单命令
  GM_registerMenuCommand("设置点赞位置", setupCoordinateCapture);
  GM_registerMenuCommand("开启循环点赞", startAutoDoubleClick);
  GM_registerMenuCommand("查看当前配置", showConfigInfo);
  GM_registerMenuCommand("切换礼物屏蔽", toggleGiftBlocking);
  GM_registerMenuCommand("切换顶栏隐藏", toggleHeaderHidden);
})();
