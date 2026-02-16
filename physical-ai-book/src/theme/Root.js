import React from "react";
import AuthProvider from "@site/src/components/AuthProvider";
import { PersonalizationProvider } from "@site/src/components/PersonalizationProvider";
import AuthButton from "@site/src/components/AuthButton";
import { PersonalizationButton } from "@site/src/components/PersonalizationButton";
import ChatWidget from "@site/src/components/ChatWidget";
import QuestionnaireModal from "@site/src/components/QuestionnaireModal";
import { ContentVariant } from "@site/src/components/ContentVariant";

export default function Root({ children }) {
  return (
    <AuthProvider>
      <PersonalizationProvider>
        {children}
        <AuthButton />
        <PersonalizationButton />
        <QuestionnaireModal />
        <ChatWidget />
      </PersonalizationProvider>
    </AuthProvider>
  );
}
