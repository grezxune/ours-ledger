const DESKTOP_BREAKPOINT_PX = 1024;

/**
 * Returns true when entity tabs should collapse into the section menu.
 */
export function shouldCollapseEntityTabs(
  viewportWidth: number,
  navScrollWidth: number,
  containerWidth: number,
): boolean {
  if (viewportWidth < DESKTOP_BREAKPOINT_PX) {
    return false;
  }

  return navScrollWidth > containerWidth + 1;
}
