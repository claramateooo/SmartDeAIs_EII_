
import AboutSeection from "../islands/AboutSeection.tsx";
import InteractiveForm from "../islands/InteractiveForm.tsx";
import Recommendation from "../islands/Recommendation.tsx";
import RecommendationSection from "../islands/RecommendationSection.tsx";


import TestButton from "../islands/TestButton.tsx";
import TipsSection from "../islands/TipsSection.tsx";

export default function Home() {
  return (
    <div class="container">
    <div class="title-container">
      <h1 class="title">SmartDe<span class="highlight">AI</span>s</h1>
      </div>
    
        <InteractiveForm />
        <AboutSeection />
        <RecommendationSection />
        <TipsSection />
        <TestButton />

    </div>
  );
}
