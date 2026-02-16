import React from "react";
import AuthProvider from "@site/src/components/AuthProvider";
import AuthButton from "@site/src/components/AuthButton";
import ChatWidget from "@site/src/components/ChatWidget";
import QuestionnaireModal from "@site/src/components/QuestionnaireModal";

export default function Root({ children }) {
  return (
    <AuthProvider>
      {children}
      <AuthButton />
      <QuestionnaireModal />
      <ChatWidget />
    </AuthProvider>
  );
}
