import React from "react";
import AuthProvider from "@site/src/components/AuthProvider";
import AuthButton from "@site/src/components/AuthButton";
import ChatWidget from "@site/src/components/ChatWidget";
import QuestionnaireModal from "@site/src/components/QuestionnaireModal";
import TranslationProvider from "@site/src/components/TranslationProvider";
import TranslationButton from "@site/src/components/TranslationButton";

export default function Root({ children }) {
  return (
    <TranslationProvider>
      <AuthProvider>
        {children}
        <AuthButton />
        <TranslationButton />
        <QuestionnaireModal />
        <ChatWidget />
      </AuthProvider>
    </TranslationProvider>
  );
}
