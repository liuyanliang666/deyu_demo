import { createContext, type Dispatch, type SetStateAction } from "react";

export const AuthContext = createContext<{
  phone: string;
  verificationCode: string;
  password: string;
  setPhone: Dispatch<SetStateAction<string>>;
  setverificationCode: Dispatch<SetStateAction<string>>;
  setPassword: Dispatch<SetStateAction<string>>;
}>({
  phone: "",
  verificationCode: "",
  password: "",
  setPhone: () => {},
  setverificationCode: () => {},
  setPassword: () => {},
});
