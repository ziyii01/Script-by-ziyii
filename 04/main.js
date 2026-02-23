// ==UserScript==
// @name         pbh论坛自动刷新
// @namespace    https://github.com/ziyii01/Script-by-ziyii
// @version      2026.02.23
// @description  pbh论坛自动刷新
// @author       ziyii
// @match        *://bbs.pbh-btn.com/
// @icon         https://bbs.pbh-btn.com/assets/favicon-u4szmw9m.png
// @grant        none
// @updateURL    https://raw.githubusercontent.com/ziyii01/Script-by-ziyii/main/04/main.user.js
// @downloadURL  https://raw.githubusercontent.com/ziyii01/Script-by-ziyii/main/04/main.user.js
// @license      GNU AFFERO GENERAL PUBLIC LICENSE
// ==/UserScript==

(function () {
  "use strict";

  // 设置刷新间隔（单位：毫秒）
  const refreshInterval = 30000; // 30秒

  // 查找刷新按钮（通过 aria-label 或 class）
  function findRefreshButton() {
    return (
      document.querySelector('button[aria-label="刷新"]') ||
      document.querySelector(".Button.Button--icon.hasIcon")
    );
  }

  // 点击刷新按钮
  function clickRefreshButton() {
    const button = findRefreshButton();
    if (button) {
      console.log("正在点击刷新按钮...");
      button.click(); // 触发点击事件
    } else {
      console.warn("未找到刷新按钮");
    }
  }

  // 初始检查并开始定时刷新
  function startAutoRefresh() {
    // 设置定时器
    setInterval(clickRefreshButton, refreshInterval);
  }

  // 页面加载完成后执行
  window.addEventListener("load", startAutoRefresh);
})();
