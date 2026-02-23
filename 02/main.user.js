// ==UserScript==
// @name         Bangumi → Mikan & 搜索引擎
// @namespace    https://github.com/ziyii01/Script-by-ziyii
// @version      1.3
// @description  在 Bangumi 条目页标题旁添加下拉按钮，可跳转至 mikanime.tv 或 mikanani.me 的搜索结果，以及搜索引擎
// @author       ziyii
// @match        https://bgm.tv/subject/*
// @icon         https://bgm.tv/img/favicon.ico
// @grant        none
// @updateURL    https://raw.githubusercontent.com/ziyii01/Script-by-ziyii/main/02/main.user.js
// @downloadURL  https://raw.githubusercontent.com/ziyii01/Script-by-ziyii/main/02/main.user.js
// @license      GNU AFFERO GENERAL PUBLIC LICENSE
// ==/UserScript==

(function () {
  "use strict";

  // 获取页面主标题容器（包含条目名称）
  const h1 = document.querySelector("#headerSubject h1");
  if (!h1) return;

  // 提取动画名称（来自带有语义属性的 <a> 标签）
  const titleLink = h1.querySelector('a[property="v:itemreviewed"]');
  let animeName = titleLink?.getAttribute("title")?.trim();
  // 若 title 属性不存在，则使用文本内容作为名称
  if (!animeName) {
    animeName = titleLink?.textContent?.trim();
  }
  if (!animeName) return;

  // 对名称进行 URL 编码，用于安全拼接搜索链接
  const encodedName = encodeURIComponent(animeName);

  // 定义要跳转的 Mikan 站点和搜索引擎
  const sites = [
    {
      name: "mikanani.me",
      url: `https://mikanani.me/Home/Search?searchstr=${encodedName}`,
      category: "mikan",
    },
    {
      name: "mikanime.tv",
      url: `https://mikanime.tv/Home/Search?searchstr=${encodedName}`,
      category: "mikan",
    },
    {
      name: "Google",
      url: `https://www.google.com/search?q=${encodedName}`,
      category: "search",
    },
    {
      name: "Bing",
      url: `https://www.bing.com/search?q=${encodedName}`,
      category: "search",
    },
    {
      name: "百度",
      url: `https://www.baidu.com/s?wd=${encodedName}`,
      category: "search",
    },
    {
      name: "本项目 GitHub",
      url: "https://github.com/ziyii01/bangumi-bt-search-button",
      category: "other",
    },
  ];

  // 创建包裹容器（用于定位下拉菜单）
  const container = document.createElement("div");
  container.style.cssText = `
    position: relative;
    display: inline-block;
    margin-left: 12px;
    vertical-align: middle;
  `;

  // 主按钮：点击展开下拉菜单
  const mainButton = document.createElement("button");
  mainButton.textContent = "🔍 搜索 ▼";
  mainButton.style.cssText = `
    padding: 4px 8px;
    background-color: #ff6f61;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 13px;
    font-weight: bold;
    cursor: pointer;
    outline: none;
  `;

  // 下拉菜单容器
  const dropdown = document.createElement("div");
  dropdown.style.cssText = `
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 4px;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    z-index: 1000;
    display: none;
    min-width: 140px;
  `;

  // 为每个站点生成一个可点击的菜单项
  sites.forEach((site) => {
    const item = document.createElement("a");
    item.href = site.url;
    item.target = "_blank";
    item.rel = "noopener noreferrer";
    // 根据类别设置不同的图标
    let icon;
    if (site.category === "mikan") {
      icon = "🔍";
    } else if (site.category === "search") {
      icon = "🌐";
    } else {
      icon = "📦";
    }
    item.textContent = `${icon} ${site.name}`;
    item.style.cssText = `
      display: block;
      padding: 6px 12px;
      text-decoration: none;
      color: #333;
      font-size: 13px;
      white-space: nowrap;
      cursor: pointer;
    `;

    // 鼠标悬停高亮效果
    item.addEventListener(
      "mouseenter",
      () => (item.style.backgroundColor = "#f0f0f0"),
    );
    item.addEventListener(
      "mouseleave",
      () => (item.style.backgroundColor = "white"),
    );

    dropdown.appendChild(item);
  });

  // 控制下拉菜单的显示/隐藏
  let isOpen = false;
  mainButton.addEventListener("click", (e) => {
    e.stopPropagation();
    isOpen = !isOpen;
    dropdown.style.display = isOpen ? "block" : "none";
  });

  // 点击页面任意位置关闭下拉菜单
  document.addEventListener("click", () => {
    if (isOpen) {
      isOpen = false;
      dropdown.style.display = "none";
    }
  });

  // 将按钮和下拉菜单插入到标题末尾
  container.appendChild(mainButton);
  container.appendChild(dropdown);
  h1.appendChild(container);
})();
