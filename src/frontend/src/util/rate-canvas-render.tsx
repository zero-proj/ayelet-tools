import { Rates } from "@/contexts/rating-context";
// 默认配置
const DEFAULT_CONFIG = {
  canvasWidth: 1425, // 整体 Canvas 宽度
  canvasHeight: 900, // 整体 Canvas 高度 (会根据内容动态调整)
  backgroundColor: "#000000", // 整体背景色

  sidebarWidth: 200, // 左侧边栏宽度
  sidebarItemHeight: 90, // 左侧边栏每个分类的高度
  sidebarTextColor: "#000000",
  sidebarTextFont: "bold 32px Arial",
  sidebarPaddingX: 20, // 侧边栏文字左右内边距

  cardWidth: 280, // 卡片宽度
  cardHeight: 180, // 卡片高度
  cardImageHeight: 120, // 卡片内图片的高度
  cardBorderRadius: 8, // 卡片圆角
  cardMarginX: 20, // 卡片水平间距
  cardMarginY: 20, // 卡片垂直间距
  cardBackgroundColor: "#222222", // 卡片背景色 (图片中是黑色背景，但为了区分，这里用深灰)
  cardTextColor: "#FFFFFF",
  cardTitleFont: "18px Arial",
  cardAuthorFont: "14px Arial",
  cardTextPadding: 10, // 文字距离卡片边缘的内边距

  categoryColors: {
    夯爆了: "#B22222", // FireBrick
    夯: "#DC143C", // Crimson
    顶级: "#FFD700", // Gold
    人上人: "#FFBF00", // Amber
    NPC: "#808080", // Gray
    拉: "#A9A9A9", // DarkGray
    拉完了: "#D3D3D3", // LightGray
  },
  defaultCategoryColor: "#444444", // 默认分类颜色
  imageLoadErrorColor: "#666666", // 图片加载失败时的背景色
  imageLoadErrorText: "Image Load Failed",
};

// 绘制圆角矩形
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function fillEllipsis(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
): number {
  let currentY = y;
  let metrics = ctx.measureText(text + "...");
  const rawTextWidth = metrics.width;

  while (metrics.width > maxWidth) {
    text = text.slice(0, text.length - 1);
    metrics = ctx.measureText(text + "...");
  }
  if (rawTextWidth !== metrics.width) {
    text += "...";
  }
  ctx.fillText(text, x, currentY, maxWidth);

  return y; // 返回最后一行Y坐标
}

interface DrawConfig {
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  sidebarWidth: number;
  sidebarItemHeight: number;
  sidebarTextColor: string;
  sidebarTextFont: string;
  sidebarPaddingX?: number;
  cardWidth: number;
  cardHeight: number;
  cardImageHeight: number;
  cardBorderRadius: number;
  cardMarginX: number;
  cardMarginY: number;
  cardBackgroundColor: string;
  cardTextColor: string;
  cardTitleFont: string;
  cardAuthorFont: string;
  cardTextPadding: number;
  categoryColors: Record<string, string>;
  defaultCategoryColor: string;
  imageLoadErrorColor: string;
  imageLoadErrorText: string;
}

export async function drawRatesToCanvas(
  ratesData: Rates,
  abort?: AbortSignal,
  config?: Partial<DrawConfig>,
): Promise<string> {
  const cfg = { ...DEFAULT_CONFIG, ...config } as DrawConfig;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get 2D rendering context for canvas.");
  }

  const categoryNames = Object.keys(ratesData);
  const numCategories = categoryNames.length;

  // 计算右侧卡片区域的尺寸
  const contentAreaWidth = cfg.canvasWidth - cfg.sidebarWidth;
  const cardsPerRow = Math.floor(
    (contentAreaWidth - cfg.cardMarginX) / (cfg.cardWidth + cfg.cardMarginX),
  );

  // 动态计算 Canvas 高度
  let maxContentHeight = 0;

  for (const categoryName of categoryNames) {
    const items = ratesData[categoryName];

    const numRows = Math.ceil(items.length / cardsPerRow);

    if (numRows === 0) {
      maxContentHeight += 90;
    } else {
      maxContentHeight += numRows * (cfg.cardHeight + cfg.cardMarginY);
    }
  }

  // 确保 Canvas 高度至少能容纳左侧边栏
  canvas.width = cfg.canvasWidth;
  canvas.height = maxContentHeight;

  // 1. 绘制整体背景
  ctx.fillStyle = cfg.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. 绘制左侧分类列表
  let currentSidebarY = 0;
  const sideHeights: Record<string, number> = {};

  for (let i = 0; i < numCategories; i++) {
    const categoryName = categoryNames[i];
    const categoryColor =
      cfg.categoryColors[categoryName] || cfg.defaultCategoryColor;
    const categoryHeighMultipler = Math.ceil(
      ratesData[categoryName].length / cardsPerRow,
    );
    const sideHeight =
      categoryHeighMultipler === 0
        ? 90
        : (cfg.cardHeight + cfg.cardMarginY) * categoryHeighMultipler;

    sideHeights[categoryName] = sideHeight;

    // 绘制分类背景
    ctx.fillStyle = categoryColor;
    ctx.fillRect(0, currentSidebarY, cfg.sidebarWidth, sideHeight);

    // 绘制分类文字
    ctx.fillStyle = cfg.sidebarTextColor;
    ctx.font = cfg.sidebarTextFont;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      categoryName,
      cfg.sidebarWidth / 2,
      currentSidebarY + sideHeight / 2,
    );

    currentSidebarY += sideHeight;
  }

  // 3. 绘制右侧卡片区域
  let currentCardX = cfg.sidebarWidth + cfg.cardMarginX;
  let currentCardY = cfg.cardMarginY;
  let totalCategoryHeight = 10;

  for (const categoryName of categoryNames) {
    const items = ratesData[categoryName];

    // 为每个分类的卡片重新计算起始Y坐标，确保从顶部开始
    currentCardY = totalCategoryHeight;
    let cardsInCurrentRow = 0;

    for (const item of items) {
      abort?.throwIfAborted();
      // 检查是否需要换行
      if (cardsInCurrentRow >= cardsPerRow) {
        currentCardX = cfg.sidebarWidth + cfg.cardMarginX;
        currentCardY += cfg.cardHeight + cfg.cardMarginY;
        cardsInCurrentRow = 0;
      }

      // 绘制卡片背景 (圆角)
      ctx.fillStyle = cfg.cardBackgroundColor;
      drawRoundedRect(
        ctx,
        currentCardX,
        currentCardY,
        cfg.cardWidth,
        cfg.cardHeight,
        cfg.cardBorderRadius,
      );
      ctx.fill();

      // 异步加载并绘制图片
      await new Promise<void>((resolve) => {
        const img = new Image();

        img.crossOrigin = "anonymous"; // 处理跨域图片
        img.src = item.image;

        img.onload = () => {
          // 绘制圆角图片（需要裁剪）
          ctx.save();
          drawRoundedRect(
            ctx,
            currentCardX,
            currentCardY,
            cfg.cardWidth,
            cfg.cardHeight,
            cfg.cardBorderRadius,
          );
          ctx.clip(); // 裁剪区域
          ctx.drawImage(
            img,
            0,
            0,
            cfg.cardWidth,
            cfg.cardHeight,
            currentCardX,
            currentCardY,
            cfg.cardWidth,
            cfg.cardHeight,
          );
          ctx.fillStyle = cfg.cardBackgroundColor;
          ctx.fillRect(
            currentCardX,
            currentCardY + cfg.cardImageHeight + cfg.cardTextPadding + 10,
            cfg.cardWidth,
            currentCardY + cfg.cardImageHeight + cfg.cardTextPadding + 20,
          );
          ctx.restore(); // 恢复裁剪区域
          resolve();
        };

        img.onerror = () => {
          // 绘制图片加载失败的占位符
          ctx.fillStyle = cfg.imageLoadErrorColor;
          ctx.fillRect(
            currentCardX,
            currentCardY,
            cfg.cardWidth,
            cfg.cardImageHeight,
          );
          ctx.fillStyle = cfg.cardTextColor;
          ctx.font = "12px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            cfg.imageLoadErrorText,
            currentCardX + cfg.cardWidth / 2,
            currentCardY + cfg.cardImageHeight / 2,
          );
          resolve();
        };
      });

      // 绘制文字
      const textX = currentCardX + cfg.cardTextPadding;
      const textWidth = cfg.cardWidth - 2 * cfg.cardTextPadding;
      let currentTextY =
        currentCardY + cfg.cardImageHeight + cfg.cardTextPadding + 15;

      // 绘制 title
      ctx.fillStyle = cfg.cardTextColor;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      ctx.font = cfg.cardTitleFont;
      currentTextY = fillEllipsis(
        ctx,
        item.title,
        textX,
        currentTextY + 10,
        textWidth,
      ); // 假设行高20

      // 更新下一个卡片的位置
      currentCardX += cfg.cardWidth + cfg.cardMarginX;
      cardsInCurrentRow++;
    }
    if (items.length === 0) {
      currentCardY += 90;
    }
    // 在每个分类结束后，确保下一个分类的卡片从新的一行开始
    currentCardX = cfg.sidebarWidth + cfg.cardMarginX;
    currentCardY += cfg.cardMarginY; // 确保下一个分类的起始Y坐标是当前分类的最后一行卡片下方
    totalCategoryHeight += sideHeights[categoryName];
  }

  return canvas.toDataURL("image/png");
}
