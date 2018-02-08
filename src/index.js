import axios from 'axios';
import { API_BASE } from './constants';

const isValidRepoName = (repo) => {
  //  [a-zA-Z0-9-]+  username is alpanumeric or hyphen only
  //  \/  username and reponame are separated by "\"
  //  [a-zA-Z0-9-_]+  reponame is alphanumeric or hyphen or underscore only
  const validRepoRegex = /^[a-zA-Z0-9-]+\/[a-zA-Z0-9-_]+$/;
  return (typeof repo === 'string' && validRepoRegex.test(repo));
};

module.exports = (repo) => {
  if (!isValidRepoName(repo)) {
    return Promise.reject(new Error('Invalid Argument: Must be called with a valid repo name'));
  }
  const url = `${API_BASE}/${repo}/commits`;

  return axios.get(url)
    .then((response) => {
      if (!response || !Array.isArray(response.data)) {
        throw new Error('Data received from Github came in unexpected format');
      }
      const commitDates = response.data.map((commit) => {
        if (!commit.commit || !commit.commit.author || !commit.commit.author.date) {
          throw new Error('Data received from Github came in unexpected format');
        }
        return commit.commit.author.date;
      });
      return commitDates.sort((a, b) => b.localeCompare(a))[0];
    })
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(`${error.response.status} ${error.response.data.message}`);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        throw new Error('A request was made but no response was received');
      }
      // Something happened in setting up the request that triggered an Error
      throw new Error(error.message);
    });
};
