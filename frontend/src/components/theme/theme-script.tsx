export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var k='dio-theme';var t=localStorage.getItem(k);var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.classList.toggle('light',!d);document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){}})();`,
      }}
    />
  );
}
