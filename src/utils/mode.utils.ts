import { getModeUserPrefers, modeCurrent, setModeCurrent, setModeUserPrefers } from "@skeletonlabs/skeleton";

export function initMode() {

  modeCurrent.subscribe((isLight) => {
    const color = isLight ? "#FAf8FC" : "#120B18";
    const themeColorMetaTag = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    if (!themeColorMetaTag) {
      const metaTag = document.createElement("META") as HTMLMetaElement;
      metaTag.name = "theme-color";
      metaTag.content = color;
      document.head.append(metaTag);
    } else {
      themeColorMetaTag.content = color;
    }
  })

  const userPrefers = getModeUserPrefers();
  if (userPrefers === undefined) {
    setModeCurrent(false);
    setModeUserPrefers(false);
  } else {
    setModeCurrent(userPrefers);
  }
}