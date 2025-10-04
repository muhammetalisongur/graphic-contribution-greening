import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";

const DATA_FILE = "./contribution-tracker.json";

const YEAR = 2025;
/**
 * Contribution patterns configuration:
 *
 * week: 1-52 (specific week) or "all" (all weeks)
 * day: 0-6 (0=Sunday...6=Saturday) or "all" (all days)
 * commits: Number of commits to create
 *
 * Examples:
 * { week: "all", day: "all", commits: 1 }  → Every day of the year, 1 commit
 * { week: "all", day: 1, commits: 2 }      → Every Monday, 2 commits
 * { week: 5, day: "all", commits: 1 }      → Week 5 all days, 1 commit each
 * { week: 10, day: 3, commits: 5 }         → Week 10 Wednesday, 5 commits
 */
const patterns = [
  { week: 5, day: "all", commits: 1 },
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

function expandPatterns(patterns) {
  const expandedPatterns = [];

  for (const pattern of patterns) {
    if (pattern.week === "all" && pattern.day === "all") {
      // Generate patterns for all weeks and all days
      for (let week = 1; week <= 52; week++) {
        for (let day = 0; day <= 6; day++) {
          expandedPatterns.push({
            week: week,
            day: day,
            commits: pattern.commits
          });
        }
      }
    } else if (pattern.week === "all") {
      // Generate patterns for all weeks, specific day
      for (let week = 1; week <= 52; week++) {
        expandedPatterns.push({
          week: week,
          day: pattern.day,
          commits: pattern.commits
        });
      }
    } else if (pattern.day === "all") {
      // Generate patterns for specific week, all days
      for (let day = 0; day <= 6; day++) {
        expandedPatterns.push({
          week: pattern.week,
          day: day,
          commits: pattern.commits
        });
      }
    } else {
      // Add normal pattern as-is
      expandedPatterns.push(pattern);
    }
  }

  return expandedPatterns;
}

async function generateContributions() {
  const git = simpleGit();
  const expandedPatterns = expandPatterns(patterns);

  console.log(`Total patterns to process: ${expandedPatterns.length}`);

  let currentWeek = null;

  for (let i = 0; i < expandedPatterns.length; i++) {
    const pattern = expandedPatterns[i];
    const targetDate = getTargetDate(YEAR, pattern.week, pattern.day);

    console.log(`[${i + 1}/${expandedPatterns.length}] Processing week ${pattern.week}, day ${pattern.day}`);

    await makeCommits(targetDate, pattern.commits, pattern.week, pattern.day);

    // Add line break when week changes for better readability
    if (currentWeek !== null && currentWeek !== pattern.week) {
      console.log("");
    }
    currentWeek = pattern.week;
  }

  console.log("Pushing to remote...");
  await git.push();
  console.log("Done!");
}

generateContributions()
  .catch(err => console.error("Error:", err));
