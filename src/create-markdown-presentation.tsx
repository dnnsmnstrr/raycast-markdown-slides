import { Form, ActionPanel, Action, showToast, getPreferenceValues, Cache, launchCommand, LaunchType, ToastStyle, Toast } from "@raycast/api";
import fs from "fs";
import path from "path";

type Values = {
  title: string;
  firstPage: string;
};

interface Preferences {
  slidesDirectory: string;
}

const preferences = getPreferenceValues<Preferences>();
const cache = new Cache();

export default function Command() {
  function handleSubmit(values: Values) {
    const { title, firstPage } = values;
    const fileName = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`;
    const filePath = path.join(preferences.slidesDirectory.replace("~", process.env.HOME || ""), fileName);

    const content = `# ${title}\n\n${firstPage}\n\n---\n\nNew Page`;

    try {
      fs.writeFileSync(filePath, content);
      cache.set("selectedSlides", fileName);
      launchCommand({ name: "preview-markdown-slides", type: LaunchType.UserInitiated, context: { file: fileName } });
      showToast({ title: "Presentation created", message: `File saved as ${fileName}` });
    } catch (error) {
      console.error("Error writing file:", error);
      showToast({ title: "Error", message: "Failed to create presentation", style: Toast.Style.Failure });
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description text="Create a new markdown slides presentation" />
      <Form.TextField id="title" title="Presentation Title" placeholder="Enter presentation title" />
      <Form.TextArea id="firstPage" title="First Page Content" placeholder="Enter content for the first page" />
    </Form>
  );
}
