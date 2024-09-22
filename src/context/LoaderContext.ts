import { Dispatch, SetStateAction, createContext } from "react";

export class LoaderContextProps {
  private loaderIsVisible: boolean;
  private readonly setLoaderIsVisible: Dispatch<SetStateAction<boolean>>;
  private readonly setLoaderMessage: Dispatch<SetStateAction<string>>;

  constructor(
    loaderIsVisible = false,
    setLoaderIsVisible: Dispatch<SetStateAction<boolean>> = () => false,
    setLoaderMessage: Dispatch<SetStateAction<string>> = () => ""
  ) {
    this.loaderIsVisible = loaderIsVisible;
    this.setLoaderIsVisible = setLoaderIsVisible;
    this.setLoaderMessage = setLoaderMessage;
  }

  show(message = "") {
    this.setLoaderIsVisible(true);
    this.setLoaderMessage(message);
  }

  hide() {
    this.setLoaderIsVisible(false);
  }

  get isVisible() {
    return this.loaderIsVisible;
  }
}

export const LoaderContext = createContext(new LoaderContextProps());
