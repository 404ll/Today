import { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}
interface Props {
  children: React.ReactNode;
}

//定义context的结构和初始值
export const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

//定义context的提供者
export const ThemeProvider = (props: Props) => {
  const children = props.children;
  const [theme, setTheme] = useState<"light" | "dark">("light"); //默认为light
  //       // 从 localStorage 读取保存的主题，如果没有则默认为 'light'
  //   const [theme, setTheme] = useState<'light' | 'dark'>(() => {
  //     const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
  //     return savedTheme || 'light';
  //   });

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  //应用主题到DOM
  useEffect(() => {
    const root = document.documentElement; //获取根元素
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // 持久化主题到 localStorage
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  //返回函数和状态
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

//自定义Hook
export const useTheme = () => {
  const context = useContext(ThemeContext); //获取context
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
