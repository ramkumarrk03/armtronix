export type ThemeName = "bench" | "sheet";

export const THEME_STORAGE_KEY = "armtronix-theme";

/**
 * Runs before first paint so the stored theme is applied without a flash.
 * Bench (dark) is the default; we deliberately ignore the OS preference
 * because Bench mode is the brand's primary expression.
 */
export const themeInitScript = `(function(){var d=document.documentElement;try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");d.setAttribute("data-theme",t==="sheet"?"sheet":"bench");}catch(e){d.setAttribute("data-theme","bench");}try{if(sessionStorage.getItem("armtronix-booted")!=="1"&&!matchMedia("(prefers-reduced-motion: reduce)").matches){d.classList.add("boot-pending");}}catch(e){}})();`;
