import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

const TitleContext = createContext(
  null! as {
    title: string;
    pageName: string;
    setPageName: (value: string) => void;
  },
);

export const useTitle = () => useContext(TitleContext);

export function TitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState<string>(null!);
  const [subTitle, setSubTitle] = useState("");
  const currentTitle = `${title} - ${subTitle}`;

  useEffect(() => {
    if (!title) {
      if (window.location.hostname === "tools.ayelet.cn") {
        setTitle("玩伊会工具箱");
      } else {
        setTitle("ZeroAsh工具箱");
      }
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = currentTitle;
    }
  }, [currentTitle]);

  return (
    <TitleContext.Provider
      value={{ title, pageName: subTitle, setPageName: setSubTitle }}
    >
      {children}
    </TitleContext.Provider>
  );
}
