import { Action, ActionPanel, Detail, open, showInFinder } from "@raycast/api";
import { useState } from "react";
import fs from 'fs';
import path from 'path';

interface SlideProps {
  slide: string;
  filePath: string;
  nextSlide: () => void;
  prevSlide: () => void;
}

function openFile(filePath: string, finder = false) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (error) {
      console.error("Error creating directory:", error);
      return;
    }
  }

  if (!fs.existsSync(filePath)) {
    try {
      fs.writeFileSync(filePath, "# New Presentation\n\nStart writing your slides here.");
    } catch (error) {
      console.error("Error writing file:", error);
      return;
    }
  }

  if (finder) {
    showInFinder(filePath);
  } else {
    open(filePath);
  }
}

function Slide({ slide, nextSlide, prevSlide, filePath }: SlideProps) {
  return (
    <Detail
      markdown={slide}
      actions={
        <ActionPanel>
         <ActionPanel.Section title="Navigate">
          <Action title="Next" shortcut={{ modifiers: [], key: "arrowRight" }} onAction={() => nextSlide()} />
          <Action title="Prev" shortcut={{ modifiers: [], key: "arrowLeft" }} onAction={() => prevSlide()} />
         </ActionPanel.Section>
         <Action title="Open in Finder" shortcut={{ modifiers: ['cmd'], key: "o" }} onAction={() => openFile(filePath)} />
         <Action title="Edit Source" shortcut={{ modifiers: ['cmd'], key: "e" }} onAction={() => openFile(filePath)} />
        </ActionPanel>
      }
    />
  );
}

const DEFAULT_PATH = `${process.env.HOME}/slides/index.md`
const PAGE_SEPARATOR = '---'

export default function Command() {
  let markdown =  "No Markdown slides found. Place your content at `~/slides/index.md`";
  try {
    markdown = fs.readFileSync(DEFAULT_PATH, "utf-8")
  } catch (error) {
    console.log(error)
  }
  const slides = markdown.split(PAGE_SEPARATOR);
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return <Slide slide={slides[currentSlide]} nextSlide={nextSlide} prevSlide={prevSlide} filePath={DEFAULT_PATH} />;
}