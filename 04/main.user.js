// ==UserScript==
// @name         pbh论坛自动刷新
// @namespace    https://github.com/ziyii01/Script-by-ziyii
// @version      2026.02.26
// @description  pbh论坛自动刷新
// @author       ziyii
// @match        *://bbs.pbh-btn.com/*
// @icon         https://bbs.pbh-btn.com/assets/favicon-u4szmw9m.png
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @updateURL    https://raw.githubusercontent.com/ziyii01/Script-by-ziyii/main/04/main.user.js
// @downloadURL  https://raw.githubusercontent.com/ziyii01/Script-by-ziyii/main/04/main.user.js
// @license      GNU AFFERO GENERAL PUBLIC LICENSE
// ==/UserScript==

(function () {
  ("use strict");

  let refreshTimer = null;
  const DEFAULT_INTERVAL = 60; // 默认60秒

  /**
   * 从脚本存储中读取用户自定义的刷新间隔（单位：秒）。
   *
   * 如果未设置或存储的值无效（如非数字、小于等于0），则返回默认刷新间隔。
   *
   * @returns {number} 有效的刷新间隔（秒），始终为大于0的数字。
   * @see {@link DEFAULT_INTERVAL}
   * @see {@link GM_getValue}
   */
  function getRefreshIntervalSec() {
    const saved = GM_getValue("refreshInterval", DEFAULT_INTERVAL);
    const num = Number(saved);
    return isNaN(num) || num <= 0 ? DEFAULT_INTERVAL : num;
  }

  /**
   * 将用户指定的刷新间隔（单位：秒）保存到脚本存储中。
   *
   * 仅当输入值为大于0的数字时才会执行保存操作，以确保数据有效性。
   *
   * @param {number} seconds - 要保存的刷新间隔（秒），必须为正数。
   * @see {@link GM_setValue}
   */
  function setRefreshIntervalSec(seconds) {
    if (typeof seconds === "number" && seconds > 0) {
      GM_setValue("refreshInterval", seconds);
    }
  }

  /**
   * 打开用户设置对话框，允许用户自定义自动刷新的时间间隔。
   *
   * 该函数会弹出一个 prompt 输入框，显示当前刷新间隔作为默认值。
   *
   * 用户输入后，函数会校验输入是否为大于0的数字：
   * - 若输入无效（非数字、≤0 或取消），则提示错误或直接退出；
   * - 若输入有效，则保存新值并通过 alert 提示用户需刷新页面生效。
   *
   * @note 修改设置后需手动刷新页面，新间隔才会在下次自动刷新中生效。
   */
  function openSettings() {
    const current = getRefreshIntervalSec();
    const input = prompt(
      "[PBH 自动刷新] 请输入刷新间隔（单位：秒，建议 ≥5）：",
      String(current),
    );
    if (input === null) return; // 用户点击取消

    const seconds = Number(input.trim());
    if (isNaN(seconds) || seconds <= 0) {
      alert("[错误] 请输入一个大于0的数字！");
      return;
    }

    setRefreshIntervalSec(seconds);
    alert(`✅ 刷新间隔已更新为 ${seconds} 秒。\n请刷新页面以应用新设置。`);
  }

  // 注册 Tampermonkey 菜单项
  GM_registerMenuCommand("⚙️ 设置刷新间隔", openSettings);

  /**
   * 查找页面中的“刷新”按钮元素。
   *
   * 优先查找具有 aria-label="刷新" 的 <button> 元素；
   *
   * 如果未找到，则退而查找具有特定类名组合的按钮（如 .Button.Button--icon.hasIcon）。
   *
   * @returns {HTMLElement | null} 返回匹配的按钮 DOM 元素，若未找到则返回 null。
   */
  function findRefreshButton() {
    return (
      document.querySelector('button[aria-label="刷新"]') ||
      document.querySelector(".Button.Button--icon.hasIcon")
    );
  }

  /**
   * 尝试点击页面上的“刷新”按钮。
   *
   * 该函数会调用 findRefreshButton() 查找刷新按钮，
   *
   * 如果找到则触发点击事件，并在控制台输出日志；
   *
   * 如果未找到，则输出警告信息。
   *
   * @see {@link findRefreshButton} - 用于查找刷新按钮的辅助函数。
   */
  function clickRefreshButton() {
    const button = findRefreshButton();
    if (button) {
      console.log("[PBH Auto Refresh] 点击刷新按钮...");
      button.click();
    } else {
      console.warn("[PBH Auto Refresh] 未找到刷新按钮");
    }
  }

  /**
   * 判断当前页面是否为 Flarum 论坛的首页。
   *
   * Flarum 的首页路径通常为 "/"，某些情况下（如通过 history.pushState）可能为空字符串 ""。
   *
   * @returns {boolean} 如果当前路径是 "/" 或 ""，返回 true；否则返回 false。
   */
  function isHomePage() {
    // Flarum 首页路径为 "/"
    return window.location.pathname === "/" || window.location.pathname === "";
  }

  /**
   * 启动首页自动刷新功能。
   *
   * 仅在当前页面为 Flarum 首页且尚未启动定时器时激活。
   *
   * 启动后，会按设定的时间间隔（refreshInterval）自动点击刷新按钮。
   *
   * @note 该函数依赖全局变量 refreshTimer（定时器引用）和 refreshInterval（刷新间隔，单位：毫秒）。
   * @see {@link isHomePage}
   * @see {@link clickRefreshButton}
   */
  function startAutoRefresh() {
    if (refreshTimer) return; // 避免重复启动
    if (!isHomePage()) return;

    console.log("[PBH Auto Refresh] 在首页，启动自动刷新");
    refreshTimer = setInterval(
      clickRefreshButton,
      getRefreshIntervalSec() * 1000,
    );
  }

  /**
   * 停止自动刷新功能。
   *
   * 如果存在正在运行的刷新定时器（refreshTimer），则清除该定时器并重置为 null，
   *
   * 同时在控制台输出停止日志。
   *
   * @note 该函数依赖全局变量 refreshTimer（由 setInterval 返回的定时器引用）。
   * @see {@link startAutoRefresh}
   */
  function stopAutoRefresh() {
    if (refreshTimer) {
      console.log("[PBH Auto Refresh] 停止自动刷新");
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  }

  /**
   * 根据当前页面是否为首页，自动启用或禁用自动刷新功能。
   * - 如果在首页（isHomePage 返回 true），则启动自动刷新；
   * - 否则，停止正在运行的自动刷新。
   *
   * 此函数通常用于监听页面路由变化（如通过 history 或 SPA 导航），
   * 以确保仅在首页执行自动刷新逻辑。
   *
   * @see {@link isHomePage}
   * @see {@link startAutoRefresh}
   * @see {@link stopAutoRefresh}
   */
  function checkAndToggleRefresh() {
    if (isHomePage()) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
  }

  // 初始检查
  checkAndToggleRefresh();

  // 监听 SPA 路由变化（Flarum 使用 history.pushState）
  const originalPushState = history.pushState;
  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    setTimeout(checkAndToggleRefresh, 50); // 稍微延迟确保 DOM 更新
  };

  // 监听浏览器前进/后退
  window.addEventListener("popstate", () => {
    setTimeout(checkAndToggleRefresh, 50);
  });

  // 可选：监听 Flarum 的 app 初始化（更健壮）
  // 如果 Flarum 已加载，直接检查；否则等它加载
  if (typeof app !== "undefined" && app?.history) {
    // Flarum 可能提供更精确的路由事件，但 pushState 监听已足够
  }
})();
