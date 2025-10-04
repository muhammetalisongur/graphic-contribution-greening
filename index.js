import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";

const DATA_FILE = "./contribution-tracker.json";

const YEAR = 2025;
// Contribution patterns: week number (1-52), day of week (0=Sunday, 1=Monday...6=Saturday), commit count
const patterns = [
  { week: 1, day: 0, commits: 3 }, // Week 1, Sunday, 3 commits
  { week: 1, day: 2, commits: 2 }, // Week 1, Tuesday, 2 commits
  { week: 2, day: 0, commits: 1 }, // Week 2, Sunday, 1 commit
  { week: 2, day: 5, commits: 4 }, // Week 2, Friday, 4 commits
  { week: 3, day: 2, commits: 2 }  // Week 3, Tuesday, 2 commits
];

function getTargetDate(year, weekNumber, dayOfWeek) {
  const startOfYear = moment().year(year).dayOfYear(1);
  const firstWeek = startOfYear.clone().startOf('week');

  if (firstWeek.year() < year) {
    firstWeek.add(1, 'week');
  }

  return firstWeek
    .add(weekNumber - 1, 'weeks')
    .add(dayOfWeek, 'days');
}

async function writeData(data) {
  return new Promise((resolve, reject) => {
    jsonfile.writeFile(DATA_FILE, data, (error) => {
      error ? reject(error) : resolve();
    });
  });
}

async function makeCommits(targetDate, count, week, day) {
  const git = simpleGit();

  console.log(`Making ${count} commits for ${targetDate.format('YYYY-MM-DD')} (Week ${week}, Day ${day})`);

  for (let i = 1; i <= count; i++) {
    const commitTime = targetDate.clone().add(i * 30, 'minutes');

    const data = {
      date: commitTime.format(),
      week,
      day,
      commit: i,
      total: count
    };

    await writeData(data);

    await git
      .add([DATA_FILE])
      .commit(`feat: w${week}d${day} commit ${i}`, {
        "--date": commitTime.format()
      });

    console.log(`  Commit ${i}/${count} done`);
  }
}

async function generateContributions() {
  const git = simpleGit();

  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    const targetDate = getTargetDate(YEAR, pattern.week, pattern.day);

    console.log(`[${i + 1}/${patterns.length}] Processing week ${pattern.week}, day ${pattern.day}`);

    await makeCommits(targetDate, pattern.commits, pattern.week, pattern.day);
    console.log("");
  }

  console.log("Pushing to remote...");
  await git.push();
  console.log("Done!");
}

generateContributions()
  .catch(err => console.error("Error:", err));
