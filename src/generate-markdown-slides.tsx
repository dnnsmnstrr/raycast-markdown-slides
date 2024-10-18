import { Action, ActionPanel, AI, Cache, Detail, getPreferenceValues, Icon, launchCommand, LaunchProps, LaunchType, showToast, Toast } from "@raycast/api";
import { useAI } from "@raycast/utils";
import fs from "fs";
import path from "path";

const preferences = getPreferenceValues<Preferences>();
const cache = new Cache();

export default function Command(props: LaunchProps<{ arguments: Arguments.GenerateMarkdownSlides }>) {
  const PROMPT = `Generate a presentation in markdown format about the topic: "${props.arguments.topic}". Each slide should be separated by a horizontal ruler (---). Include the following elements in the presentation:
  
  1. **Title Slide**: The title of the presentation.
  2. **Introduction Slide**: A brief introduction to the topic.
  3. **Content Slides**: At least three content slides covering key points, statistics, or arguments related to the topic. Use bullet points for clarity.
  4. **Conclusion Slide**: A summary of the main points discussed and any final thoughts.
  5. **References Slide**: A slide listing any sources or references used in the presentation. If you include links, be very sure that they will actually be available.
  
  Make sure to format the text appropriately for Marp, using headers for slide titles and bullet points for lists. 
  Do not output anything other than the presentation content and do not add a markdown code block around the content.
  You can add more than two main slides, but only if it is really necessary to explain something with more context.

  Here's the format you should follow:

  # Slide Title

  Content goes here.

  ---

  # Next Slide Title

  Content goes here.

  ---

  # Conclusion

  Summary of the main points.

  # References

	1.	Reference 1
	2.	Reference 2
  `

  const { data, isLoading } = useAI(PROMPT, { creativity: props.arguments.creativity || 1, model: AI.Model.OpenAI_GPT4o });

  function createSlides() {
    const fileName = `${props.arguments.topic.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`;
    const filePath = path.join(preferences.slidesDirectory.replace("~", process.env.HOME || ""), fileName);

    try {
      fs.writeFileSync(filePath, data);
      cache.set("selectedSlides", fileName);
      launchCommand({ name: "preview-markdown-slides", type: LaunchType.UserInitiated, context: { file: fileName } });
      showToast({ title: "Presentation created", message: `File saved as ${fileName}` });
    } catch (error) {
      console.error("Error writing file:", error);
      showToast({ title: "Error", message: "Failed to create presentation", style: Toast.Style.Failure });
    }
  }
  return <Detail isLoading={isLoading} markdown={data} actions={<ActionPanel title="#1 in raycast/extensions">
    <Action title="Create Presentation" onAction={createSlides} icon={Icon.NewDocument} />
    <Action.CopyToClipboard content={data} shortcut={{ modifiers: ["cmd"], key: "c" }}/>
  </ActionPanel>} />;
}