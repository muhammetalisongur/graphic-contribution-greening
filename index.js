import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";

const DATA_FILE_PATH = "./contribution-tracker.json";
const currentDate = moment().format();

const contributionData = {
  date: currentDate,
};

jsonfile.writeFile(DATA_FILE_PATH, contributionData, (error) => {
  if (error) {
    console.error("Error writing data file:", error);
    return;
  }

  console.log("Data written successfully:", contributionData);

  const git = simpleGit();

  git
    .add([DATA_FILE_PATH])
    .commit(currentDate, { "--date": currentDate })
    .push()
    .then(() => console.log("Git operations completed successfully!"))
    .catch((err) => console.error("Git error:", err));
});
