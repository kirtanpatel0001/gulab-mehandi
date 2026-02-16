import Image from "next/image";
import Hero from "@/components/home/Hero";
import HeritageSection from "@/components/home/HeritageSection";
import CollectionSection from "@/components/home/CollectionSection";
import BridalExperience from "@/components/home/BridalExperience"; 
import MuseSection from "@/components/home/MuseSection"; 
import EpilogueSection from "@/components/home/EpilogueSection"; // Add this import

export default function Home() {
  return (
    <div>
      <Hero />
      <HeritageSection />
      <CollectionSection />
      <BridalExperience />
      <MuseSection />
      <EpilogueSection /> {/* Add this line */}
    </div>
  );
}