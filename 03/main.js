// ==UserScript==
// @name         Bilibili 视频播放自动网页全屏,暂停自动退出网页全屏
// @namespace    https://github.com/ziyii01/Script-by-ziyii
// @version      2026.01.19
// @description  Bilibili 视频播放时自动进入网页全屏，暂停时自动退出网页全屏。
// @author       ziyii
// @match        *://www.bilibili.com/video*
// @icon         https://bgm.tv/img/favicon.ico
// @grant        none
// @updateURL    https://raw.githubusercontent.com/ziyii01/Script-by-ziyii/main/03/main.js
// @downloadURL  https://raw.githubusercontent.com/ziyii01/Script-by-ziyii/main/03/main.js
// @license      GNU AFFERO GENERAL PUBLIC LICENSE
// ==/UserScript==

(function () {
  "use strict";

  // 监听播放器暂停状态变化，并控制网页全屏状态
  const observePauseState = () => {
    const playerContainer = document.querySelector(
      "#bilibili-player > div > div",
    );
    const mirrorDiv = document.querySelector("#mirror-vdcon > div:first-child");
    const webFullscreenBtn = document.querySelector(".bpx-player-ctrl-web");

    let wasPaused = playerContainer.classList.contains("bpx-state-paused");

    // 处理播放/暂停状态变化
    const handleStateChange = () => {
      const isNowPaused =
        playerContainer.classList.contains("bpx-state-paused");
      const isFullscreen = !mirrorDiv.classList.contains("scroll-sticky");

      if (isNowPaused !== wasPaused) {
        wasPaused = isNowPaused;

        if (isNowPaused) {
          // 暂停时：如果处于全屏状态，则退出全屏
          if (isFullscreen) {
            webFullscreenBtn.click();
          }
        } else {
          // 播放时：如果不处于全屏状态，则进入全屏
          if (!isFullscreen) {
            webFullscreenBtn.click();
          }
        }
      }
    };

    // 初始化时检查当前状态并执行相应操作
    const checkInitialFullscreen = () => {
      const isPaused = playerContainer.classList.contains("bpx-state-paused");
      const isFullscreen = !mirrorDiv.classList.contains("scroll-sticky");

      // 如果正在播放但未全屏，则进入全屏模式
      if (!isPaused && !isFullscreen) {
        webFullscreenBtn.click();
      }
    };

    // 使用 MutationObserver 监听播放器状态变化
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          handleStateChange();
        }
      }
    });

    observer.observe(playerContainer, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // 执行初始化检查
    checkInitialFullscreen();
  };

  // 等待所有关键元素加载完成后再启动功能
  const initObserver = () => {
    const playerReady = !!document.querySelector(
      "#bilibili-player > div > div",
    );
    const mirrorReady = !!document.querySelector(
      "#mirror-vdcon > div:first-child",
    );
    const buttonReady = !!document.querySelector(".bpx-player-ctrl-web");

    if (playerReady && mirrorReady && buttonReady) {
      observePauseState();
    } else {
      // 元素未就绪则延迟重试
      setTimeout(initObserver, 500);
    }
  };

  // 启动脚本 - 在 DOM 加载完成后开始等待元素
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initObserver);
  } else {
    initObserver();
  }
})();
