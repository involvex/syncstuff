"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cn = cn;
exports.extractLayoutProps = extractLayoutProps;
const clsx_1 = require("clsx");
const tailwind_merge_1 = require("tailwind-merge");
function cn(...inputs) {
  return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
function parseValue(val) {
  if (val === undefined) return undefined;
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    if (val.startsWith("$")) {
      const token = val.substring(1);
      // Heuristic for spacing tokens: $4 -> 1rem
      const num = parseFloat(token);
      if (!isNaN(num)) {
        return `${num * 0.25}rem`;
      }
      // Common tokens mapping if num is NaN (like $color)
      return `var(--${token})`;
    }
    return val;
  }
  return val;
}
function extractLayoutProps(props) {
  const {
    padding,
    paddingHorizontal,
    paddingVertical,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    margin,
    marginHorizontal,
    marginVertical,
    marginLeft,
    marginRight,
    marginTop,
    marginBottom,
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    backgroundColor,
    borderRadius,
    borderWidth,
    borderColor,
    space,
    elevation,
    opacity,
    flex,
    flexDirection,
    flexWrap,
    alignItems,
    justifyContent,
    position,
    top,
    bottom,
    left,
    right,
    bordered,
    elevate,
    theme,
    separator,
    color,
    fontSize,
    fontWeight,
    textAlign,
    textTransform,
    fontFamily,
    animation,
    scale,
    hoverStyle,
    pressStyle,
    focusStyle,
    enterStyle,
    exitStyle,
    ...rest
  } = props;
  const style = {};
  if (padding !== undefined) style.padding = parseValue(padding);
  if (paddingHorizontal !== undefined) {
    style.paddingLeft = parseValue(paddingHorizontal);
    style.paddingRight = parseValue(paddingHorizontal);
  }
  if (paddingVertical !== undefined) {
    style.paddingTop = parseValue(paddingVertical);
    style.paddingBottom = parseValue(paddingVertical);
  }
  if (paddingLeft !== undefined) style.paddingLeft = parseValue(paddingLeft);
  if (paddingRight !== undefined) style.paddingRight = parseValue(paddingRight);
  if (paddingTop !== undefined) style.paddingTop = parseValue(paddingTop);
  if (paddingBottom !== undefined)
    style.paddingBottom = parseValue(paddingBottom);
  if (margin !== undefined) style.margin = parseValue(margin);
  if (marginHorizontal !== undefined) {
    style.marginLeft = parseValue(marginHorizontal);
    style.marginRight = parseValue(marginHorizontal);
  }
  if (marginVertical !== undefined) {
    style.marginTop = parseValue(marginVertical);
    style.marginBottom = parseValue(marginVertical);
  }
  if (marginLeft !== undefined) style.marginLeft = parseValue(marginLeft);
  if (marginRight !== undefined) style.marginRight = parseValue(marginRight);
  if (marginTop !== undefined) style.marginTop = parseValue(marginTop);
  if (marginBottom !== undefined) style.marginBottom = parseValue(marginBottom);
  if (width !== undefined) style.width = parseValue(width);
  if (height !== undefined) style.height = parseValue(height);
  if (minWidth !== undefined) style.minWidth = parseValue(minWidth);
  if (minHeight !== undefined) style.minHeight = parseValue(minHeight);
  if (maxWidth !== undefined) style.maxWidth = parseValue(maxWidth);
  if (maxHeight !== undefined) style.maxHeight = parseValue(maxHeight);
  if (backgroundColor) style.backgroundColor = parseValue(backgroundColor);
  if (borderRadius) style.borderRadius = parseValue(borderRadius);
  if (space !== undefined) style.gap = parseValue(space);
  if (alignItems) style.alignItems = alignItems;
  if (justifyContent) style.justifyContent = justifyContent;
  if (flexDirection) style.flexDirection = flexDirection;
  if (flexWrap) style.flexWrap = flexWrap;
  if (flex !== undefined) style.flex = flex;
  if (position) style.position = position;
  if (top !== undefined) style.top = parseValue(top);
  if (bottom !== undefined) style.bottom = parseValue(bottom);
  if (left !== undefined) style.left = parseValue(left);
  if (right !== undefined) style.right = parseValue(right);
  if (elevation)
    style.boxShadow = `0px ${elevation}px ${elevation * 2}px rgba(0,0,0,0.1)`;
  if (elevate) style.boxShadow = `0px 2px 4px rgba(0,0,0,0.1)`;
  if (bordered) {
    style.borderWidth = "1px";
    style.borderColor = "var(--border, #e2e8f0)";
    style.borderStyle = "solid";
  }
  if (borderWidth) style.borderWidth = borderWidth;
  if (borderColor) style.borderColor = parseValue(borderColor);
  // Text props
  if (color) style.color = parseValue(color);
  if (fontSize) style.fontSize = parseValue(fontSize);
  if (fontWeight) style.fontWeight = fontWeight;
  if (textAlign) style.textAlign = textAlign;
  if (textTransform) style.textTransform = textTransform;
  if (fontFamily) style.fontFamily = fontFamily;
  if (opacity !== undefined) style.opacity = opacity;
  return { style, restProps: rest };
}
//# sourceMappingURL=utils.js.map
