// ==UserScript==
// @name         pbh论坛自动刷新
// @namespace    https://github.com/ziyii01/Script-by-ziyii
// @version      2026.02.23
// @description  pbh论坛自动刷新
// @author       ziyii
// @match        *://bbs.pbh-btn.com/*
// @icon         https://bbs.pbh-btn.com/assets/favicon-u4szmw9m.png
// @grant        none
// @updateURL    https://raw.githubusercontent.com/ziyii01/Script-by-ziyii/main/04/main.user.js
// @downloadURL  https://raw.githubusercontent.com/ziyii01/Script-by-ziyii/main/04/main.user.js
// @license      GNU AFFERO GENERAL PUBLIC LICENSE
// ==/UserScript==

(function () {
  ("use strict");

  let refreshTimer = null;
  const refreshInterval = 30 * 1000; // 30秒

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
    refreshTimer = setInterval(clickRefreshButton, refreshInterval);
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
