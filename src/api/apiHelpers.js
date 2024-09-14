import axios from "axios";
import { config } from "dotenv";

//TODO: get profile image from git, set that as main image file

// Load API key
config();
const apiKey = process.env.GH_API_ACCESS_TOKEN;

// Query wrappers
async function graphqlQuery(query, variables = {}) {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });
  const data = await response.json();
  return data;
}

async function restQuery(extensionPath, returnCallback) {
  return axios
    .get(`https://api.github.com/${extensionPath}`, {
      headers: { Authorization: `token ${apiKey}` },
    })
    .then(returnCallback)
    .catch((error) => {
      console.error(
        `Request failed with status code ${error.response ? error.response.status : "unknown"}`
      );
    });
}

// Read Github data & write to JSON
export default async function compileAndWriteGHData() {
  const { diskUsage } = await getUserInfo();
  const diskUsageMB = (diskUsage / 1000).toFixed(2);

  const totalContributions = await computeTotalContributions();
  const fetchAllLinesModified = await computeTotalLinesModified();
  console.log(totalContributions, diskUsageMB, fetchAllLinesModified);
}

async function computeTotalContributions() {
  const startYear = 2022;
  const currentYear = new Date().getFullYear();

  let total = 0;
  for (let year = startYear; year <= currentYear; year++) {
    const yearlyContributions = await getYearlyContributions(year);

    total += yearlyContributions;
  }

  const missingCommits = 20; // api is missing some amount of contributions
  return total + missingCommits;
}

async function getYearlyContributions(year) {
  const commitsQuery = `
    query($from: DateTime!, $to: DateTime!) {
      viewer {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
          }
        }
      }
    }
  `;

  const fromDate = `${year}-01-01T00:00:00Z`;
  const toDate = `${year + 1}-01-01T00:00:00Z`;

  try {
    const rawCommits = await graphqlQuery(commitsQuery, {
      from: fromDate,
      to: toDate,
    });

    const totalContributions =
      rawCommits.data.viewer.contributionsCollection.contributionCalendar
        .totalContributions;

    return totalContributions;
  } catch (error) {
    console.error("Error fetching data:", error);
    return 0;
  }
}

async function computeTotalLinesModified() {
  let totalLinesModified = 0;
  let page = 1;
  const perPage = 100;

  while (true) {
    const repos = await restQuery(
      `user/repos?page=${page}&per_page=${perPage}`,
      (response) => response.data
    );

    if (repos.length === 0) {
      break;
    }

    for (const repo of repos) {
      const stats = await restQuery(
        `repos/${repo.full_name}/stats/contributors`,
        (response) => response.data
      );

      if (Array.isArray(stats)) {
        for (const contributor of stats) {
          if (contributor.author.login === repo.owner.login) {
            for (const week of contributor.weeks) {
              totalLinesModified += week.a + week.d;
            }
          }
        }
      }
    }

    page++;
  }

  return totalLinesModified;
}

async function getUserInfo() {
  const returnCallback = (response) => {
    return {
      diskUsage: response.data.disk_usage,
    };
  };

  const { diskUsage } = await restQuery("user", returnCallback);

  return { diskUsage };
}
