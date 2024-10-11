import { ActionPanel, Action, Icon, List, Cache, getPreferenceValues, LaunchType, launchCommand } from "@raycast/api";
import fs from "fs";
import path from "path";

interface Preferences {
  slidesDirectory: string;
}

const preferences = getPreferenceValues<Preferences>();
const cache = new Cache();

function getMarkdownFiles(directory: string): string[] {
  const files = fs.readdirSync(directory);
  return files.filter((file) => path.extname(file).toLowerCase() === ".md");
}

export default function Command() {
  const slidesDir = preferences.slidesDirectory.replace("~", process.env.HOME || "");
  const markdownFiles = getMarkdownFiles(slidesDir);

  return (
    <List>
      {markdownFiles.map((file) => (
        <List.Item
          key={file}
          icon={Icon.Document}
          title={path.basename(file, ".md")}
          subtitle={file}
          actions={
            <ActionPanel>
              <Action
                title="Select File"
                icon={Icon.Download}
                onAction={() => {
                  cache.set('selectedSlides', file);
                  launchCommand({ name: "preview-markdown-slides", type: LaunchType.UserInitiated, context: { file } });
                }}
              />
              <Action.OpenWith path={path.join(slidesDir, file)} />
              <Action.ShowInFinder path={path.join(slidesDir, file)} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
